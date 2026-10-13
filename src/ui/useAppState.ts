import { useCallback, useMemo, useRef, useState } from 'react';
import { allDiscAnswersIdentical, interpret } from '../domain/interpretation';
import { scoreAnswers } from '../domain/scoring';
import { emptySession, type Session } from '../domain/session';
import {
  buildPayload,
  newSubmissionId,
  googleScriptRun,
  submitToSheets,
  submitViaGoogleScript,
  summaryFromReceipt,
  type Receipt,
} from '../domain/submission';
import type { Interpretation, ScoreSummary } from '../domain/types';

export type Screen = 'intro' | 'identify' | 'survey' | 'review' | 'result';

export type SubmitState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'synced'; receipt: Receipt }
  | { status: 'not_configured' }
  | { status: 'rejected'; message: string }
  | { status: 'error'; message: string };

export interface AppState {
  session: Session;
  screen: Screen;
  page: number;
  /** câu cần đưa focus tới khi mở trang khảo sát từ màn hình rà soát */
  focusQuestion: string | null;
  submit: SubmitState;
}

/** URL web app Apps Script; trống = chế độ thử, không gửi đi đâu. */
export const SUBMIT_URL: string = (import.meta.env.VITE_SUBMIT_URL ?? '').trim();

/** Có nơi nhận bài: chạy trong Apps Script (google.script.run) hoặc có URL. Không có = chế độ chạy thử. */
export const canSubmit = (): boolean => Boolean(googleScriptRun() || SUBMIT_URL);

const initial = (): AppState => ({
  session: emptySession(),
  screen: 'intro',
  page: 0,
  focusQuestion: null,
  submit: { status: 'idle' },
});

/**
 * Dữ liệu chỉ nằm trong bộ nhớ của tab: không localStorage, không analytics.
 * Câu trả lời chỉ rời thiết bị khi người làm bấm "Gửi" sau khi đã đồng ý.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const sendingRef = useRef(false);

  const updateSession = useCallback((patch: Partial<Session> | ((s: Session) => Partial<Session>)) => {
    setState((st) => ({ ...st, session: { ...st.session, ...(typeof patch === 'function' ? patch(st.session) : patch) } }));
  }, []);

  const go = useCallback((screen: Screen, page?: number, focusQuestion: string | null = null) => {
    setState((st) => ({ ...st, screen, page: page ?? st.page, focusQuestion }));
  }, []);

  const submit = useCallback(async () => {
    const current = stateRef.current;
    if (sendingRef.current || current.submit.status === 'synced') return;
    const session = current.session.submissionId ? current.session : { ...current.session, submissionId: newSubmissionId() };
    const payload = buildPayload(session);
    const run = googleScriptRun();
    if (!run && !SUBMIT_URL) {
      setState((st) => ({ ...st, session, screen: 'result', submit: { status: 'not_configured' } }));
      return;
    }
    sendingRef.current = true;
    setState((st) => ({ ...st, session, screen: 'result', submit: { status: 'sending' } }));
    try {
      const result = run ? await submitViaGoogleScript(run, payload) : await submitToSheets(SUBMIT_URL, payload);
      setState((st) => ({
        ...st,
        submit:
          result.kind === 'synced'
            ? { status: 'synced', receipt: result.receipt }
            : result.kind === 'rejected'
              ? { status: 'rejected', message: result.message }
              : { status: 'error', message: result.message },
      }));
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const restart = useCallback(() => setState(initial()), []);

  /** Điểm hiển thị: của máy chủ khi đã ghi nhận; nếu chưa thì tính trên máy và ghi rõ. */
  const evaluation = useMemo((): { summary: ScoreSummary; interpretation: Interpretation; serverConfirmed: boolean } => {
    const local = scoreAnswers(state.session.answers);
    const localInterp = interpret(local, { allIdentical: allDiscAnswersIdentical(state.session.answers) });
    if (state.submit.status === 'synced') {
      const summary = summaryFromReceipt(state.submit.receipt);
      return {
        summary,
        interpretation: interpret(summary, { allIdentical: allDiscAnswersIdentical(state.session.answers) }),
        serverConfirmed: true,
      };
    }
    return { summary: local, interpretation: localInterp, serverConfirmed: false };
  }, [state.session.answers, state.submit]);

  return { state, evaluation, updateSession, go, submit, restart };
}

export type AppApi = ReturnType<typeof useAppState>;
