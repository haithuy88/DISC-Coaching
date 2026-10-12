import { z } from 'zod';
import { toAnswerEntries, type AnswerEntry } from './answers';
import { QUESTION_IDS, QUESTIONNAIRE_VERSION } from './questionnaire';
import { hasAnswer } from './scoring';
import { CONSENT_VERSION, normalizeText, type Session } from './session';
import { DIMENSIONS, type AnswerMap, type ScoreSummary } from './types';

export interface SubmissionPayload {
  submissionId: string;
  questionnaireVersion: string;
  consentVersion: string;
  consentAt: string;
  participant: { fullName: string; department: string; title: string };
  answers: AnswerEntry[];
}

/** Câu chưa có lựa chọn (1–5 hoặc N/A). Gửi chỉ khi đủ 30 mục. */
export function unansweredIds(answers: AnswerMap): string[] {
  return QUESTION_IDS.filter((id) => !hasAnswer(answers, id));
}

export function newSubmissionId(): string {
  return crypto.randomUUID();
}

export function buildPayload(session: Session): SubmissionPayload {
  if (!session.consentAt) throw new Error('Chưa đồng ý gửi dữ liệu');
  if (!session.submissionId) throw new Error('Thiếu mã lần nộp');
  if (unansweredIds(session.answers).length > 0) throw new Error('Chưa trả lời đủ 30 câu');
  return {
    submissionId: session.submissionId,
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    consentVersion: CONSENT_VERSION,
    consentAt: session.consentAt,
    participant: {
      fullName: normalizeText(session.participant.fullName),
      department: normalizeText(session.participant.department),
      title: normalizeText(session.participant.title),
    },
    answers: toAnswerEntries(session.answers, QUESTION_IDS),
  };
}

const dimScore = z.object({ n: z.number().int().min(0).max(6), score: z.number().min(0).max(100).nullable() });

/** Biên nhận từ Apps Script. Điểm trong biên nhận do máy chủ tính lại. */
export const receiptSchema = z.object({
  ok: z.literal(true),
  submissionId: z.string().min(1),
  duplicate: z.boolean(),
  receivedAt: z.string(),
  nDisc: z.number().int().min(0).max(24),
  scores: z.object({ D: dimScore, I: dimScore, S: dimScore, C: dimScore }),
  dataStatus: z.enum(['complete', 'partial', 'insufficient']),
  pattern: z.enum(['insufficient', 'flat', 'clearer', 'close_pair', 'multiple']),
  candidates: z.array(z.enum(DIMENSIONS)),
});
export type Receipt = z.infer<typeof receiptSchema>;

const errorSchema = z.object({ ok: z.literal(false), error: z.string().max(500), retryable: z.boolean().optional() });

export type SubmitResult =
  | { kind: 'synced'; receipt: Receipt }
  | { kind: 'rejected'; message: string }
  | { kind: 'network_error'; message: string };

/** Điểm do máy chủ trả về, dạng ScoreSummary để hiển thị. */
export function summaryFromReceipt(r: Receipt): ScoreSummary {
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d) => {
      const s = r.scores[d];
      const mean = s.score === null ? null : s.score / 25 + 1;
      return [d, { dimension: d, n: s.n, itemCount: 6, total: mean === null ? 0 : Math.round(mean * s.n), mean, score: s.score }];
    }),
  ) as ScoreSummary['dimensions'];
  return { dimensions, nDisc: r.nDisc, discCount: 24 };
}

/**
 * Gửi tới Google Apps Script web app. Dùng text/plain để tránh preflight CORS.
 * Gửi lại cùng submissionId không tạo dòng trùng (máy chủ kiểm tra).
 */
export async function submitToSheets(url: string, payload: SubmissionPayload, timeoutMs = 25_000): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return { kind: 'network_error', message: `Máy chủ trả mã ${res.status}.` };
    const data: unknown = await res.json().catch(() => null);
    const okParsed = receiptSchema.safeParse(data);
    if (okParsed.success) {
      if (okParsed.data.submissionId !== payload.submissionId) {
        return { kind: 'network_error', message: 'Biên nhận không khớp lần nộp.' };
      }
      return { kind: 'synced', receipt: okParsed.data };
    }
    const err = errorSchema.safeParse(data);
    if (err.success) {
      // Lỗi tạm thời khi ghi Sheets: cho phép gửi lại (cùng mã, không trùng).
      return err.data.retryable ? { kind: 'network_error', message: err.data.error } : { kind: 'rejected', message: err.data.error };
    }
    return { kind: 'network_error', message: 'Phản hồi của máy chủ không đúng định dạng.' };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    return { kind: 'network_error', message: aborted ? 'Hết thời gian chờ máy chủ.' : 'Không kết nối được máy chủ.' };
  } finally {
    clearTimeout(timer);
  }
}
