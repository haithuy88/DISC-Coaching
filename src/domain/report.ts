import { z } from 'zod';
import { hasDangerousKeys, toAnswerEntries, validateAnswerEntries } from './answers';
import { allScoredAnswersIdentical, interpret } from './interpretation';
import {
  QUESTION_IDS,
  QUESTIONNAIRE_VERSION,
  QUESTIONS,
  RULES,
  SCORING_CONFIG_VERSION,
  getQuestion,
} from './questionnaire';
import { buildSuggestions, MAX_EVIDENCE, type EvidenceItem } from './recommendations';
import { scoreAnswers } from './scoring';
import {
  MAX_NAME,
  MAX_TEXT,
  PERIOD,
  PERIOD_LABEL,
  SETTINGS,
  SETTING_LABEL,
  emptySession,
  isoDate,
  planSchema,
  reflectionsSchema,
  type Session,
} from './session';
import { DIMENSIONS, type Dimension, type Interpretation, type ScoreSummary, type ScoredValue } from './types';

export const REPORT_SCHEMA = 'disc-coaching-lab/report';
export const REPORT_SCHEMA_VERSION = 1;
export const MAX_IMPORT_BYTES = 1024 * 1024;

/** Kết quả tính được cho một phiên: luôn tính lại từ đáp án, hoặc từ điểm nhập khi không có đáp án. */
export interface Evaluation {
  summary: ScoreSummary;
  interpretation: Interpretation;
  evidence: EvidenceItem[];
}

export function evaluate(session: Session): Evaluation {
  const summary = scoreAnswers(session.answers);
  const interpretation = interpret(summary, { allIdentical: allScoredAnswersIdentical(session.answers) });
  const { evidence } = buildSuggestions(session.answers, interpretation);
  return { summary, interpretation, evidence };
}

const dimensionScoreSchema = z.strictObject({
  n: z.number().int().min(0).max(QUESTIONS.length),
  itemCount: z.number().int().min(0).max(QUESTIONS.length),
  score: z.number().min(0).max(100).nullable(),
});

const evidenceSchema = z.strictObject({
  id: z.string(),
  value: z.union([z.literal(4), z.literal(5)]),
  text: z.string().max(MAX_TEXT),
  action: z.string().max(MAX_TEXT),
});

export const reportSchema = z.strictObject({
  schema: z.literal(REPORT_SCHEMA),
  schemaVersion: z.literal(REPORT_SCHEMA_VERSION),
  createdAt: z.iso.datetime({ offset: true }),
  questionnaireVersion: z.literal(QUESTIONNAIRE_VERSION),
  scoringConfig: z.strictObject({
    version: z.string().max(100),
    rules: z.strictObject({
      minAnsweredPerDimension: z.number(),
      minAnsweredTotal: z.number(),
      closeDelta: z.number(),
      flatRange: z.number(),
      tieDelta: z.number(),
    }),
  }),
  context: z.strictObject({
    setting: z.enum(SETTINGS).nullable(),
    settingLabel: z.string().max(100),
    period: z.literal(PERIOD),
    periodLabel: z.string().max(100),
    displayName: z.string().max(MAX_NAME),
  }),
  startedAt: isoDate.nullable(),
  completedAt: isoDate.nullable(),
  counts: z.strictObject({
    answered: z.number().int().min(0),
    na: z.number().int().min(0),
    unanswered: z.number().int().min(0),
    total: z.literal(QUESTIONS.length),
  }),
  scores: z.strictObject({ D: dimensionScoreSchema, I: dimensionScoreSchema, S: dimensionScoreSchema, C: dimensionScoreSchema }),
  interpretation: z.strictObject({
    status: z.enum(['insufficient', 'flat', 'clearer', 'close_pair', 'multiple']),
    partial: z.boolean(),
    candidates: z.array(z.enum(DIMENSIONS)).max(4),
    reviewSuggested: z.boolean(),
  }),
  evidence: z.array(evidenceSchema).max(MAX_EVIDENCE),
  reflections: reflectionsSchema,
  fitNote: z.string().max(MAX_TEXT),
  notFitNote: z.string().max(MAX_TEXT),
  goal: z.strictObject({ optionId: z.string().max(100).nullable(), text: z.string().max(MAX_TEXT) }),
  plan: planSchema,
  answersIncluded: z.boolean(),
  answers: z.array(z.unknown()).max(QUESTIONS.length * 2).optional(),
});

export type Report = z.infer<typeof reportSchema>;

