import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

/** Bảng tính giả trong bộ nhớ, đủ API mà Code.gs dùng. Chỉ dành cho kiểm thử. */
export class FakeSheet {
  rows: unknown[][] = [];
  frozen = 0;
  /** ném lỗi trước khi ghi (ví dụ 403/429) */
  failBeforeWrite: Error | null = null;
  /** ghi xong rồi mới ném lỗi (ví dụ timeout không rõ đã ghi) */
  failAfterWrite: Error | null = null;
  constructor(public name: string) {}
  getLastRow() {
    return this.rows.length;
  }
  getLastColumn() {
    return this.rows.reduce((m, r) => Math.max(m, r.length), 0);
  }
  setFrozenRows(n: number) {
    this.frozen = n;
  }
  getRange(row: number, col: number, numRows: number, numCols: number) {
    return {
      getValues: () =>
        Array.from({ length: numRows }, (_, i) =>
          Array.from({ length: numCols }, (_, j) => this.rows[row - 1 + i]?.[col - 1 + j] ?? ''),
        ),
      setValues: (values: unknown[][]) => {
        if (this.failBeforeWrite) {
          const e = this.failBeforeWrite;
          this.failBeforeWrite = null;
          throw e;
        }
        values.forEach((r, i) => {
          const target = (this.rows[row - 1 + i] ??= []);
          r.forEach((v, j) => (target[col - 1 + j] = v));
        });
        if (this.failAfterWrite) {
          const e = this.failAfterWrite;
          this.failAfterWrite = null;
          throw e;
        }
      },
    };
  }
}

export class FakeSpreadsheet {
  sheets = new Map<string, FakeSheet>();
  getSheetByName(name: string) {
    return this.sheets.get(name) ?? null;
  }
  insertSheet(name: string) {
    const s = new FakeSheet(name);
    this.sheets.set(name, s);
    return s;
  }
  tab(name: string) {
    const s = this.sheets.get(name);
    if (!s) throw new Error(`no tab ${name}`);
    return s;
  }
}

export interface Gas {
  ss: FakeSpreadsheet;
  setup: () => string;
  doPost: (e: unknown) => { content: string };
  doGet: () => { content: string };
  post: (body: unknown) => Record<string, unknown>;
  ctx: Record<string, unknown>;
}

export function loadGas(): Gas {
  const code = readFileSync(join(process.cwd(), 'apps-script/Code.gs'), 'utf8');
  const ss = new FakeSpreadsheet();
  const ctx: Record<string, unknown> = {
    console: { error: () => undefined, log: () => undefined },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush: () => undefined },
    LockService: { getScriptLock: () => ({ waitLock: () => undefined, releaseLock: () => undefined }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (content: string) => ({ content, setMimeType() { return this; } }),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_alg: string, s: string) =>
        Array.from(createHash('sha256').update(s, 'utf8').digest()).map((b) => (b > 127 ? b - 256 : b)),
      formatDate: (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const doPost = ctx.doPost as Gas['doPost'];
  return {
    ss,
    ctx,
    setup: ctx.setup as Gas['setup'],
    doPost,
    doGet: ctx.doGet as Gas['doGet'],
    post: (body) =>
      JSON.parse(
        doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).content,
      ) as Record<string, unknown>,
  };
}
