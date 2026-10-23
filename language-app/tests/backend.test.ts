import { beforeEach, describe, expect, it } from 'vitest';
import { loadGas, type FetchHandler, type Gas } from '../tools/gas-harness.ts';

const GRADE = {
  score: 104.4,
  estimatedLevel: 'B1',
  summary: 'Tốt',
  strengths: ['Rõ ý'],
  corrections: [{ original: 'I goes', corrected: 'I go', explanation: 'Chia động từ' }],
  improvedVersion: 'I go to work by bus.',
  nextStep: 'Ôn thì hiện tại đơn',
};

function claudeReply(text: string, extra: Record<string, unknown> = {}): ReturnType<FetchHandler> {
  return {
    status: 200,
    body: JSON.stringify({
      content: [{ type: 'thinking', thinking: '' }, { type: 'text', text }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 120, output_tokens: 30 },
      ...extra,
    }),
  };
}

const scenario = { title: 'Hotel', botRole: 'receptionist', learnerRole: 'guest', goal: 'check in', targetPhrases: [] };
const profile = {
  language: 'en',
  level: 'A2',
  results: { a1: { skill: 'reading', score: 80, at: '2026-10-23T00:00:00Z' } },
  review: {},
  conversations: 1,
  xp: 12,
  daily: {},
  dailyGoal: 30,
};

let gas: Gas;
let code: string;
let reply: FetchHandler;

beforeEach(() => {
  reply = () => claudeReply('Welcome to the hotel!');
  gas = loadGas({ props: { ANTHROPIC_API_KEY: 'sk-test' }, fetch: (c) => reply(c) });
  gas.call('setup');
  code = String(gas.ss.tab('NGUOI_DUNG').rows[1]![0]);
});

describe('setup & login', () => {
  it('creates the tabs and a sample user with a readable code', () => {
    expect([...gas.ss.sheets.keys()]).toEqual(['NGUOI_DUNG', 'TIEN_DO', 'NHAT_KY_AI', 'HUONG_DAN']);
    expect(code).toMatch(/^LS-[A-HJ-NP-Z2-9]{6}$/);
    gas.call('setup');
    expect(gas.ss.tab('NGUOI_DUNG').rows).toHaveLength(2);
  });

  it('logs in with a valid code, case-insensitively', () => {
    const res = gas.post({ action: 'login', code: code.toLowerCase() });
    expect(res).toEqual({ ok: true, data: { name: 'Người dùng thử', group: 'Nhân viên', aiEnabled: true, profiles: {} } });
  });

  it('rejects unknown and locked codes', () => {
    expect(gas.post({ action: 'login', code: 'LS-NOPE22' }).error).toBe('Mã truy cập không đúng.');
    gas.ss.tab('NGUOI_DUNG').rows[1]![3] = 'Khoá';
    expect(gas.post({ action: 'login', code }).error).toMatch(/bị khoá/);
  });

  it('rejects malformed requests and unknown fields', () => {
    expect(gas.post('not json').ok).toBe(false);
    expect(gas.post({ action: 'login', code, extra: 1 }).error).toBe('Dữ liệu gửi lên không hợp lệ.');
  });

  it('fills missing access codes for new rows', () => {
    gas.ss.tab('NGUOI_DUNG').rows.push(['', 'Chị Thuỷ', 'Người thân', '', '', '', '']);
    gas.call('taoMaTruyCap');
    const row = gas.ss.tab('NGUOI_DUNG').rows[2]!;
    expect(row[0]).toMatch(/^LS-/);
    expect(row[3]).toBe('Hoạt động');
  });
});

