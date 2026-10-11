import { describe, expect, it } from 'vitest';
import { validateAnswerEntries, validateAnswerMap } from '../../src/domain/answers';
import { buildReport, evaluate, MAX_IMPORT_BYTES, parseReport, REPORT_SCHEMA } from '../../src/domain/report';
import { emptySession, type Session } from '../../src/domain/session';
import { answersByDimension } from './helpers';

function session(overrides: Partial<Session> = {}): Session {
  return {
    ...emptySession(),
    consentAcknowledged: true,
    setting: 'team',
    displayName: 'Học viên thử',
    startedAt: '2026-10-11',
    completedAt: '2026-10-11',
    answers: answersByDimension({ D: 5, I: 2, S: 3, C: 1 }),
    goalText: 'Hỏi thêm một góc nhìn',
    ...overrides,
  };
}

const exportJson = (s: Session, includeAnswers: boolean) =>
  JSON.stringify(buildReport(s, evaluate(s), { includeAnswers, now: new Date('2026-10-11T08:00:00Z') }));

describe('kiểm tra đáp án', () => {
  it('chấp nhận số nguyên 1–5 và null', () => {
    const r = validateAnswerEntries([
      { id: 'D1', value: 1 },
      { id: 'I1', value: 5 },
      { id: 'S1', value: null },
    ]);
    expect(r.ok).toBe(true);
  });

  it.each([
    ['string', '4'],
    ['số thực', 3.5],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
    ['0', 0],
    ['6', 6],
    ['boolean', true],
    ['undefined', undefined],
    ['object', { v: 1 }],
  ])('từ chối giá trị %s', (_label, value) => {
    expect(validateAnswerEntries([{ id: 'D1', value }]).ok).toBe(false);
  });

  it('từ chối ID lạ và ID trùng', () => {
    expect(validateAnswerEntries([{ id: 'X9', value: 3 }]).ok).toBe(false);
    expect(validateAnswerEntries([{ id: 'd1', value: 3 }]).ok).toBe(false);
    const dup = validateAnswerEntries([
      { id: 'D1', value: 3 },
      { id: 'D1', value: 4 },
    ]);
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.errors.join(' ')).toContain('trùng');
  });

  it('từ chối trường thừa và trường nguy hiểm', () => {
    expect(validateAnswerEntries([{ id: 'D1', value: 3, extra: 1 }]).ok).toBe(false);
    expect(validateAnswerEntries(JSON.parse('[{"id":"D1","value":3,"__proto__":{"x":1}}]')).ok).toBe(false);
    expect(validateAnswerMap(JSON.parse('{"__proto__":{"polluted":true}}')).ok).toBe(false);
    expect(validateAnswerMap({ constructor: 3 }).ok).toBe(false);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('export', () => {
  it('mặc định không chứa đáp án; có điểm, số câu, gợi ý, kế hoạch, schema/version và ngày tạo', () => {
    const report = JSON.parse(exportJson(session(), false));
    expect(report.schema).toBe(REPORT_SCHEMA);
    expect(report.schemaVersion).toBe(1);
    expect(report.questionnaireVersion).toBe('disc-reflection-vi-1.0.0');
    expect(report.createdAt).toBe('2026-10-11T08:00:00.000Z');
    expect(report.answersIncluded).toBe(false);
    expect('answers' in report).toBe(false);
    expect(report.scores.D).toEqual({ n: 8, itemCount: 8, score: 100 });
    expect(report.counts).toEqual({ answered: 32, na: 0, unanswered: 0, total: 32 });
    expect(report.evidence.map((e: { id: string }) => e.id)).toEqual(['D1', 'D2', 'D3']);
    expect(report.goal.text).toBe('Hỏi thêm một góc nhìn');
    expect(report.plan).toBeDefined();
    expect(report.scoringConfig.rules.closeDelta).toBe(10);
  });

  it('chỉ chứa đáp án khi học viên chọn', () => {
    const report = JSON.parse(exportJson(session(), true));
    expect(report.answersIncluded).toBe(true);
    expect(report.answers).toHaveLength(32);
    expect(report.answers[0]).toEqual({ id: 'D1', value: 5 });
  });

  it('round-trip giữ nguyên tiếng Việt', () => {
    const r = parseReport(exportJson(session({ fitNote: 'Đúng với tình huống họp nhóm – tuần trước' }), true));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.session.fitNote).toBe('Đúng với tình huống họp nhóm – tuần trước');
  });
});

describe('import', () => {
  it('có đáp án hợp lệ → tính lại, bỏ qua điểm bị sửa trong file', () => {
    const report = JSON.parse(exportJson(session(), true));
    report.scores.C.score = 100;
    report.interpretation.status = 'clearer';
    report.interpretation.candidates = ['C'];
    const r = parseReport(JSON.stringify(report));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.info.mode).toBe('recomputed');
    expect(r.info.scoresMismatch).toBe(true);
    const ev = evaluate(r.session);
    expect(ev.summary.dimensions.C.score).toBe(0);
    expect(ev.interpretation.candidates).toEqual(['D']);
  });

  it('không có đáp án → chế độ chưa đối chiếu, dùng điểm trong file sau khi kiểm tra', () => {
    const r = parseReport(exportJson(session(), false));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.info.mode).toBe('unverified');
    expect(r.info.snapshot?.summary.dimensions.D.score).toBe(100);
    expect(r.info.snapshot?.interpretation.status).toBe('clearer');
    expect(r.session.answers).toEqual({});
  });

  it('không có đáp án: từ chối điểm không thể đạt được hoặc không khớp số câu', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.scores.D.score = 99.9;
    expect(parseReport(JSON.stringify(report)).ok).toBe(false);
    const report2 = JSON.parse(exportJson(session(), false));
    report2.counts.answered = 31;
    expect(parseReport(JSON.stringify(report2)).ok).toBe(false);
  });

  it('không tin text/action của bằng chứng trong file', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.evidence[0].text = 'Câu bịa';
    const r = parseReport(JSON.stringify(report));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.info.snapshot?.evidence[0]?.text).not.toBe('Câu bịa');
  });

  it('text XSS được giữ nguyên là chuỗi thuần', () => {
    const xss = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const r = parseReport(exportJson(session({ notFitNote: xss, displayName: '<b>x</b>' }), false));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.session.notFitNote).toBe(xss);
      expect(r.session.displayName).toBe('<b>x</b>');
    }
  });

  it('từ chối schemaVersion chưa hỗ trợ', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.schemaVersion = 2;
    const r = parseReport(JSON.stringify(report));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain('chưa được hỗ trợ');
  });

  it('từ chối phiên bản bộ câu hỏi chưa hỗ trợ', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.questionnaireVersion = 'disc-reflection-vi-9.0.0';
    const r = parseReport(JSON.stringify(report));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain('bộ câu hỏi');
  });

  it('từ chối file không phải báo cáo, JSON hỏng và trường lạ', () => {
    expect(parseReport('not json').ok).toBe(false);
    expect(parseReport('[]').ok).toBe(false);
    expect(parseReport('{"schema":"khac"}').ok).toBe(false);
    const report = JSON.parse(exportJson(session(), false));
    report.extra = 'x';
    expect(parseReport(JSON.stringify(report)).ok).toBe(false);
  });

  it('từ chối __proto__ ở bất kỳ đâu', () => {
    const text = exportJson(session(), false).replace('"plan":{', '"plan":{"__proto__":{"isAdmin":true},');
    const r = parseReport(text);
    expect(r.ok).toBe(false);
  });

  it('từ chối đáp án trùng hoặc ID lạ trong file', () => {
    const report = JSON.parse(exportJson(session(), true));
    report.answers.push({ id: 'D1', value: 3 });
    expect(parseReport(JSON.stringify(report)).ok).toBe(false);
    const report2 = JSON.parse(exportJson(session(), true));
    report2.answers[0] = { id: 'Z1', value: 3 };
    expect(parseReport(JSON.stringify(report2)).ok).toBe(false);
  });

  it('answersIncluded phải khớp dữ liệu', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.answersIncluded = true;
    expect(parseReport(JSON.stringify(report)).ok).toBe(false);
  });

  it('từ chối file quá 1 MB', () => {
    const text = exportJson(session(), false);
    const r = parseReport(text, MAX_IMPORT_BYTES + 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain('1 MB');
    const big = text.replace('"notFitNote":""', `"notFitNote":"${'a'.repeat(MAX_IMPORT_BYTES)}"`);
    expect(parseReport(big).ok).toBe(false);
  });

  it('từ chối text quá dài trong kế hoạch', () => {
    const report = JSON.parse(exportJson(session(), false));
    report.plan.notes = 'a'.repeat(5000);
    expect(parseReport(JSON.stringify(report)).ok).toBe(false);
  });
});
