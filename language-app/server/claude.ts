import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import {
  GradeResultSchema,
  type ChatRequest,
  type GradeRequest,
  type GradeResult,
} from '../shared/api.ts';
import { chatSystemPrompt, gradeSystemPrompt, gradeUserPrompt } from './prompts.ts';

// Đổi model qua biến môi trường mà không cần sửa code (vd. claude-haiku-5-5 để giảm chi phí).
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-opus-5-5';

// Khi bộ lọc an toàn từ chối, API tự chạy lại yêu cầu trên model dự phòng do Anthropic chọn.
const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: Anthropic.Beta.Messages.BetaFallbacksParam } = {
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
};

const client = new Anthropic();

export class RefusalError extends Error {}

/** Bot hội thoại: trả về từng đoạn chữ ngay khi model sinh ra. */
export async function* streamChat(req: ChatRequest): AsyncGenerator<string> {
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    // Hội thoại cần nhanh và ngắn; mức effort thấp là đủ.
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: chatSystemPrompt(req), cache_control: { type: 'ephemeral' } }],
    messages: req.messages,
    ...FALLBACK,
  });
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') throw new RefusalError('refusal');
}

export async function grade(req: GradeRequest): Promise<GradeResult> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium', format: betaZodOutputFormat(GradeResultSchema) },
    system: gradeSystemPrompt(req),
    messages: [{ role: 'user', content: gradeUserPrompt(req) }],
    ...FALLBACK,
  });
  if (response.stop_reason === 'refusal') throw new RefusalError('refusal');
  const parsed = response.parsed_output;
  if (!parsed) throw new Error(`Không đọc được kết quả chấm (stop_reason=${response.stop_reason})`);
  return { ...parsed, score: Math.max(0, Math.min(100, Math.round(parsed.score))) };
}

export { Anthropic };
