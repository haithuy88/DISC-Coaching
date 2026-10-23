// Máy chủ nhỏ: giữ API key phía server, kiểm tra payload, gọi Claude.
// Ở chế độ production còn phục vụ luôn thư mục dist/ của giao diện.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';
import { ChatRequestSchema, GradeRequestSchema } from '../shared/api.ts';
import { Anthropic, RefusalError, grade, streamChat } from './claude.ts';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY_BYTES = 64 * 1024;
// Giới hạn đơn giản theo IP để một người không đốt hết chi phí API. Thay bằng giới hạn
// theo tài khoản khi có đăng nhập.
const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 30);
const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readJson<T>(req: IncomingMessage, schema: ZodType<T>): Promise<T> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Nội dung quá dài');
    chunks.push(chunk as Buffer);
  }
  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'JSON không hợp lệ');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, 'Dữ liệu gửi lên không hợp lệ');
  return parsed.data;
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof RefusalError) return new HttpError(422, 'Nội dung này không thể xử lý. Hãy thử diễn đạt khác.');
  if (err instanceof Anthropic.AuthenticationError) return new HttpError(500, 'Máy chủ chưa cấu hình đúng ANTHROPIC_API_KEY');
  if (err instanceof Anthropic.RateLimitError) return new HttpError(503, 'AI đang quá tải, thử lại sau ít phút');
  if (err instanceof Anthropic.APIError) return new HttpError(502, `Lỗi từ AI (${err.status ?? 'mạng'})`);
  console.error(err);
  return new HttpError(500, 'Lỗi máy chủ');
}

async function handleChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJson(req, ChatRequestSchema);
  const chunks = streamChat(body);
  // Lấy đoạn đầu tiên trước khi gửi header, để lỗi sớm (sai key, quá tải) vẫn trả được mã lỗi đúng.
  const first = await chunks.next();
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  if (!first.done) res.write(first.value);
  try {
    for await (const text of chunks) res.write(text);
  } catch (err) {
    // Header đã gửi; báo lỗi bằng một dòng đánh dấu mà giao diện nhận ra.
    res.write(`\n[[error:${toHttpError(err).message}]]`);
  }
  res.end();
}

async function handleGrade(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJson(req, GradeRequestSchema);
  sendJson(res, 200, await grade(body));
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
};

async function serveStatic(pathname: string, res: ServerResponse): Promise<void> {
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(DIST_DIR, safe === '/' ? 'index.html' : safe);
  try {
    if (!file.startsWith(DIST_DIR)) throw new Error('outside dist');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    // Ứng dụng một trang: đường dẫn lạ trả về index.html.
    const index = await readFile(join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(index);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) });
    }
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'POST') throw new HttpError(405, 'Chỉ nhận POST');
      if (rateLimited(req.socket.remoteAddress ?? 'unknown')) throw new HttpError(429, 'Gửi quá nhanh, chờ một chút nhé');
      if (url.pathname === '/api/chat') return await handleChat(req, res);
      if (url.pathname === '/api/grade') return await handleGrade(req, res);
      throw new HttpError(404, 'Không tìm thấy');
    }
    if (isProduction) return await serveStatic(url.pathname, res);
    throw new HttpError(404, 'Giao diện chạy ở Vite (npm run dev)');
  } catch (err) {
    const httpErr = toHttpError(err);
    if (res.headersSent) return void res.end();
    sendJson(res, httpErr.status, { error: httpErr.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API: http://127.0.0.1:${PORT}`);
});
