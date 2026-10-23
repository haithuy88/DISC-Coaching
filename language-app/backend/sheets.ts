// Đọc/ghi Google Sheets: người dùng, tiến độ (kiêm báo cáo), nhật ký gọi AI.
import { ProfileSchema, type Profile } from '../shared/api.ts';
import { findLanguage } from '../shared/languages.ts';
import { currentStreak, skillAverages } from '../shared/stats.ts';

export const TZ = 'Asia/Ho_Chi_Minh';

export const TABS = {
  users: {
    name: 'NGUOI_DUNG',
    headers: ['Mã truy cập', 'Họ tên', 'Nhóm', 'Trạng thái', 'Giới hạn AI/ngày', 'Ghi chú', 'Ngày tạo'],
  },
  progress: {
    name: 'TIEN_DO',
    headers: [
      'Mã truy cập', 'Họ tên', 'Nhóm', 'Ngôn ngữ', 'Level', 'XP', 'Chuỗi ngày', 'Nghe', 'Nói', 'Đọc', 'Viết',
      'Hội thoại', 'Hoạt động gần nhất', 'Dữ liệu (không sửa)',
    ],
  },
  log: {
    name: 'NHAT_KY_AI',
    headers: ['Thời gian', 'Mã truy cập', 'Họ tên', 'Ngôn ngữ', 'Loại', 'Level', 'Điểm', 'Level thể hiện', 'Token vào', 'Token ra', 'Kết quả'],
  },
  guide: { name: 'HUONG_DAN', headers: ['Hướng dẫn quản trị'] },
} as const;

const GUIDE_LINES = [
  'Thêm người học: ghi Họ tên + Nhóm (Nhân viên / Người thân) vào tab NGUOI_DUNG, để trống cột Mã, rồi chọn menu Polyglot → Tạo mã truy cập.',
  'Gửi mã cho người học. Họ nhập mã một lần trên app là vào học được.',
  'Khoá người dùng: đổi Trạng thái thành "Khoá". Mở lại: "Hoạt động".',
  'Giới hạn AI/ngày: số lần chấm bài + lượt hội thoại tối đa mỗi ngày (để trống = 60). Dùng để kiểm soát chi phí.',
  'TIEN_DO: mỗi người × mỗi ngôn ngữ một dòng, tự cập nhật khi người học học. Đây là bảng báo cáo — lọc/sắp xếp thoải mái, nhưng đừng sửa cột "Dữ liệu".',
  'NHAT_KY_AI: mỗi lần gọi AI một dòng, kèm số token để ước tính chi phí.',
  'API key: Cài đặt dự án Apps Script → Thuộc tính tập lệnh → ANTHROPIC_API_KEY. Đổi model: thêm CLAUDE_MODEL (vd. claude-haiku-5-5).',
];

export const DEFAULT_DAILY_LIMIT = 60;

export interface User {
  code: string;
  name: string;
  group: string;
  active: boolean;
  dailyLimit: number;
}

function book() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function tab(def: { name: string }): GoogleAppsScript.Sheet {
  const sheet = book().getSheetByName(def.name);
  if (!sheet) throw new Error(`Thiếu tab ${def.name}. Hãy chạy hàm setup một lần.`);
  return sheet;
}

/** Mọi dòng dữ liệu (bỏ dòng tiêu đề). */
function rows(sheet: GoogleAppsScript.Sheet, width: number): unknown[][] {
  const last = sheet.getLastRow();
  return last < 2 ? [] : sheet.getRange(2, 1, last - 1, width).getValues();
}

