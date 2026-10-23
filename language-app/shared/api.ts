// Hợp đồng API giữa trình duyệt và Apps Script. Cả hai phía cùng dùng các schema này
// (backend được đóng gói kèm zod vào Code.gs), nên payload lệch khỏi đây bị từ chối trước khi gọi Claude.
import { z } from 'zod';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const LevelSchema = z.enum(LEVELS);
export type Level = z.infer<typeof LevelSchema>;

export const SKILLS = ['listening', 'speaking', 'reading', 'writing'] as const;
export const SkillSchema = z.enum(SKILLS);
export type Skill = z.infer<typeof SkillSchema>;

const LanguageCode = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);
const ShortText = z.string().trim().min(1).max(600);
/** Mã truy cập do quản trị cấp trong tab NGUOI_DUNG. */
export const AccessCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{4,20}$/);

/** Bối cảnh chung của mọi yêu cầu AI: học ngôn ngữ nào, ở level nào. */
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

export const ChatReplySchema = z.object({ reply: z.string() });

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

// ---------- Tiến độ (lưu vào tab TIEN_DO) ----------

const IsoDate = z.string().max(40);

export const ActivityResultSchema = z.object({
  skill: SkillSchema,
  score: z.number().min(0).max(100),
  at: IsoDate,
});

/** Thẻ ôn tập từ vựng theo hộp Leitner. */
export const ReviewCardSchema = z.object({
  box: z.number().int().min(0).max(5),
  due: IsoDate,
});

export const ProfileSchema = z.object({
  language: LanguageCode,
  level: LevelSchema,
  placement: z
    .object({ at: IsoDate, objectiveLevel: LevelSchema.optional(), writingLevel: LevelSchema.optional() })
    .optional(),
  results: z.record(z.string().max(80), ActivityResultSchema),
  /** Khoá là "<lessonId>|<từ>". */
  review: z.record(z.string().max(160), ReviewCardSchema).default({}),
  conversations: z.number().int().min(0),
  xp: z.number().int().min(0),
  /** XP theo ngày (YYYY-MM-DD), chỉ giữ 30 ngày gần nhất, dùng cho chuỗi ngày và mục tiêu ngày. */
  daily: z.record(z.string().max(10), z.number().int().min(0)).default({}),
  dailyGoal: z.number().int().min(5).max(500).default(30),
});
export type Profile = z.infer<typeof ProfileSchema>;

// ---------- Phong bì yêu cầu ----------

export const ApiRequestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('login'), code: AccessCodeSchema }).strict(),
  z.object({ action: z.literal('chat'), code: AccessCodeSchema, payload: ChatRequestSchema }).strict(),
  z.object({ action: z.literal('grade'), code: AccessCodeSchema, payload: GradeRequestSchema }).strict(),
  z.object({ action: z.literal('saveProgress'), code: AccessCodeSchema, payload: ProfileSchema }).strict(),
]);
export type ApiRequest = z.input<typeof ApiRequestSchema>;

export const LoginResultSchema = z.object({
  name: z.string(),
  group: z.string(),
  /** Quản trị đã cài API key chưa. Chưa cài thì app ẩn các phần cần AI. */
  aiEnabled: z.boolean(),
  profiles: z.record(z.string(), ProfileSchema),
});
export type LoginResult = z.infer<typeof LoginResultSchema>;

/** Mọi phản hồi: { ok: true, data } hoặc { ok: false, error }. */
export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };
