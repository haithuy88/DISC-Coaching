import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateAnswerEntries } from '../../src/domain/answers';
import { emptySession, validateParticipant, type Session } from '../../src/domain/session';
import { buildPayload, submitToSheets, submitViaGoogleScript, unansweredIds } from '../../src/domain/submission';
import { answersByDimension } from './helpers';

const full = (): Session => ({
  ...emptySession(),
  consentAt: '2026-10-12T02:00:00.000Z',
  submissionId: 'abcdefab-1234-4abc-8def-1234567890ab',
  participant: { fullName: '  Người   thử  ', department: 'Phòng thử', title: '' },
  answers: answersByDimension({ D: 4, I: 3, S: 2, C: 1 }),
});

describe('thông tin người làm', () => {
  it('họ tên và phòng ban bắt buộc; chức danh không bắt buộc', () => {
    expect(validateParticipant({ fullName: '', department: '', title: '' })).toEqual({
      fullName: expect.any(String),
      department: expect.any(String),
    });
    expect(validateParticipant({ fullName: '   ', department: 'Kế toán', title: '' }).fullName).toBeDefined();
    expect(validateParticipant({ fullName: 'An Bình', department: 'Kế toán', title: '' })).toEqual({});
  });
});

describe('payload', () => {
  it('đủ 30 câu, chuẩn hóa khoảng trắng, không chứa điểm do client tính', () => {
    const p = buildPayload(full());
    expect(p.answers).toHaveLength(30);
    expect(p.participant.fullName).toBe('Người thử');
    expect(Object.keys(p).sort()).toEqual(
      ['answers', 'consentAt', 'consentVersion', 'participant', 'questionnaireVersion', 'submissionId'].sort(),
    );
  });

  it('chưa đủ 30 câu, chưa đồng ý hoặc thiếu mã → không tạo payload', () => {
    const s = full();
    delete s.answers.T3;
    expect(unansweredIds(s.answers)).toEqual(['T3']);
    expect(() => buildPayload(s)).toThrow();
    expect(() => buildPayload({ ...full(), consentAt: null })).toThrow();
    expect(() => buildPayload({ ...full(), submissionId: null })).toThrow();
  });

  it('N/A là null, khác với chưa chọn', () => {
    const s = full();
    s.answers.D1 = null;
    expect(unansweredIds(s.answers)).toEqual([]);
    expect(buildPayload(s).answers.find((a) => a.id === 'D1')?.value).toBeNull();
  });

  it('validator đáp án từ chối ID trùng, ID lạ và giá trị sai kiểu', () => {
    expect(validateAnswerEntries([{ id: 'L1', value: 3 }]).ok).toBe(true);
    expect(validateAnswerEntries([{ id: 'D8', value: 3 }]).ok).toBe(false);
    expect(validateAnswerEntries([{ id: 'D1', value: Number.NaN }]).ok).toBe(false);
    expect(validateAnswerEntries([{ id: 'D1', value: Number.POSITIVE_INFINITY }]).ok).toBe(false);
    expect(
      validateAnswerEntries([
        { id: 'D1', value: 3 },
        { id: 'D1', value: 3 },
      ]).ok,
    ).toBe(false);
  });
});

describe('gửi tới Apps Script', () => {
  afterEach(() => vi.unstubAllGlobals());
  const okReceipt = (id: string) => ({
    ok: true,
    submissionId: id,
    duplicate: false,
    receivedAt: '2026-10-12T02:01:00.000Z',
    nDisc: 24,
    scores: { D: { n: 6, score: 75 }, I: { n: 6, score: 50 }, S: { n: 6, score: 25 }, C: { n: 6, score: 0 } },
    dataStatus: 'complete',
    pattern: 'clearer',
    candidates: ['D'],
  });

  it('gửi text/plain (tránh preflight) và nhận biên nhận hợp lệ', async () => {
    const p = buildPayload(full());
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(okReceipt(p.submissionId))));
    vi.stubGlobal('fetch', fetchMock);
    const r = await submitToSheets('https://script.google.com/macros/s/x/exec', p);
    expect(r.kind).toBe('synced');
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>)['Content-Type']).toMatch(/^text\/plain/);
    expect(JSON.parse(init.body as string)).toEqual(p);
  });

  it('lỗi mạng, phản hồi sai định dạng hoặc biên nhận sai mã → không báo đã ghi', async () => {
    const p = buildPayload(full());
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect((await submitToSheets('u', p)).kind).toBe('network_error');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>')));
    expect((await submitToSheets('u', p)).kind).toBe('network_error');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(okReceipt('khac-ma')))));
    expect((await submitToSheets('u', p)).kind).toBe('network_error');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    expect((await submitToSheets('u', p)).kind).toBe('network_error');
  });

  it('máy chủ từ chối → rejected kèm thông báo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: 'Phiên bản sai.' }))));
    const r = await submitToSheets('u', buildPayload(full()));
    expect(r).toEqual({ kind: 'rejected', message: 'Phiên bản sai.' });
  });
});

describe('gửi qua google.script.run (trang chạy trong Apps Script)', () => {
  const fakeRun = (respond: (text: string, ok: (v: unknown) => void, fail: (e: unknown) => void) => void) => {
    let ok: (v: unknown) => void = () => undefined;
    let fail: (e: unknown) => void = () => undefined;
    const run = {
      withSuccessHandler(fn: (v: unknown) => void) { ok = fn; return run; },
      withFailureHandler(fn: (e: unknown) => void) { fail = fn; return run; },
      submitSurvey(text: string) { respond(text, ok, fail); },
    };
    return run;
  };

  it('biên nhận hợp lệ → synced; lỗi tạm thời → network_error; từ chối → rejected; lỗi gọi → network_error', async () => {
    const p = buildPayload(full());
    const receipt = { ok: true, submissionId: p.submissionId, duplicate: false, receivedAt: 'x', nDisc: 24,
      scores: { D: { n: 6, score: 75 }, I: { n: 6, score: 50 }, S: { n: 6, score: 25 }, C: { n: 6, score: 0 } },
      dataStatus: 'complete', pattern: 'clearer', candidates: ['D'] };
    let sent = '';
    expect((await submitViaGoogleScript(fakeRun((t, ok) => { sent = t; ok(receipt); }), p)).kind).toBe('synced');
    expect(JSON.parse(sent)).toEqual(p);
    expect((await submitViaGoogleScript(fakeRun((_t, ok) => ok({ ok: false, retryable: true, error: 'x' })), p)).kind).toBe('network_error');
    expect((await submitViaGoogleScript(fakeRun((_t, ok) => ok({ ok: false, error: 'Sai.' })), p))).toEqual({ kind: 'rejected', message: 'Sai.' });
    expect((await submitViaGoogleScript(fakeRun((_t, _ok, fail) => fail(new Error('x'))), p)).kind).toBe('network_error');
    expect((await submitViaGoogleScript(fakeRun(() => undefined), p, 20)).kind).toBe('network_error');
  });
});
