import { z } from 'zod';
import raw from '../data/disc-questionnaire.vi.json';
import { DIMENSIONS, type Dimension, type Profile, type Question, type ScoringRules } from './types';

const dimensionSchema = z.enum(DIMENSIONS);

const questionnaireSchema = z.object({
  version: z.string().min(1),
  title: z.string(),
  language: z.literal('vi'),
  status: z.string(),
  disclaimer: z.string(),
  contextPrompt: z.string(),
  scale: z.array(z.object({ value: z.union([z.number().int().min(1).max(5), z.null()]), label: z.string() })),
  questions: z
    .array(
      z.object({
        id: z.string().regex(/^[DISC][1-9]$/),
        dimension: dimensionSchema,
        text: z.string().min(1),
        tag: z.string(),
        action: z.string().min(1),
        reverse: z.literal(false),
      }),
    )
    .min(1),
  profiles: z.record(
    dimensionSchema,
    z.object({
      name: z.string(),
      strength: z.string(),
      risk: z.string(),
      need: z.string(),
      question: z.string(),
      action: z.string(),
    }),
  ),
  rules: z.object({
    minAnsweredPerDimension: z.number().int().positive(),
    minAnsweredTotal: z.number().int().positive(),
    score: z.literal('25*(mean-1)'),
    tieDelta: z.number().min(0),
    closeDelta: z.number().positive(),
    flatRange: z.number().positive(),
    thresholdStatus: z.string(),
    noForcedType: z.literal(true),
  }),
});

/** Kiểm tra JSON câu hỏi ngay khi tải: lỗi dữ liệu phải lộ ra sớm, không âm thầm chấm sai. */
function loadQuestionnaire() {
  const data = questionnaireSchema.parse(raw);
  const ids = new Set<string>();
  for (const q of data.questions) {
    if (ids.has(q.id)) throw new Error(`Trùng ID câu hỏi: ${q.id}`);
    if (q.id[0] !== q.dimension) throw new Error(`ID ${q.id} không khớp nhóm ${q.dimension}`);
    ids.add(q.id);
  }
  for (const d of DIMENSIONS) {
    if (!data.questions.some((q) => q.dimension === d)) throw new Error(`Thiếu câu hỏi nhóm ${d}`);
  }
  return data;
}

const data = loadQuestionnaire();

export const QUESTIONNAIRE_VERSION = data.version;
export const QUESTIONNAIRE_TITLE = data.title;
export const DISCLAIMER = data.disclaimer;
export const CONTEXT_PROMPT = data.contextPrompt;
export const THRESHOLD_STATUS = data.rules.thresholdStatus;

/** Thứ tự xen kẽ D/I/S/C cố định theo JSON; không xáo trộn. */
export const QUESTIONS: readonly Question[] = Object.freeze(data.questions.map((q) => Object.freeze({ ...q })));
export const QUESTION_IDS: readonly string[] = QUESTIONS.map((q) => q.id);
const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

export function isKnownQuestionId(id: string): boolean {
  return QUESTION_BY_ID.has(id);
}

export const SCALE = data.scale;
export const PROFILES: Readonly<Record<Dimension, Profile>> = data.profiles;

export const RULES: Readonly<ScoringRules> = Object.freeze({
  minAnsweredPerDimension: data.rules.minAnsweredPerDimension,
  minAnsweredTotal: data.rules.minAnsweredTotal,
  closeDelta: data.rules.closeDelta,
  flatRange: data.rules.flatRange,
  tieDelta: data.rules.tieDelta,
});

/** Phiên bản quy ước chấm/diễn giải của app; đổi khi đổi logic hoặc ngưỡng. */
export const SCORING_CONFIG_VERSION = 'disc-lab-scoring-mvp-1';

export const QUESTIONS_PER_PAGE = 4;
export const PAGE_COUNT = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE);

export const DIMENSION_LABEL: Record<Dimension, string> = {
  D: `D – ${PROFILES.D.name}`,
  I: `I – ${PROFILES.I.name}`,
  S: `S – ${PROFILES.S.name}`,
  C: `C – ${PROFILES.C.name}`,
};
