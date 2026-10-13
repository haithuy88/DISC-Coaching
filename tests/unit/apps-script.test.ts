import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sheetsSchema from '../../src/data/lamson-30.sheets-schema.json';
import { allDiscAnswersIdentical, interpret } from '../../src/domain/interpretation';
import { QUESTIONS } from '../../src/domain/questionnaire';
import { scoreAnswers } from '../../src/domain/scoring';
import { emptySession, type Session } from '../../src/domain/session';
import { buildPayload, receiptSchema, type SubmissionPayload } from '../../src/domain/submission';
import { DIMENSIONS, type AnswerMap, type AnswerValue } from '../../src/domain/types';
import { loadGas, type Gas } from './gas-harness';
import { answersByDimension } from './helpers';

const TABS = ['KET_QUA', 'TRA_LOI', 'DANH_SACH', 'CAU_HOI', 'HUONG_DAN'] as const;

function session(answers: AnswerMap, overrides: Partial<Session['participant']> = {}): Session {
  return {
    ...emptySession(),
    consentAt: '2026-10-12T02:00:00.000Z',
    submissionId: '11111111-2222-4333-8444-555555555555',
    participant: { fullName: 'Người thử A', department: 'Phòng thử nghiệm', title: '', ...overrides },
    answers,
  };
}

function ready(): Gas {
  const gas = loadGas();
  gas.setup();
  return gas;
}

const payload = (answers = answersByDimension({ D: 5, I: 3, S: 2, C: 1 }), p = {}) => buildPayload(session(answers, p));
const dataRows = (gas: Gas, tab: string) => gas.ss.tab(tab).rows.slice(1);

describe('Code.gs được sinh từ nguồn', () => {
  it('khớp template + JSON hiện tại', () => {
    expect(() => execFileSync('node', ['scripts/build-apps-script.mjs', '--check'], { stdio: 'pipe' })).not.toThrow();
  });
});

describe('setup()', () => {
  it('tạo đúng 5 tab với tiêu đề theo schema, CAU_HOI đủ 30 câu, HUONG_DAN có nội dung', () => {
    const gas = ready();
    expect([...gas.ss.sheets.keys()].sort()).toEqual([...TABS].sort());
    for (const t of TABS) expect(gas.ss.tab(t).rows[0]).toEqual(sheetsSchema.tabs[t]);
    const q = dataRows(gas, 'CAU_HOI');
    expect(q).toHaveLength(30);
    expect(q.filter((r) => r[4] === 'TRUE')).toHaveLength(24);
    expect(q.find((r) => r[1] === 'L1')?.[2]).toBe('Leadership');
    expect(dataRows(gas, 'HUONG_DAN').length).toBeGreaterThan(3);
    expect(dataRows(gas, 'DANH_SACH')).toHaveLength(0);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(0);
  });

  it('chạy lại không tạo trùng, giữ tab cũ (ví dụ COACH_CA_NHAN) và dữ liệu cũ', () => {
    const gas = loadGas();
    const old = gas.ss.insertSheet('COACH_CA_NHAN');
    old.rows = [['x'], ['dữ liệu cũ']];
    gas.setup();
    gas.setup();
    expect(dataRows(gas, 'CAU_HOI')).toHaveLength(30);
    expect(gas.ss.tab('COACH_CA_NHAN').rows).toEqual([['x'], ['dữ liệu cũ']]);
  });

  it('tiêu đề sai lệch → báo lỗi, không ghi đè', () => {
    const gas = loadGas();
    const s = gas.ss.insertSheet('KET_QUA');
    s.rows = [['Cot_khac'], ['giữ nguyên']];
    expect(() => gas.setup()).toThrow(/tiêu đề cột khác schema/);
    expect(s.rows).toEqual([['Cot_khac'], ['giữ nguyên']]);
  });
});