export interface ExportOptions {
  includeAnswers: boolean;
  now?: Date;
}

export function buildReport(session: Session, evaluation: Evaluation, options: ExportOptions): Report {
  const { summary, interpretation, evidence } = evaluation;
  const report: Report = {
    schema: REPORT_SCHEMA,
    schemaVersion: REPORT_SCHEMA_VERSION,
    createdAt: (options.now ?? new Date()).toISOString(),
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    scoringConfig: { version: SCORING_CONFIG_VERSION, rules: { ...RULES } },
    context: {
      setting: session.setting,
      settingLabel: session.setting ? SETTING_LABEL[session.setting] : '',
      period: PERIOD,
      periodLabel: PERIOD_LABEL,
      displayName: session.displayName,
    },
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    counts: {
      answered: summary.answered,
      na: summary.naCount,
      unanswered: summary.unanswered,
      total: QUESTIONS.length,
    },
    scores: Object.fromEntries(
      DIMENSIONS.map((d) => {
        const s = summary.dimensions[d];
        return [d, { n: s.n, itemCount: s.itemCount, score: s.score }];
      }),
    ) as Report['scores'],
    interpretation: {
      status: interpretation.status,
      partial: interpretation.partial,
      candidates: interpretation.candidates,
      reviewSuggested: interpretation.reviewSuggested,
    },
    evidence: evidence.map((e) => ({ id: e.questionId, value: e.value as 4 | 5, text: e.text, action: e.action })),
    reflections: { ...session.reflections },
    fitNote: session.fitNote,
    notFitNote: session.notFitNote,
    goal: { optionId: session.goalOptionId, text: session.goalText },
    plan: { ...session.plan },
    answersIncluded: options.includeAnswers,
  };
  if (options.includeAnswers) report.answers = toAnswerEntries(session.answers, QUESTION_IDS);
  return report;
}

export function reportFileName(report: Report): string {
  return `disc-coaching-lab-${report.createdAt.slice(0, 10)}.json`;
}

/** Thông tin về báo cáo đã nhập. */
export interface ImportInfo {
  mode: 'recomputed' | 'unverified';
  fileCreatedAt: string;
  /** điểm trong file khác điểm tính lại từ đáp án */
  scoresMismatch: boolean;
  /** chỉ có ở chế độ unverified: điểm và bằng chứng lấy từ file, chưa đối chiếu đáp án */
  snapshot: Evaluation | null;
}

export type ImportResult = { ok: true; session: Session; info: ImportInfo } | { ok: false; errors: string[] };

const fail = (...errors: string[]): ImportResult => ({ ok: false, errors });

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

const SCORE_TOLERANCE = 1e-6;

/** Điểm có thể đạt với n câu: 25·(k−n)/n với k nguyên trong [n, 5n]. */
function isAchievableScore(score: number, n: number): boolean {
  const k = (score * n) / 25 + n;
  return Math.abs(k - Math.round(k)) < SCORE_TOLERANCE * n && Math.round(k) >= n && Math.round(k) <= 5 * n;
}

function snapshotFromReport(report: Report): Evaluation | string {
  const dims = {} as ScoreSummary['dimensions'];
  let sumN = 0;
  for (const d of DIMENSIONS) {
    const s = report.scores[d];
    const itemCount = QUESTIONS.filter((q) => q.dimension === d).length;
    if (s.itemCount !== itemCount) return `Số câu của nhóm ${d} không khớp bộ câu hỏi.`;
    if (s.n > itemCount) return `Số câu đã chấm của nhóm ${d} vượt quá ${itemCount}.`;
    if ((s.n === 0) !== (s.score === null)) return `Điểm nhóm ${d} không khớp số câu đã chấm.`;
    if (s.score !== null && !isAchievableScore(s.score, s.n)) return `Điểm nhóm ${d} không thể đạt được với ${s.n} câu.`;
    const mean = s.score === null ? null : s.score / 25 + 1;
    dims[d] = { dimension: d, n: s.n, itemCount, total: mean === null ? 0 : Math.round(mean * s.n), mean, score: s.score };
    sumN += s.n;
  }
  const { answered, na, unanswered, total } = report.counts;
  if (sumN !== answered) return 'Tổng số câu đã chấm không khớp điểm từng nhóm.';
  if (answered + na + unanswered !== total) return 'Số câu đã chấm, N/A và chưa trả lời không khớp tổng số câu.';
  const summary: ScoreSummary = { dimensions: dims, answered, naCount: na, unanswered, questionCount: total };
  // Không tin diễn giải trong file: tính lại từ điểm. reviewSuggested chỉ xác định được khi có đáp án.
  const interpretation = interpret(summary, { allIdentical: false });

  const seen = new Set<string>();
  const evidence: EvidenceItem[] = [];
  for (const e of report.evidence) {
    const q = getQuestion(e.id);
    if (!q) return `Bằng chứng có ID không hợp lệ.`;
    if (seen.has(e.id)) return `Bằng chứng ${e.id} bị trùng.`;
    seen.add(e.id);
    // Lấy phát biểu và action từ bộ câu hỏi, không lấy từ file.
    evidence.push({
      evidenceIds: [q.id],
      questionId: q.id,
      dimension: q.dimension,
      text: q.text,
      value: e.value as ScoredValue,
      action: q.action,
    });
  }
  return { summary, interpretation, evidence: interpretation.status === 'insufficient' ? [] : evidence };
}

