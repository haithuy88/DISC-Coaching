// Hợp đồng API giữa trình duyệt và máy chủ. Cả hai phía cùng dùng các schema này,
// nên máy chủ từ chối mọi payload lệch khỏi đây trước khi gọi Claude.
import { z } from 'zod';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const LevelSchema = z.enum(LEVELS);
export type Level = z.infer<typeof LevelSchema>;

export const SKILLS = ['listening', 'speaking', 'reading', 'writing'] as const;
export const SkillSchema = z.enum(SKILLS);
export type Skill = z.infer<typeof SkillSchema>;

const LanguageCode = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);
const ShortText = z.string().trim().min(1).max(600);

/** Bối cảnh chung của mọi yêu cầu: học ngôn ngữ nào, ở level nào. */
const LearnerContext = z.object({
  language: LanguageCode,
  level: LevelSchema,
});

// ---------- Bot hội thoại (role-play theo chủ đề) ----------

export const ScenarioSchema = z.object({
  title: ShortText,
  /** Vai bot đóng, ví dụ "nhà cung cấp linh kiện". */
  botRole: ShortText,
  /** Vai người học. */
  learnerRole: ShortText,
  /** Mục tiêu người học phải đạt trong cuộc hội thoại. */
  goal: ShortText,
  /** Từ/cụm từ nên dùng. */
  targetPhrases: z.array(z.string().max(80)).max(20).default([]),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ChatTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2000),
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;

export const ChatRequestSchema = LearnerContext.extend({
  scenario: ScenarioSchema,
  // Lượt đầu tiên luôn là của người học (có thể là "[start]" để bot mở lời).
  messages: z.array(ChatTurnSchema).min(1).max(60),
}).strict();
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ---------- Chấm Nói / Viết / tổng kết hội thoại ----------

export const GradeRequestSchema = LearnerContext.extend({
  skill: z.enum(['speaking', 'writing', 'conversation']),
  /** Đề bài người học nhận được. */
  task: z.string().trim().min(1).max(1500),
  /** Bài làm: văn bản viết, bản ghi giọng nói, hoặc toàn bộ hội thoại. */
  response: z.string().trim().min(1).max(8000),
  /** Tiêu chí riêng của bài (nếu có). */
  criteria: z.array(z.string().max(200)).max(8).default([]),
}).strict();
export type GradeRequest = z.infer<typeof GradeRequestSchema>;

export const GradeResultSchema = z.object({
  /** 0–100, so với yêu cầu của level đang học. */
  score: z.number(),
  /** Level người học đang thể hiện qua bài này. */
  estimatedLevel: LevelSchema,
  summary: z.string(),
  strengths: z.array(z.string()),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
    }),
  ),
  improvedVersion: z.string(),
  nextStep: z.string(),
});
export type GradeResult = z.infer<typeof GradeResultSchema>;

export const ApiErrorSchema = z.object({ error: z.string() });
