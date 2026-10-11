import { z } from 'zod';
import { validateAnswerMap, hasDangerousKeys } from '../domain/answers';
import { QUESTIONNAIRE_VERSION } from '../domain/questionnaire';
import { MAX_NAME, MAX_TEXT, SETTINGS, emptySession, isoDate, planSchema, reflectionsSchema, type Session } from '../domain/session';

/**
 * Lưu trên thiết bị chỉ khi học viên bật "Lưu trên thiết bị này".
 * Mặc định mọi dữ liệu chỉ nằm trong bộ nhớ của tab và mất khi tải lại trang.
 */
export const STORAGE_KEY = 'disc-coaching-lab:v1';
const STORAGE_VERSION = 1;

export type Screen = 'intro' | 'context' | 'survey' | 'review' | 'results' | 'coaching' | 'plan' | 'export';
export const SCREENS: readonly Screen[] = ['intro', 'context', 'survey', 'review', 'results', 'coaching', 'plan', 'export'];

export interface StoredState {
  session: Session;
  screen: Screen;
  page: number;
  /** văn bản báo cáo đã nhập (khi không có đáp án), được kiểm tra lại mỗi lần khôi phục */
  importedReport: string | null;
}

const storedSchema = z.strictObject({
  storageVersion: z.literal(STORAGE_VERSION),
  questionnaireVersion: z.literal(QUESTIONNAIRE_VERSION),
  screen: z.enum(SCREENS as [Screen, ...Screen[]]),
  page: z.number().int().min(0).max(100),
  importedReport: z.string().max(1024 * 1024).nullable(),
  session: z.strictObject({
    consentAcknowledged: z.boolean(),
    setting: z.enum(SETTINGS).nullable(),
    displayName: z.string().max(MAX_NAME),
    answers: z.record(z.string(), z.unknown()),
    startedAt: isoDate.nullable(),
    completedAt: isoDate.nullable(),
    reflections: reflectionsSchema,
    fitNote: z.string().max(MAX_TEXT),
    notFitNote: z.string().max(MAX_TEXT),
    goalOptionId: z.string().max(100).nullable(),
    goalText: z.string().max(MAX_TEXT),
    plan: planSchema,
  }),
});

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadStored(): StoredState | null {
  const ls = storage();
  if (!ls) return null;
  let raw: string | null;
  try {
    raw = ls.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (hasDangerousKeys(data)) throw new Error('unsafe');
    const parsed = storedSchema.parse(data);
    const answers = validateAnswerMap(parsed.session.answers);
    if (!answers.ok) throw new Error('answers');
    const session: Session = { ...emptySession(), ...parsed.session, answers: answers.answers };
    return { session, screen: parsed.screen, page: parsed.page, importedReport: parsed.importedReport };
  } catch {
    // Dữ liệu hỏng hoặc phiên bản cũ: xóa thay vì dùng sai.
    clearStored();
    return null;
  }
}

export function saveStored(state: StoredState): boolean {
  const ls = storage();
  if (!ls) return false;
  try {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({
        storageVersion: STORAGE_VERSION,
        questionnaireVersion: QUESTIONNAIRE_VERSION,
        screen: state.screen,
        page: state.page,
        importedReport: state.importedReport,
        session: state.session,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearStored(): void {
  const ls = storage();
  try {
    ls?.removeItem(STORAGE_KEY);
  } catch {
    /* bộ nhớ trình duyệt bị chặn: không có gì để xóa */
  }
}