function scoresDiffer(report: Report, evaluation: Evaluation): boolean {
  return DIMENSIONS.some((d: Dimension) => {
    const a = report.scores[d];
    const b = evaluation.summary.dimensions[d];
    if (a.n !== b.n) return true;
    if (a.score === null || b.score === null) return a.score !== b.score;
    return Math.abs(a.score - b.score) > SCORE_TOLERANCE;
  });
}

/**
 * Nhập báo cáo do người dùng tự chọn. Không tin dữ liệu trong file:
 * - giới hạn 1 MB, JSON hợp lệ, không có khóa nguy hiểm, đúng schema/version;
 * - có đáp án hợp lệ → tính lại toàn bộ điểm và gợi ý;
 * - không có đáp án → chỉ hiển thị kèm nhãn "chưa đối chiếu đáp án".
 */
export function parseReport(text: string, sizeInBytes = byteLength(text)): ImportResult {
  if (sizeInBytes > MAX_IMPORT_BYTES || byteLength(text) > MAX_IMPORT_BYTES) {
    return fail('File vượt quá giới hạn 1 MB.');
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail('File không phải JSON hợp lệ.');
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return fail('Nội dung file không phải báo cáo.');
  if (hasDangerousKeys(data)) return fail('File chứa trường không được phép.');
  const head = data as Record<string, unknown>;
  if (head.schema !== REPORT_SCHEMA) return fail('Đây không phải báo cáo DISC Coaching Lab.');
  if (head.schemaVersion !== REPORT_SCHEMA_VERSION) {
    return fail(`Phiên bản định dạng báo cáo "${String(head.schemaVersion).slice(0, 20)}" chưa được hỗ trợ.`);
  }
  if (head.questionnaireVersion !== QUESTIONNAIRE_VERSION) {
    return fail(`Phiên bản bộ câu hỏi "${String(head.questionnaireVersion).slice(0, 60)}" chưa được hỗ trợ.`);
  }
  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      'Báo cáo không đúng cấu trúc.',
      ...parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`),
    );
  }
  const report = parsed.data;
  if (report.answersIncluded !== (report.answers !== undefined)) {
    return fail('Trường answersIncluded không khớp với dữ liệu đáp án.');
  }

  const base: Session = {
    ...emptySession(),
    consentAcknowledged: true,
    setting: report.context.setting,
    displayName: report.context.displayName,
    startedAt: report.startedAt,
    completedAt: report.completedAt,
    reflections: report.reflections,
    fitNote: report.fitNote,
    notFitNote: report.notFitNote,
    goalOptionId: report.goal.optionId,
    goalText: report.goal.text,
    plan: report.plan,
  };

  if (report.answers !== undefined) {
    const answers = validateAnswerEntries(report.answers);
    if (!answers.ok) return fail('Đáp án trong file không hợp lệ.', ...answers.errors.slice(0, 5));
    const session: Session = { ...base, answers: answers.answers };
    const evaluation = evaluate(session);
    return {
      ok: true,
      session,
      info: {
        mode: 'recomputed',
        fileCreatedAt: report.createdAt,
        scoresMismatch: scoresDiffer(report, evaluation),
        snapshot: null,
      },
    };
  }

  const snapshot = snapshotFromReport(report);
  if (typeof snapshot === 'string') return fail(snapshot);
  return {
    ok: true,
    session: base,
    info: { mode: 'unverified', fileCreatedAt: report.createdAt, scoresMismatch: false, snapshot },
  };
}
