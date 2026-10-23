import { GradeResultSchema, type ChatRequest, type GradeRequest, type GradeResult } from '../../shared/api';

async function errorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? `Lỗi ${res.status}`;
  } catch {
    return `Lỗi ${res.status}`;
  }
}

export async function gradeResponse(req: GradeRequest): Promise<GradeResult> {
  const res = await fetch('/api/grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return GradeResultSchema.parse(await res.json());
}

const STREAM_ERROR = /\n\[\[error:(.*)\]\]$/;

/** Gửi hội thoại, gọi onText với toàn bộ câu trả lời tích luỹ mỗi khi có chữ mới. */
export async function streamChat(req: ChatRequest, onText: (soFar: string) => void): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok || !res.body) throw new Error(await errorMessage(res));
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
    onText(text.replace(STREAM_ERROR, ''));
  }
  const failed = STREAM_ERROR.exec(text);
  if (failed) throw new Error(failed[1]);
  return text;
}
