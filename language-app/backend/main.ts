// Điểm vào của Apps Script web app. scripts/build-gas.mjs đóng gói file này thành apps-script/Code.gs.
import { ApiRequestSchema, type ApiResponse } from '../shared/api.ts';
import { UserFacingError, aiEnabled, chat, grade } from './claude.ts';
import { TZ, fillMissingCodes, findUser, loadProfiles, logAi, saveProfile, setupSheets, type User } from './sheets.ts';

/** Đếm lượt gọi AI theo ngày trong Script Properties; trả về false nếu đã vượt giới hạn. */
function takeQuota(user: User): boolean {
  const props = PropertiesService.getScriptProperties();
  const key = `usage:${Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd')}`;
  const counts = JSON.parse(props.getProperty(key) ?? '{}') as Record<string, number>;
  const used = counts[user.code] ?? 0;
  if (used >= user.dailyLimit) return false;
  counts[user.code] = used + 1;
  props.setProperty(key, JSON.stringify(counts));
  // Dọn bộ đếm của các ngày trước.
  for (const k of props.getKeys()) if (k.startsWith('usage:') && k !== key) props.deleteProperty(k);
  return true;
}

function withLock<T>(fn: () => T): T {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function handle(raw: string): unknown {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new UserFacingError('Yêu cầu không hợp lệ.');
  }
  const parsed = ApiRequestSchema.safeParse(body);
  if (!parsed.success) throw new UserFacingError('Dữ liệu gửi lên không hợp lệ.');
  const req = parsed.data;

  const user = findUser(req.code);
  if (!user) throw new UserFacingError('Mã truy cập không đúng.');
  if (!user.active) throw new UserFacingError('Mã truy cập đã bị khoá. Liên hệ quản trị.');

  switch (req.action) {
    case 'login':
      return { name: user.name, group: user.group, aiEnabled: aiEnabled(), profiles: loadProfiles(user.code) };
    case 'saveProgress':
      withLock(() => saveProfile(user, req.payload));
      return { saved: true };
    case 'chat':
    case 'grade': {
      const p = req.payload;
      const kind = req.action === 'chat' ? 'Hội thoại' : `Chấm ${req.payload.skill}`;
      // Kiểm tra trước khi trừ lượt, để không tính lượt khi AI đang tắt.
      if (!aiEnabled()) throw new UserFacingError('Tính năng AI đang tắt.');
      if (!withLock(() => takeQuota(user))) {
        throw new UserFacingError(`Bạn đã dùng hết ${user.dailyLimit} lượt AI hôm nay. Mai học tiếp nhé!`);
      }
      try {
        if (req.action === 'chat') {
          const { reply, usage } = chat(req.payload);
          withLock(() => logAi({ user, language: p.language, kind, level: p.level, ...usage, outcome: 'ok' }));
          return { reply };
        }
        const { result, usage } = grade(req.payload);
        withLock(() =>
          logAi({ user, language: p.language, kind, level: p.level, score: result.score, estimatedLevel: result.estimatedLevel, ...usage, outcome: 'ok' }),
        );
        return result;
      } catch (err) {
        withLock(() => logAi({ user, language: p.language, kind, level: p.level, outcome: `lỗi: ${(err as Error).message}` }));
        throw err;
      }
    }
  }
}

function json(response: ApiResponse<unknown>): GoogleAppsScript.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

export function doPost(e: { postData?: { contents?: string } }): GoogleAppsScript.TextOutput {
  try {
    return json({ ok: true, data: handle(e.postData?.contents ?? '') });
  } catch (err) {
    if (err instanceof UserFacingError) return json({ ok: false, error: err.message });
    console.error(err);
    return json({ ok: false, error: 'Lỗi máy chủ, thử lại sau.' });
  }
}

export function doGet(): GoogleAppsScript.TextOutput {
  return json({ ok: true, data: { service: 'polyglot-practice' } });
}

export function setup(): string {
  return setupSheets();
}

export function onOpen(): void {
  SpreadsheetApp.getUi().createMenu('Polyglot').addItem('Tạo mã truy cập', 'taoMaTruyCap').addItem('Cài đặt các tab', 'setup').addToUi();
}

export function taoMaTruyCap(): void {
  const made = withLock(fillMissingCodes);
  SpreadsheetApp.getUi().alert(made ? `Đã tạo ${made} mã truy cập mới.` : 'Không có dòng nào cần tạo mã (cần có Họ tên và để trống cột Mã).');
}