describe('AI calls', () => {
  it('sends a chat request with the expected API shape and logs usage', () => {
    const res = gas.post({
      action: 'chat',
      code,
      payload: { language: 'zh', level: 'A1', scenario, messages: [{ role: 'user', content: '[start]' }] },
    });
    expect(res).toEqual({ ok: true, data: { reply: 'Welcome to the hotel!' } });
    const call = gas.fetchCalls[0]!;
    expect(call.headers['anthropic-version']).toBe('2026-10-21');
    expect(call.headers['anthropic-beta']).toBe('server-side-fallback-2026-07-01');
    expect(call.body).toMatchObject({ model: 'claude-opus-5-5', fallbacks: 'default', output_config: { effort: 'low' } });
    expect(String(call.body.system)).toContain('pinyin');
    const log = gas.ss.tab('NHAT_KY_AI').rows[1]!;
    expect(log.slice(4)).toEqual(['Hội thoại', 'A1', '', '', 120, 30, 'ok']);
  });

  it('honours CLAUDE_MODEL', () => {
    gas.props.set('CLAUDE_MODEL', 'claude-haiku-5-5');
    gas.post({ action: 'chat', code, payload: { language: 'en', level: 'A1', scenario, messages: [{ role: 'user', content: 'hi' }] } });
    expect(gas.fetchCalls[0]!.body.model).toBe('claude-haiku-5-5');
    // Haiku không hỗ trợ fallback phía server.
    expect(gas.fetchCalls[0]!.body.fallbacks).toBeUndefined();
    expect(gas.fetchCalls[0]!.headers['anthropic-beta']).toBeUndefined();
  });

  it('grades with a JSON schema and clamps the score', () => {
    reply = () => claudeReply(JSON.stringify(GRADE));
    const res = gas.post({
      action: 'grade',
      code,
      payload: { language: 'en', level: 'B1', skill: 'writing', task: 'Write', response: 'I goes to work' },
    });
    expect(res.data.score).toBe(100);
    const format = (gas.fetchCalls[0]!.body.output_config as any).format;
    expect(format.type).toBe('json_schema');
    expect(format.schema.$schema).toBeUndefined();
    expect(format.schema.properties.estimatedLevel.enum).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    expect(gas.ss.tab('NHAT_KY_AI').rows[1]!.slice(4, 8)).toEqual(['Chấm writing', 'B1', 100, 'B1']);
  });

  it('turns refusals and bad keys into readable errors and logs them', () => {
    reply = () => claudeReply('', { stop_reason: 'refusal' });
    const chat = () => gas.post({ action: 'chat', code, payload: { language: 'en', level: 'A1', scenario, messages: [{ role: 'user', content: 'x' }] } });
    expect(chat().error).toMatch(/không xử lý được/);
    reply = () => ({ status: 401, body: '{}' });
    expect(chat().error).toMatch(/API key/);
    expect(gas.ss.tab('NHAT_KY_AI').rows[2]![10]).toMatch(/^lỗi/);
  });

  it('reports AI as off without an API key, and refuses AI calls without using quota', () => {
    gas.props.delete('ANTHROPIC_API_KEY');
    expect(gas.post({ action: 'login', code }).data.aiEnabled).toBe(false);
    const res = gas.post({ action: 'chat', code, payload: { language: 'en', level: 'A1', scenario, messages: [{ role: 'user', content: 'x' }] } });
    expect(res.error).toBe('Tính năng AI đang tắt.');
    expect(gas.fetchCalls).toHaveLength(0);
    expect([...gas.props.keys()].some((k) => k.startsWith('usage:'))).toBe(false);
  });

  it('enforces the daily AI limit per user without calling Claude', () => {
    gas.ss.tab('NGUOI_DUNG').rows[1]![4] = 2;
    const chat = () => gas.post({ action: 'chat', code, payload: { language: 'en', level: 'A1', scenario, messages: [{ role: 'user', content: 'x' }] } });
    expect(chat().ok).toBe(true);
    expect(chat().ok).toBe(true);
    expect(chat().error).toMatch(/hết 2 lượt/);
    expect(gas.fetchCalls).toHaveLength(2);
  });
});

describe('progress', () => {
  it('saves a report row per user and language and returns it at login', () => {
    expect(gas.post({ action: 'saveProgress', code, payload: profile }).ok).toBe(true);
    gas.post({ action: 'saveProgress', code, payload: { ...profile, xp: 20 } });
    const rows = gas.ss.tab('TIEN_DO').rows;
    expect(rows).toHaveLength(2);
    expect(rows[1]!.slice(0, 12)).toEqual([code, 'Người dùng thử', 'Nhân viên', 'en', 'A2', 20, 0, '', '', 80, '', 1]);
    const login = gas.post({ action: 'login', code });
    expect(login.data.profiles.en.xp).toBe(20);
  });

  it('rejects oversized or invalid progress', () => {
    expect(gas.post({ action: 'saveProgress', code, payload: { ...profile, level: 'Z9' } }).ok).toBe(false);
  });
});
