import { z } from 'zod';
import raw from '../data/lamson-30.vi.json';
import { DIMENSIONS, type Dimension, type Question, type ScoringRules } from './types';

const questionSchema = z.union([
  z.object({
    id: z.string().regex(/^[DISC][1-9]$/),
    dimension: z.enum(DIMENSIONS),
    section: z.literal('DISC'),
    scored: z.literal(true),
    reverse: z.literal(false),
    text: z.string().min(1),
  }),
  z.object({
    id: z.string().regex(/^[A-Z][1-9]$/),
    dimension: z.null(),
    section: z.string().min(1),
    scored: z.literal(false),
    text: z.string().min(1),
  }),
]);

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
    discQuestions: z.number().int().positive(),
    itemsPerDimension: z.number().int().positive(),
    minAnsweredPerDimension: z.number().int().positive(),
    minAnsweredDiscTotal: z.number().int().positive(),
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
    if (q.dimension && q.id[0] !== q.dimension) throw new Error(`ID ${q.id} không khớp nhóm ${q.dimension}`);
    ids.add(q.id);
  }
  if (data.questions.length !== data.rules.totalQuestions) throw new Error('Số câu không khớp rules.totalQuestions');
  const disc = data.questions.filter((q) => q.scored);
  if (disc.length !== data.rules.discQuestions) throw new Error('Số câu DISC không khớp rules.discQuestions');
  for (const d of DIMENSIONS) {
    if (disc.filter((q) => q.dimension === d).length !== data.rules.itemsPerDimension) {
      throw new Error(`Nhóm ${d} không có đúng ${data.rules.itemsPerDimension} câu`);
    }
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
    Object.freeze({ id: q.id, dimension: q.dimension, section: q.section, scored: q.scored, text: q.text }),
  ),
);
export const QUESTION_IDS: readonly string[] = QUESTIONS.map((q) => q.id);
export const DISC_QUESTIONS: readonly Question[] = QUESTIONS.filter((q) => q.scored);
export const CONTEXT_QUESTIONS: readonly Question[] = QUESTIONS.filter((q) => !q.scored);
const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

export function isKnownQuestionId(id: string): boolean {
  return QUESTION_BY_ID.has(id);
}

export const SCALE = data.scale;

export const RULES: Readonly<ScoringRules> = Object.freeze({
  itemsPerDimension: data.rules.itemsPerDimension,
  minAnsweredPerDimension: data.rules.minAnsweredPerDimension,
  minAnsweredDiscTotal: data.rules.minAnsweredDiscTotal,
  closeDelta: data.rules.closeDelta,
  flatRange: data.rules.flatRange,
});

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
