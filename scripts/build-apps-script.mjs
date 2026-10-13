// Sinh apps-script/Code.gs từ template + JSON câu hỏi + schema Sheets (một nguồn dữ liệu duy nhất).
// Chạy: npm run build:gas   ·   Kiểm tra không lệch: node scripts/build-apps-script.mjs --check
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const questionnaire = JSON.parse(read('src/data/lamson-30.vi.json'));
const schema = JSON.parse(read('src/data/lamson-30.sheets-schema.json'));
const consent = /CONSENT_VERSION = '([^']+)'/.exec(read('src/domain/session.ts'))?.[1];
if (!consent) throw new Error('Không tìm thấy CONSENT_VERSION trong src/domain/session.ts');

const lean = {
  version: questionnaire.version,
  questions: questionnaire.questions.map((q) => ({
    id: q.id,
    section: q.section,
    dimension: q.dimension,
    scored: q.scored,
    text: q.text,
  })),
  rules: {
    discQuestions: questionnaire.rules.discQuestions,
    minAnsweredPerDimension: questionnaire.rules.minAnsweredPerDimension,
    minAnsweredDiscTotal: questionnaire.rules.minAnsweredDiscTotal,
    closeDelta: questionnaire.rules.closeDelta,
    flatRange: questionnaire.rules.flatRange,
  },
};

const out = read('apps-script/Code.template.js')
  .replace('/*__QUESTIONNAIRE__*/ null', JSON.stringify(lean, null, 2))
  .replace('/*__SHEETS_SCHEMA__*/ null', JSON.stringify({ version: schema.version, tabs: schema.tabs }, null, 2))
  .replace('/*__CONSENT_VERSION__*/', consent);

const target = join(root, 'apps-script/Code.gs');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== out) {
    console.error('apps-script/Code.gs đã cũ. Chạy: npm run build:gas');
    process.exit(1);
  }
  console.log('apps-script/Code.gs khớp nguồn.');
} else {
  writeFileSync(target, out);
  console.log('Đã sinh apps-script/Code.gs');
}
