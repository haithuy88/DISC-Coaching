import { z } from 'zod';
import raw from '../data/lamson-30.vi.json';
import { DIMENSIONS, type Dimension, type Question, type ScoringRules } from './types';

const questionSchema = z.object({
  id: z.string().regex(/^[A-Z][1-9]$/),
  dimension: z.enum(DIMENSIONS),
  section: z.string().min(1),
  scored: z.literal(true),
  reverse: z.literal(false),
  text: z.string().min(1),
});

const questionnaireSchema = z.object({
  version: z.string().min(1),
  title: z.string(),
  organization: z.string(),
  audience: z.string(),
  language: z.literal('vi'),
  disclaimer: z.string(),
  contextPrompt: z.string(),
  scale: z.array(z.object({ value: z.union([z.number().int().min(1).max(5), z.null()]), label: z.string() })),
  questions: z.array(questionSchema).min(1),
  rules: z.object({
    totalQuestions: z.number().int().positive(),
    scoredQuestions: z.number().int().positive(),
    minAnsweredShare: z.number().gt(0).max(1),
    minAnsweredTotal: z.number().int().positive(),
    score: z.literal('25*(mean-1)'),
    closeDelta: z.number().positive(),
    flatRange: z.number().positive(),
    noForcedType: z.literal(true),
    thresholdStatus: z.string(),
  }),
});

/** Kiểm tra JSON câu hỏi khi tải: lỗi dữ liệu phải lộ ra sớm, không âm thầm chấm sai. */
function loadQuestionnaire() {
  const data = questionnaireSchema.parse(raw);
  const ids = new Set<string>();
  for (const q of data.questions) {
    if (ids.has(q.id)) throw new Error(`Trùng ID câu hỏi: ${q.id}`);
    if ('DISC'.includes(q.id[0]!) && q.id[0] !== q.dimension) throw new Error(`ID ${q.id} không khớp nhóm ${q.dimension}`);
    ids.add(q.id);
  }
  if (data.questions.length !== data.rules.totalQuestions) throw new Error('Số câu không khớp rules.totalQuestions');
  if (data.questions.filter((q) => q.scored).length !== data.rules.scoredQuestions) {
    throw new Error('Số câu được chấm không khớp rules.scoredQuestions');
  }
  for (const d of DIMENSIONS) {
    if (!data.questions.some((q) => q.dimension === d)) throw new Error(`Thiếu câu hỏi nhóm ${d}`);
  }
  return data;
}

const data = loadQuestionnaire();

export const QUESTIONNAIRE_VERSION = data.version;
export const QUESTIONNAIRE_TITLE = data.title;
export const ORGANIZATION = data.organization;
export const AUDIENCE = data.audience;
export const DISCLAIMER = data.disclaimer;
export const CONTEXT_PROMPT = data.contextPrompt;
export const THRESHOLD_STATUS = data.rules.thresholdStatus;

/** Thứ tự cố định theo JSON; không xáo trộn. */
export const QUESTIONS: readonly Question[] = Object.freeze(
  data.questions.map((q) =>
    Object.freeze({ id: q.id, dimension: q.dimension, section: q.section, scored: q.scored, text: q.text } as Question),
  ),
);
export const QUESTION_IDS: readonly string[] = QUESTIONS.map((q) => q.id);
export const DISC_QUESTIONS: readonly Question[] = QUESTIONS.filter((q) => q.scored);
/** 6 câu leadership / làm việc nhóm (cũng được chấm vào D/S/C từ bản 3.1.0) */
export const CONTEXT_QUESTIONS: readonly Question[] = QUESTIONS.filter((q) => q.section !== 'DISC');
const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

export function isKnownQuestionId(id: string): boolean {
  return QUESTION_BY_ID.has(id);
}

export const SCALE = data.scale;

/** Số câu của từng nhóm trong bộ câu hỏi (D/S/C 8, I 6 ở bản 3.1.0). */
export const ITEM_COUNT: Readonly<Record<Dimension, number>> = Object.freeze(
  Object.fromEntries(DIMENSIONS.map((d) => [d, QUESTIONS.filter((q) => q.scored && q.dimension === d).length])) as Record<
    Dimension,
    number
  >,
);

export const RULES: Readonly<ScoringRules> = Object.freeze({
  minAnsweredShare: data.rules.minAnsweredShare,
  minAnsweredTotal: data.rules.minAnsweredTotal,
  closeDelta: data.rules.closeDelta,
  flatRange: data.rules.flatRange,
});

/** Số câu có điểm tối thiểu của một nhóm: làm tròn lên minAnsweredShare × số câu (8 → 6, 6 → 5). */
export function minAnsweredFor(itemCount: number, rules: Pick<ScoringRules, 'minAnsweredShare'> = RULES): number {
  return Math.ceil(rules.minAnsweredShare * itemCount - 1e-9);
}

export const QUESTIONS_PER_PAGE = 4;
export const PAGE_COUNT = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE);

/** Tên mô tả ngắn của bốn xu hướng, chỉ dùng để hiển thị kết quả. */
export const DIMENSION_NAME: Record<Dimension, string> = {
  D: 'Chủ động và hướng kết quả',
  I: 'Kết nối và tạo ảnh hưởng',
  S: 'Hợp tác và duy trì ổn định',
  C: 'Phân tích và chú trọng chất lượng',
};

export const DIMENSION_LABEL: Record<Dimension, string> = {
  D: `D – ${DIMENSION_NAME.D}`,
  I: `I – ${DIMENSION_NAME.I}`,
  S: `S – ${DIMENSION_NAME.S}`,
  C: `C – ${DIMENSION_NAME.C}`,
};

export function scaleLabel(value: number | null | undefined): string {
  if (value === undefined) return 'Chưa trả lời';
  return SCALE.find((s) => s.value === value)?.label ?? '';
}
