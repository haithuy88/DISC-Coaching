import { useCallback, useEffect, useMemo, useState } from 'react';
import { evaluate, parseReport, type Evaluation, type ImportInfo } from '../domain/report';
import { buildSuggestions, suggestionsFromEvidence, type CoachingSuggestions } from '../domain/recommendations';
import { emptySession, type Session } from '../domain/session';
import { clearStored, loadStored, saveStored, type Screen } from '../storage/persistence';

export interface AppState {
  session: Session;
  screen: Screen;
  page: number;
  saveOnDevice: boolean;
  importedReport: string | null;
  importInfo: ImportInfo | null;
  /** câu cần đưa focus tới khi mở trang khảo sát từ màn hình rà soát (không lưu) */
  focusQuestion: string | null;
}

function initialState(): AppState {
  const stored = loadStored();
  if (!stored) {
    return { session: emptySession(), screen: 'intro', page: 0, saveOnDevice: false, importedReport: null, importInfo: null, focusQuestion: null };
  }
  let importInfo: ImportInfo | null = null;
  if (stored.importedReport) {
    const r = parseReport(stored.importedReport);
    if (r.ok) importInfo = r.info;
  }
  return {
    session: stored.session,
    screen: stored.screen,
    page: stored.page,
    saveOnDevice: true,
    importedReport: importInfo ? stored.importedReport : null,
    importInfo,
    focusQuestion: null,
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [saveError, setSaveError] = useState(false);

  // Chỉ ghi localStorage khi học viên đã bật; tắt thì xóa ngay.
  useEffect(() => {
    if (state.saveOnDevice) {
      setSaveError(!saveStored({ session: state.session, screen: state.screen, page: state.page, importedReport: state.importedReport }));
    } else {
      clearStored();
    }
  }, [state]);

  const updateSession = useCallback((patch: Partial<Session> | ((s: Session) => Partial<Session>)) => {
    setState((st) => ({ ...st, session: { ...st.session, ...(typeof patch === 'function' ? patch(st.session) : patch) } }));
  }, []);

  const go = useCallback((screen: Screen, page?: number, focusQuestion: string | null = null) => {
    setState((st) => ({ ...st, screen, page: page ?? st.page, focusQuestion }));
  }, []);

  const setSaveOnDevice = useCallback((saveOnDevice: boolean) => setState((st) => ({ ...st, saveOnDevice })), []);

  const clearAll = useCallback(() => {
    clearStored();
    setState({ session: emptySession(), screen: 'intro', page: 0, saveOnDevice: false, importedReport: null, importInfo: null, focusQuestion: null });
  }, []);

  const applyImport = useCallback((session: Session, info: ImportInfo, text: string) => {
    setState((st) => ({
      ...st,
      session,
      importInfo: info,
      importedReport: info.mode === 'unverified' ? text : null,
      screen: 'results',
      page: 0,
    }));
  }, []);

  /** Bắt đầu bài khảo sát mới: bỏ báo cáo nhập chưa đối chiếu. */
  const startNew = useCallback(() => {
    setState((st) => ({ ...st, session: emptySession(), importInfo: null, importedReport: null, screen: 'intro', page: 0 }));
  }, []);

  const evaluation: Evaluation = useMemo(() => {
    if (state.importInfo?.mode === 'unverified' && state.importInfo.snapshot) return state.importInfo.snapshot;
    return evaluate(state.session);
  }, [state.session, state.importInfo]);

  const suggestions: CoachingSuggestions = useMemo(() => {
    if (state.importInfo?.mode === 'unverified') {
      return evaluation.interpretation.status === 'insufficient'
        ? suggestionsFromEvidence([])
        : suggestionsFromEvidence(evaluation.evidence);
    }
    return buildSuggestions(state.session.answers, evaluation.interpretation);
  }, [state.importInfo, state.session.answers, evaluation]);

  return { state, evaluation, suggestions, saveError, updateSession, go, setSaveOnDevice, clearAll, applyImport, startNew };
}

export type AppApi = ReturnType<typeof useAppState>;