function appendRow(sheet: GoogleAppsScript.Sheet, row: unknown[]): void {
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

export function now(): string {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

/** Tạo các tab còn thiếu. Chạy lại nhiều lần không mất dữ liệu. */
export function setupSheets(): string {
  const created: string[] = [];
  for (const def of Object.values(TABS)) {
    if (book().getSheetByName(def.name)) continue;
    const sheet = book().insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([[...def.headers]]);
    sheet.setFrozenRows(1);
    created.push(def.name);
  }
  const guide = tab(TABS.guide);
  guide.getRange(2, 1, GUIDE_LINES.length, 1).setValues(GUIDE_LINES.map((l) => [l]));
  const users = tab(TABS.users);
  if (users.getLastRow() < 2) {
    appendRow(users, [newCode(), 'Người dùng thử', 'Nhân viên', 'Hoạt động', DEFAULT_DAILY_LIMIT, 'Xoá dòng này khi không cần', now()]);
  }
  return created.length ? `Đã tạo tab: ${created.join(', ')}` : 'Các tab đã có sẵn.';
}

// Bỏ các ký tự dễ nhầm (0/O, 1/I/L) để đọc mã qua điện thoại không sai.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function newCode(): string {
  const raw = Utilities.getUuid().replace(/-/g, '');
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[parseInt(raw.slice(i * 2, i * 2 + 2), 16) % CODE_ALPHABET.length];
  return `LS-${code}`;
}

/** Điền mã cho các dòng có Họ tên nhưng chưa có mã. Trả về số mã đã tạo. */
export function fillMissingCodes(): number {
  const sheet = tab(TABS.users);
  const data = rows(sheet, TABS.users.headers.length);
  const taken = new Set(data.map((r) => String(r[0])));
  let made = 0;
  data.forEach((r, i) => {
    if (String(r[0]).trim() || !String(r[1]).trim()) return;
    let code = newCode();
    while (taken.has(code)) code = newCode();
    taken.add(code);
    sheet.getRange(i + 2, 1, 1, 1).setValues([[code]]);
    if (!String(r[3]).trim()) sheet.getRange(i + 2, 4, 1, 1).setValues([['Hoạt động']]);
    if (!String(r[6]).trim()) sheet.getRange(i + 2, 7, 1, 1).setValues([[now()]]);
    made += 1;
  });
  return made;
}

export function findUser(code: string): User | undefined {
  const row = rows(tab(TABS.users), TABS.users.headers.length).find((r) => String(r[0]).trim().toUpperCase() === code);
  if (!row) return undefined;
  const limit = Number(row[4]);
  return {
    code,
    name: String(row[1]),
    group: String(row[2]),
    active: String(row[3]).trim().toLowerCase() !== 'khoá' && String(row[3]).trim().toLowerCase() !== 'khóa',
    dailyLimit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_DAILY_LIMIT,
  };
}

const DATA_COL = TABS.progress.headers.length;

export function loadProfiles(code: string): Record<string, Profile> {
  const out: Record<string, Profile> = {};
  for (const r of rows(tab(TABS.progress), DATA_COL)) {
    if (String(r[0]) !== code) continue;
    try {
      const parsed = ProfileSchema.safeParse(JSON.parse(String(r[DATA_COL - 1])));
      if (parsed.success) out[parsed.data.language] = parsed.data;
    } catch {
      // Dòng hỏng (bị sửa tay): bỏ qua, lần lưu sau sẽ ghi đè.
    }
  }
  return out;
}

export function saveProfile(user: User, profile: Profile): void {
  const sheet = tab(TABS.progress);
  const data = rows(sheet, 4);
  const index = data.findIndex((r) => String(r[0]) === user.code && String(r[3]) === profile.language);
  const avg = skillAverages(profile);
  const row = [
    user.code,
    user.name,
    user.group,
    profile.language,
    profile.level,
    profile.xp,
    currentStreak(profile.daily),
    avg.listening ?? '',
    avg.speaking ?? '',
    avg.reading ?? '',
    avg.writing ?? '',
    profile.conversations,
    now(),
    JSON.stringify(profile),
  ];
  if (index >= 0) sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
  else appendRow(sheet, row);
}

export interface LogEntry {
  user: User;
  language: string;
  kind: string;
  level: string;
  score?: number;
  estimatedLevel?: string;
  inputTokens?: number;
  outputTokens?: number;
  outcome: string;
}

export function logAi(e: LogEntry): void {
  appendRow(tab(TABS.log), [
    now(),
    e.user.code,
    e.user.name,
    findLanguage(e.language)?.nameVi ?? e.language,
    e.kind,
    e.level,
    e.score ?? '',
    e.estimatedLevel ?? '',
    e.inputTokens ?? '',
    e.outputTokens ?? '',
    e.outcome,
  ]);
}