describe('doPost: ghi bài nộp', () => {
  it('ghi 1 dòng KET_QUA + 1 dòng TRA_LOI, ánh xạ đúng tiêu đề, N/A là "N/A", điểm do máy chủ tính', () => {
    const gas = ready();
    const answers = answersByDimension({ D: 5, I: 3, S: 2, C: 1 });
    answers.L2 = null;
    const res = gas.post(payload(answers, { title: 'Trưởng phòng' }));
    const receipt = receiptSchema.parse(res);
    expect(receipt.duplicate).toBe(false);
    expect(receipt.scores.D).toEqual({ n: 6, score: 100 });
    expect(receipt.pattern).toBe('clearer');

    const kq = dataRows(gas, 'KET_QUA');
    expect(kq).toHaveLength(1);
    const row = Object.fromEntries(sheetsSchema.tabs.KET_QUA.map((h, i) => [h, kq[0]![i]]));
    expect(row.Ho_ten).toBe('Người thử A');
    expect(row.Phong_ban).toBe('Phòng thử nghiệm');
    expect(row.Chuc_danh).toBe('Trưởng phòng');
    expect(row.Questionnaire_version).toBe('lamson-disc-30-vi-3.0.0');
    expect(row.N_DISC).toBe(24);
    expect([row.Score_D, row.Score_I, row.Score_S, row.Score_C]).toEqual([100, 50, 25, 0]);
    expect(row.Data_status).toBe('complete');
    expect(row.Candidate_groups).toBe('D');
    expect(String(row.Preliminary_summary)).toMatch(/^Trong các câu trả lời này/);
    expect(String(row.Participant_ID)).toMatch(/^P-[0-9a-f]{12}$/);

    const tl = dataRows(gas, 'TRA_LOI');
    expect(tl).toHaveLength(1);
    const ans = Object.fromEntries(sheetsSchema.tabs.TRA_LOI.map((h, i) => [h, tl[0]![i]]));
    expect(ans.D1).toBe(5);
    expect(ans.C6).toBe(1);
    expect(ans.L1).toBe(3);
    expect(ans.L2).toBe('N/A');
  });

  it('gửi lại cùng mã + cùng nội dung → không ghi trùng, trả duplicate', () => {
    const gas = ready();
    const p = payload();
    gas.post(p);
    const again = receiptSchema.parse(gas.post(p));
    expect(again.duplicate).toBe(true);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(1);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(1);
  });

  it('cùng mã nhưng khác câu trả lời → từ chối (conflict), không ghi đè', () => {
    const gas = ready();
    gas.post(payload());
    const changed = payload(answersByDimension({ D: 1, I: 3, S: 2, C: 1 }));
    const res = gas.post(changed);
    expect(res.ok).toBe(false);
    expect(res.conflict).toBe(true);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(1);
    expect(dataRows(gas, 'TRA_LOI')[0]![4]).toBe(5);
  });

  it('Google trả 403/429 trước khi ghi → báo lỗi, không có dòng nào; thử lại thì ghi được', () => {
    const gas = ready();
    gas.ss.tab('TRA_LOI').failBeforeWrite = new Error('429 Too Many Requests');
    const res = gas.post(payload());
    expect(res.ok).toBe(false);
    expect(String(res.error)).toContain('Chưa ghi được');
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(0);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(0);
    expect(receiptSchema.parse(gas.post(payload())).duplicate).toBe(false);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(1);
  });

  it('ghi một phần (TRA_LOI xong, KET_QUA lỗi 403) → lần thử lại bổ sung KET_QUA, không trùng TRA_LOI', () => {
    const gas = ready();
    gas.ss.tab('KET_QUA').failBeforeWrite = new Error('403 Forbidden');
    expect(gas.post(payload()).ok).toBe(false);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(1);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(0);
    const retry = receiptSchema.parse(gas.post(payload()));
    expect(retry.ok).toBe(true);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(1);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(1);
  });

  it('timeout sau khi đã ghi → thử lại không tạo dòng trùng', () => {
    const gas = ready();
    gas.ss.tab('KET_QUA').failAfterWrite = new Error('timeout');
    expect(gas.post(payload()).ok).toBe(false);
    const retry = receiptSchema.parse(gas.post(payload()));
    expect(retry.duplicate).toBe(true);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(1);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(1);
  });

  it('chặn công thức: tên bắt đầu bằng = + - @ được ghi như văn bản', () => {
    const gas = ready();
    gas.post(payload(undefined, { fullName: '=HYPERLINK("http://x","bấm")', department: '+Phòng', title: '@abc' }));
    const row = Object.fromEntries(sheetsSchema.tabs.KET_QUA.map((h, i) => [h, dataRows(gas, 'KET_QUA')[0]![i]]));
    expect(row.Ho_ten).toBe('\'=HYPERLINK("http://x","bấm")');
    expect(row.Phong_ban).toBe("'+Phòng");
    expect(row.Chuc_danh).toBe("'@abc");
  });

  it('doGet mở trang khảo sát (Index); ?status=1 chỉ trả trạng thái, không trả dữ liệu', () => {
    const gas = ready();
    gas.post(payload());
    const page = gas.doGet({ parameter: {} });
    expect(page.file).toBe('Index');
    expect(page.meta).toContainEqual(['viewport', 'width=device-width, initial-scale=1']);
    const res = JSON.parse(String(gas.doGet({ parameter: { status: '1' } }).content)) as Record<string, unknown>;
    expect(Object.keys(res).sort()).toEqual(['ok', 'questionnaireVersion', 'service']);
  });

  it('submitSurvey (google.script.run) dùng cùng kiểm tra và ghi như doPost', () => {
    const gas = ready();
    const p = payload();
    expect(receiptSchema.parse(gas.submitSurvey(JSON.stringify(p))).duplicate).toBe(false);
    expect(receiptSchema.parse(gas.submitSurvey(JSON.stringify(p))).duplicate).toBe(true);
    expect(gas.submitSurvey({ not: 'text' }).ok).toBe(false);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(1);
  });

  it('Index.html: một file, không còn tham chiếu assets/, đúng phiên bản câu hỏi', () => {
    const html = readFileSync('apps-script/Index.html', 'utf8');
    expect(html).toContain('<div id="root"></div>');
    expect(html).not.toMatch(/(src|href)="\.?\/?assets\//);
    expect(html).not.toContain('@font-face');
    expect(html).toContain('lamson-disc-30-vi-3.0.0');
  });
});

describe('doPost: từ chối dữ liệu xấu, không ghi gì', () => {
  const base = (): SubmissionPayload => payload();
  const cases: [string, (p: SubmissionPayload) => unknown][] = [
    ['phiên bản cũ 32 câu', (p) => ({ ...p, questionnaireVersion: 'disc-reflection-vi-1.0.0' })],
    ['thiếu một câu (29)', (p) => ({ ...p, answers: p.answers.slice(1) })],
    ['ID trùng', (p) => ({ ...p, answers: [...p.answers.slice(1), p.answers[1]] })],
    ['ID lạ', (p) => ({ ...p, answers: [{ id: 'X9', value: 3 }, ...p.answers.slice(1)] })],
    ['giá trị là chuỗi', (p) => ({ ...p, answers: [{ id: 'D1', value: '4' }, ...p.answers.slice(1)] })],
    ['giá trị 3.5', (p) => ({ ...p, answers: [{ id: 'D1', value: 3.5 }, ...p.answers.slice(1)] })],
    ['giá trị 6', (p) => ({ ...p, answers: [{ id: 'D1', value: 6 }, ...p.answers.slice(1)] })],
    ['giá trị 0', (p) => ({ ...p, answers: [{ id: 'D1', value: 0 }, ...p.answers.slice(1)] })],
    ['thiếu họ tên', (p) => ({ ...p, participant: { ...p.participant, fullName: ' ' } })],
    ['thiếu phòng ban', (p) => ({ ...p, participant: { ...p.participant, department: '' } })],
    ['trường thừa (điểm do client gửi)', (p) => ({ ...p, scores: { D: 100 } })],
    ['phiên bản đồng ý sai', (p) => ({ ...p, consentVersion: 'x' })],
    ['mã lần nộp sai', (p) => ({ ...p, submissionId: '../../x' })],
  ];
  it.each(cases)('%s', (_label, mutate) => {
    const gas = ready();
    const res = gas.post(mutate(base()));
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe('string');
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(0);
    expect(dataRows(gas, 'TRA_LOI')).toHaveLength(0);
  });

  it('NaN/Infinity (JSON thành null hoặc lỗi), __proto__, JSON hỏng, quá lớn', () => {
    const gas = ready();
    const text = JSON.stringify(base());
    expect(gas.post(text.replace('"value":5', '"value":1e999')).ok).toBe(false);
    expect(gas.post(text.replace('"participant":{', '"participant":{"__proto__":{"x":1},')).ok).toBe(false);
    expect(gas.post('{khong-phai-json').ok).toBe(false);
    expect(gas.post('x'.repeat(30000)).ok).toBe(false);
    expect(dataRows(gas, 'KET_QUA')).toHaveLength(0);
  });
});

describe('máy chủ và app chấm giống nhau', () => {
  it('300 bộ đáp án ngẫu nhiên (cả N/A, thiếu dữ liệu): điểm và diễn giải trùng khớp', () => {
    const gas = loadGas();
    const scoreGas = gas.ctx.scoreAnswers_ as (a: AnswerMap) => { scores: Record<string, { n: number; score: number | null }>; nDisc: number };
    const interpGas = gas.ctx.interpret_ as (s: unknown, a: AnswerMap) => Record<string, unknown>;
    let seed = 42;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (let i = 0; i < 300; i++) {
      const answers: AnswerMap = {};
      const naRate = rnd() * 0.3;
      for (const q of QUESTIONS) answers[q.id] = (rnd() < naRate ? null : 1 + Math.floor(rnd() * 5)) as AnswerValue;
      const ts = scoreAnswers(answers);
      const tsI = interpret(ts, { allIdentical: allDiscAnswersIdentical(answers) });
      const g = scoreGas(answers);
      const gI = interpGas(g, answers);
      expect(g.nDisc).toBe(ts.nDisc);
      for (const d of DIMENSIONS) {
        expect(g.scores[d]!.n).toBe(ts.dimensions[d].n);
        expect(g.scores[d]!.score).toBe(ts.dimensions[d].score);
      }
      expect(gI.dataStatus).toBe(tsI.dataStatus);
      expect(gI.pattern).toBe(tsI.pattern);
      expect([...(gI.candidates as string[])]).toEqual(tsI.candidates);
      expect(gI.reviewSuggested).toBe(tsI.reviewSuggested);
    }
  });
});
