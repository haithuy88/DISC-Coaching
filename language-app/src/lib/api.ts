import {
  ChatReplySchema,
  GradeResultSchema,
  LoginResultSchema,
  type ApiRequest,
  type ChatRequest,
  type GradeRequest,
  type GradeResult,
  type LoginResult,
  type Profile,
} from '../../shared/api';
import { z, type ZodType } from 'zod';

// Bản build cho người dùng gọi thẳng URL /exec của Apps Script; khi dev, vite chuyển /api sang tools/dev-api.ts.
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function call<T>(body: ApiRequest, schema: ZodType<T>): Promise<T> {
  let res: Response;
  try {
    // text/plain để trình duyệt không gửi preflight CORS (Apps Script không trả lời OPTIONS).
    res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
  }
  if (!res.ok) throw new Error(`Máy chủ lỗi (${res.status}).`);
  const json = (await res.json()) as { ok: boolean; data?: unknown; error?: string };
  if (!json.ok) throw new Error(json.error ?? 'Lỗi không rõ.');
  return schema.parse(json.data);
}

export function login(code: string): Promise<LoginResult> {
  return call({ action: 'login', code }, LoginResultSchema);
}

export function saveProgress(code: string, profile: Profile): Promise<unknown> {
  return call({ action: 'saveProgress', code, payload: profile }, z.unknown());
}

export async function chat(code: string, req: ChatRequest): Promise<string> {
  return (await call({ action: 'chat', code, payload: req }, ChatReplySchema)).reply;
}

export function gradeResponse(code: string, req: GradeRequest): Promise<GradeResult> {
  return call({ action: 'grade', code, payload: req }, GradeResultSchema);
}
