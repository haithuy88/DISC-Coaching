import type { AnswerMap } from './types';

export const MAX_NAME = 80;

/** Danh sách chọn theo yêu cầu của coach (sửa ở đây và chạy lại `npm run build:gas`). */
export const DEPARTMENTS = ['Phòng Thu Mua', 'Phòng Kế Toán', 'Phòng Nhân Sự', 'Phòng KSNB', 'Phòng Kinh Doanh', 'BGD'] as const;
export const TITLES = ['Trưởng phòng', 'Trưởng nhóm', 'Nhân viên', 'BGD'] as const;

/** Phiên bản nội dung đồng ý gửi dữ liệu cho coach; đổi khi đổi nội dung thông báo. */
export const CONSENT_VERSION = 'lamson-consent-1.0';

export interface Participant {
  fullName: string;
  department: string;
  title: string;
}

export interface Session {
  consentAt: string | null;
  participant: Participant;
  answers: AnswerMap;
  /** tạo một lần khi gửi lần đầu; gửi lại dùng cùng ID để không ghi trùng */
  submissionId: string | null;
}

export const emptySession = (): Session => ({
  consentAt: null,
  participant: { fullName: '', department: '', title: '' },
  answers: {},
  submissionId: null,
});

/** Chuẩn hóa khoảng trắng; trả lỗi tiếng Việt cho trường bắt buộc. */
export function normalizeText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export interface ParticipantErrors {
  fullName?: string;
  department?: string;
  title?: string;
}

export function validateParticipant(p: Participant): ParticipantErrors {
  const errors: ParticipantErrors = {};
  const name = normalizeText(p.fullName);
  if (name.length < 2) errors.fullName = 'Hãy nhập họ tên (ít nhất 2 ký tự).';
  else if (name.length > MAX_NAME) errors.fullName = `Họ tên tối đa ${MAX_NAME} ký tự.`;
  if (!(DEPARTMENTS as readonly string[]).includes(p.department)) errors.department = 'Hãy chọn phòng ban.';
  if (!(TITLES as readonly string[]).includes(p.title)) errors.title = 'Hãy chọn chức danh.';
  return errors;
}

export function formatDateTimeVi(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}
