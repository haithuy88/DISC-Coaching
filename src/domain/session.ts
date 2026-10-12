import type { AnswerMap } from './types';

export const MAX_NAME = 80;
export const MAX_DEPARTMENT = 80;
export const MAX_TITLE = 80;

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
  const dept = normalizeText(p.department);
  if (name.length < 2) errors.fullName = 'Hãy nhập họ tên (ít nhất 2 ký tự).';
  else if (name.length > MAX_NAME) errors.fullName = `Họ tên tối đa ${MAX_NAME} ký tự.`;
  if (dept.length < 2) errors.department = 'Hãy nhập phòng ban.';
  else if (dept.length > MAX_DEPARTMENT) errors.department = `Phòng ban tối đa ${MAX_DEPARTMENT} ký tự.`;
  if (normalizeText(p.title).length > MAX_TITLE) errors.title = `Chức danh tối đa ${MAX_TITLE} ký tự.`;
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
