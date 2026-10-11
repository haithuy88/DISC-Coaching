import { Actions, Limitations, ScreenTitle } from '../components/common';
import { ImportNotice, InsufficientView, InterpretationText, ReportMeta } from '../components/ReportParts';
import { ScoreChart } from '../components/ScoreChart';
import type { AppApi } from '../useAppState';

export function ResultsScreen({ api }: { api: AppApi }) {
  const { session, importInfo } = api.state;
  const { evaluation } = api;
  const insufficient = evaluation.interpretation.status === 'insufficient';
  return (
    <section className="stack">
      <ScreenTitle eyebrow="Kết quả">Bốn điểm xu hướng của bạn</ScreenTitle>
      <ImportNotice info={importInfo} />
      <div className="card">
        <ReportMeta session={session} />
      </div>
      <Limitations />
      {insufficient ? (
        <div className="card">
          <InsufficientView evaluation={evaluation} />
        </div>
      ) : (
        <>
          <div className="card">
            <ScoreChart summary={evaluation.summary} />
          </div>
          <div className="card">
            <InterpretationText session={session} evaluation={evaluation} />
          </div>
        </>
      )}
      <Actions>
        {importInfo ? (
          <button type="button" className="btn btn-ghost" onClick={api.startNew}>
            Làm khảo sát mới
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => api.go('review')}>
            Về rà soát
          </button>
        )}
        {!insufficient && (
          <button type="button" className="btn btn-primary" onClick={() => api.go('coaching')}>
            Sang phần coaching
          </button>
        )}
      </Actions>
    </section>
  );
}
