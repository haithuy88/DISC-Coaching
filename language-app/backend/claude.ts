// Gọi Claude Messages API bằng HTTP trực tiếp: Apps Script không chạy được SDK npm,
// chỉ có UrlFetchApp (đồng bộ).
import { z } from 'zod';
import { GradeResultSchema, type ChatRequest, type GradeRequest, type GradeResult } from '../shared/api.ts';
import { chatSystemPrompt, gradeSystemPrompt, gradeUserPrompt } from '../shared/prompts.ts';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2026-10-21';
// Khi bộ lọc an toàn từ chối nhầm, API tự chạy lại yêu cầu trên model dự phòng do Anthropic chọn.
// Chỉ một số model nhận tham số này (Haiku thì không), nên chỉ gửi khi model hỗ trợ.
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const FALLBACK_MODELS = ['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5'];
const DEFAULT_MODEL = 'claude-opus-5-5';

/** Lỗi có thông báo hiển thị được cho người học. */
export class UserFacingError extends Error {}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

const MessageResponseSchema = z.object({
  content: z.array(z.object({ type: z.string(), text: z.string().optional() })),
  stop_reason: z.string().nullable(),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }),
});

function setting(key: string): string | null {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/** AI chỉ bật khi quản trị đã cài ANTHROPIC_API_KEY; thêm/xoá key là bật/tắt, không cần triển khai lại. */
export function aiEnabled(): boolean {
  return Boolean(setting('ANTHROPIC_API_KEY'));
}

function callMessages(body: Record<string, unknown>): { text: string; usage: Usage } {
  const apiKey = setting('ANTHROPIC_API_KEY');
  if (!apiKey) throw new UserFacingError('Quản trị chưa cài ANTHROPIC_API_KEY trong Apps Script.');
  const model = setting('CLAUDE_MODEL') || DEFAULT_MODEL;
  const fallback = FALLBACK_MODELS.includes(model);
  const res = UrlFetchApp.fetch(API_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': apiKey, 'anthropic-version': API_VERSION, ...(fallback ? { 'anthropic-beta': FALLBACK_BETA } : {}) },
    payload: JSON.stringify({ model, ...(fallback ? { fallbacks: 'default' } : {}), ...body }),
    muteHttpExceptions: true,
  });
  const status = res.getResponseCode();
  if (status === 401 || status === 403) throw new UserFacingError('API key của Claude không hợp lệ. Báo quản trị kiểm tra lại.');
  if (status === 429 || status === 529) throw new UserFacingError('AI đang quá tải, thử lại sau ít phút.');
  if (status !== 200) {
    console.error(`Claude API ${status}: ${res.getContentText().slice(0, 500)}`);
    throw new UserFacingError(`AI tạm thời lỗi (${status}). Thử lại sau.`);
  }
  const msg = MessageResponseSchema.parse(JSON.parse(res.getContentText()));
  if (msg.stop_reason === 'refusal') throw new UserFacingError('Nội dung này không xử lý được. Hãy thử diễn đạt khác.');
  // Phản hồi có thể chứa khối thinking/fallback; chỉ lấy phần chữ.
  const text = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim();
  return { text, usage: { inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens } };
}

export function chat(req: ChatRequest): { reply: string; usage: Usage } {
  const { text, usage } = callMessages({
    max_tokens: 2000,
    // Hội thoại cần nhanh và ngắn; mức effort thấp là đủ.
    output_config: { effort: 'low' },
    system: chatSystemPrompt(req),
    messages: req.messages,
  });
  if (!text) throw new UserFacingError('Bot chưa trả lời được, thử gửi lại.');
  return { reply: text, usage };
}

const { $schema: _ignored, ...GRADE_JSON_SCHEMA } = z.toJSONSchema(GradeResultSchema) as Record<string, unknown>;

export function grade(req: GradeRequest): { result: GradeResult; usage: Usage } {
  const { text, usage } = callMessages({
    max_tokens: 8000,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: GRADE_JSON_SCHEMA } },
    system: gradeSystemPrompt(req),
    messages: [{ role: 'user', content: gradeUserPrompt(req) }],
  });
  const parsed = GradeResultSchema.safeParse(JSON.parse(text));
  if (!parsed.success) throw new UserFacingError('Không đọc được kết quả chấm, thử nộp lại.');
  return { result: { ...parsed.data, score: Math.max(0, Math.min(100, Math.round(parsed.data.score))) }, usage };
}
