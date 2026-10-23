// Máy chủ dev: chạy apps-script/Code.gs thật trên bảng tính giả (lưu ở .dev-data/sheets.json),
// gọi Claude thật nếu có ANTHROPIC_API_KEY trong .env. Giao diện (vite) chuyển /api tới đây.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { FakeSpreadsheet, loadGas, type FetchHandler } from './gas-harness.ts';

const PORT = Number(process.env.PORT ?? 8787);
const DATA_DIR = join(import.meta.dirname, '../.dev-data');
const DATA_FILE = join(DATA_DIR, 'sheets.json');

// UrlFetchApp là đồng bộ; trong Node mô phỏng bằng một tiến trình con chạy fetch.
const FETCH_SCRIPT = `
const { url, headers, body } = JSON.parse(require('fs').readFileSync(0, 'utf8'));
fetch(url, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => process.stdout.write(JSON.stringify({ status: r.status, body: await r.text() })))
  .catch((e) => process.stdout.write(JSON.stringify({ status: 599, body: String(e) })));
`;
const realFetch: FetchHandler = (call) =>
  JSON.parse(execFileSync(process.execPath, ['-e', FETCH_SCRIPT], { input: JSON.stringify(call), maxBuffer: 10 * 1024 * 1024 }).toString());

mkdirSync(DATA_DIR, { recursive: true });
const ss = existsSync(DATA_FILE) ? FakeSpreadsheet.fromJSON(JSON.parse(readFileSync(DATA_FILE, 'utf8'))) : new FakeSpreadsheet();
const props: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) props.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.CLAUDE_MODEL) props.CLAUDE_MODEL = process.env.CLAUDE_MODEL;

const gas = loadGas({ ss, props, fetch: realFetch });
gas.call('setup');
const save = () => writeFileSync(DATA_FILE, JSON.stringify(ss.toJSON(), null, 1));
save();
const testCode = String(ss.tab('NGUOI_DUNG').rows[1]?.[0]);

createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405).end();
    return;
  }
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const out = gas.post(body);
    save();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(out));
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Apps Script giả lập: http://127.0.0.1:${PORT}  ·  mã truy cập thử: ${testCode}`);
  console.log(`Dữ liệu bảng tính: ${DATA_FILE}${props.ANTHROPIC_API_KEY ? '' : '  ·  (chưa có ANTHROPIC_API_KEY: AI sẽ báo lỗi cấu hình)'}`);
});
