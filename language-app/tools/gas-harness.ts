// Chạy apps-script/Code.gs thật trong Node với các dịch vụ Google giả lập.
// Dùng cho unit test và cho máy chủ dev (tools/dev-api.ts).
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

export class FakeSheet {
  rows: unknown[][] = [];
  frozen = 0;
  readonly name: string;
  constructor(name: string, rows: unknown[][] = []) {
    this.name = name;
    this.rows = rows;
  }
  getName() {
    return this.name;
  }
  getLastRow() {
    return this.rows.length;
  }
  setFrozenRows(n: number) {
    this.frozen = n;
  }
  getRange(row: number, col: number, numRows: number, numCols: number) {
    const range = {
      getValues: () =>
        Array.from({ length: numRows }, (_, i) =>
          Array.from({ length: numCols }, (_, j) => this.rows[row - 1 + i]?.[col - 1 + j] ?? ''),
        ),
      setValues: (values: unknown[][]) => {
        values.forEach((r, i) => {
          const target = (this.rows[row - 1 + i] ??= []);
          r.forEach((v, j) => (target[col - 1 + j] = v));
        });
        return range;
      },
    };
    return range;
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
  tab(name: string): FakeSheet {
    const s = this.sheets.get(name);
    if (!s) throw new Error(`no tab ${name}`);
    return s;
  }
  toJSON(): Record<string, unknown[][]> {
    return Object.fromEntries([...this.sheets].map(([k, v]) => [k, v.rows]));
  }
  static fromJSON(data: Record<string, unknown[][]>): FakeSpreadsheet {
    const ss = new FakeSpreadsheet();
    for (const [name, rows] of Object.entries(data)) ss.sheets.set(name, new FakeSheet(name, rows));
    return ss;
  }
}

export interface FetchCall {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}
/** Thay cho UrlFetchApp.fetch: nhận yêu cầu, trả status + nội dung. */
export type FetchHandler = (call: FetchCall) => { status: number; body: string };

export interface Gas {
  ss: FakeSpreadsheet;
  props: Map<string, string>;
  fetchCalls: FetchCall[];
  /** Gọi doPost với body JSON, trả về phản hồi đã parse. */
  post: (body: unknown) => { ok: boolean; data?: any; error?: string };
  call: (fn: string) => unknown;
}

export function loadGas(options: { ss?: FakeSpreadsheet; props?: Record<string, string>; fetch?: FetchHandler; codePath?: string } = {}): Gas {
  const code = readFileSync(options.codePath ?? join(import.meta.dirname, '../apps-script/Code.gs'), 'utf8');
  const ss = options.ss ?? new FakeSpreadsheet();
  const props = new Map(Object.entries(options.props ?? {}));
  const fetchCalls: FetchCall[] = [];
  const handler: FetchHandler = options.fetch ?? (() => ({ status: 500, body: 'no fetch handler' }));
  const ctx: Record<string, unknown> = {
    console: { error: () => undefined, log: () => undefined },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      getUi: () => ({
        createMenu: () => ({ addItem() { return this; }, addToUi() {} }),
        alert: () => undefined,
      }),
    },
    UrlFetchApp: {
      fetch: (url: string, params: { headers: Record<string, string>; payload: string }) => {
        const call = { url, headers: params.headers, body: JSON.parse(params.payload) as Record<string, unknown> };
        fetchCalls.push(call);
        const res = handler(call);
        return { getResponseCode: () => res.status, getContentText: () => res.body };
      },
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => props.get(k) ?? null,
        setProperty: (k: string, v: string) => void props.set(k, v),
        deleteProperty: (k: string) => void props.delete(k),
        getKeys: () => [...props.keys()],
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => undefined, releaseLock: () => undefined }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (content: string) => ({ content, setMimeType() { return this; } }),
    },
    Utilities: {
      getUuid: () => randomUUID(),
      formatDate: (d: Date, tz: string, fmt: string) => {
        const parts = Object.fromEntries(
          new Intl.DateTimeFormat('en-GB', {
            timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
          })
            .formatToParts(d)
            .map((p) => [p.type, p.value]),
        );
        return fmt
          .replace('yyyy', parts.year!).replace('MM', parts.month!).replace('dd', parts.day!)
          .replace('HH', parts.hour!).replace('mm', parts.minute!).replace('ss', parts.second!);
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const doPost = ctx.doPost as (e: unknown) => { content: string };
  return {
    ss,
    props,
    fetchCalls,
    post: (body) => JSON.parse(doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).content),
    call: (fn) => (ctx[fn] as () => unknown)(),
  };
}
