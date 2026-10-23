// Đóng gói backend/main.ts (kèm shared/ và zod) thành một file apps-script/Code.gs để dán vào Apps Script.
// Chạy: npm run build:gas   ·   Kiểm tra Code.gs không cũ: node scripts/build-gas.mjs --check
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'apps-script/Code.gs');
const GLOBAL = 'PolyglotBackend';
// Apps Script chỉ gọi được hàm khai báo ở phạm vi toàn cục.
const ENTRY_POINTS = ['doPost', 'doGet', 'setup', 'onOpen', 'taoMaTruyCap'];

const result = await build({
  configFile: false,
  root,
  logLevel: 'warn',
  build: {
    write: false,
    minify: true,
    target: 'es2020',
    lib: { entry: join(root, 'backend/main.ts'), formats: ['iife'], name: GLOBAL, fileName: () => 'Code.js' },
  },
});
const bundle = (Array.isArray(result) ? result[0] : result).output[0].code;

const out = [
  '// FILE SINH TỰ ĐỘNG từ language-app/backend/ — không sửa tay. Sửa nguồn rồi chạy: npm run build:gas',
  '// Dán toàn bộ nội dung file này vào Code.gs của Apps Script (xem README, mục Triển khai).',
  bundle.trim(),
  '',
  ...ENTRY_POINTS.map((fn) => `function ${fn}(e) { return ${GLOBAL}.${fn}(e); }`),
  '',
].join('\n');

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(target, 'utf8');
  } catch {
    // chưa có file
  }
  if (current !== out) {
    console.error('apps-script/Code.gs đã cũ. Chạy: npm run build:gas');
    process.exit(1);
  }
  console.log('apps-script/Code.gs khớp nguồn.');
} else {
  writeFileSync(target, out);
  console.log(`Đã sinh apps-script/Code.gs (${Math.round(out.length / 1024)} KB)`);
}
