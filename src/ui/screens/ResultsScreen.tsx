import { CONTEXT_QUESTIONS, scaleLabel } from '../../domain/questionnaire';
import { headline, preliminarySummary, selectEvidence } from '../../domain/narrative';
import { formatDateTimeVi } from '../../domain/session';
import { DIMENSIONS } from '../../domain/types';
import { Actions, Limitations, ScreenTitle } from '../components/common';
import { ScoreChart } from '../components/ScoreChart';
import type { AppApi } from '../useAppState';

function SyncStatus({ api }: { api: AppApi }) {
  const { submit } = api.state;
  switch (submit.status) {
    case 'sending':
      return (
        <p className="notice notice-info" role="status" data-testid="sync-status" data-status="sending">
          Đang gửi cho coach… Vui lòng không đóng trang.
        </p>
      );
    case 'synced':
      return (
        <p className="notice notice-success" role="status" data-testid="sync-status" data-status="synced">
          <strong>Đã ghi nhận vào Google Sheets của coach</strong> lúc {formatDateTimeVi(submit.receipt.receivedAt)}.
          Điểm dưới đây do máy chủ tính lại.
        </p>
      );
    case 'not_configured':
      return (
        <p className="notice notice-warn" role="status" data-testid="sync-status" data-status="not_configured">
          <strong>Bản chạy thử: chưa gửi cho coach.</strong> Ứng dụng chưa được cấu hình địa chỉ Google Sheets. Kết quả
          dưới đây chỉ tính trên máy này.
        </p>
      );
    case 'rejected':
      return (
        <div className="notice notice-error" role="alert" data-testid="sync-status" data-status="rejected">
          <p>
            <strong>Máy chủ chưa nhận bài:</strong> {submit.message}
          </p>
          <p>Hãy báo coach. Câu trả lời vẫn còn trên trang này.</p>
        </div>
      );
    case 'error':
      return (
        <div className="notice notice-error" role="alert" data-testid="sync-status" data-status="error">
          <p>
            <strong>Chưa gửi được cho coach.</strong> {submit.message} Câu trả lời vẫn còn trên trang này; gửi lại sẽ
            không tạo bản ghi trùng.
          </p>
          <button type="button" className="btn btn-primary btn-small" onClick={() => void api.submit()}>
            Gửi lại
          </button>
        </div>
      );
    case 'idle':
      return null;
  }
}

export function ResultsScreen({ api }: { api: AppApi }) {
  const { session, submit } = api.state;
  const { summary, interpretation, serverConfirmed } = api.evaluation;
  const evidence = interpretation.pattern === 'insufficient' ? [] : selectEvidence(session.answers, 2);

  return (
    <section className="stack">
      <ScreenTitle eyebrow={`${session.participant.fullName} · ${session.participant.department}`}>
        Kết quả sơ bộ của bạn
      </ScreenTitle>
      <SyncStatus api={api} />

      {submit.status !== 'sending' && (
        <>
          <div className="card stack">
            <h2 data-testid="headline">{headline(interpretation)}</h2>
            <p data-testid="summary">{preliminarySummary(summary, interpretation)}</p>
            {!serverConfirmed && <p className="muted small">Điểm tính trên máy này, chưa được máy chủ xác nhận.</p>}
            {interpretation.reviewSuggested && (
              <p className="notice notice-info" data-testid="review-suggested">
                Bạn đã chọn cùng một mức cho mọi câu có điểm. Điều này hoàn toàn có thể xảy ra; khi trao đổi với coach,
                bạn có thể lấy vài ví dụ cụ thể để kiểm tra lại.
              </p>
            )}
          </div>

          <div className="card">
            <ScoreChart summary={summary} />
          </div>

          {evidence.length > 0 && (
            <div className="card stack">
              <h2>Phát biểu bạn đánh giá cao</h2>
              <ul className="report-list">
                {evidence.map((e) => (
                  <li key={e.id} data-testid="evidence-item">
                    “{e.text}” — bạn chọn {e.value} ({scaleLabel(e.value).toLowerCase()})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card stack">
            <h2>Leadership và làm việc nhóm</h2>
            <p className="muted small">6 câu này chỉ ghi nhận lựa chọn của bạn, không cộng vào điểm và không chấm năng lực.</p>
            <div className="table-wrap">
              <table className="score-table" data-testid="context-table">
                <thead>
                  <tr>
                    <th scope="col">Phát biểu</th>
                    <th scope="col">Lựa chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTEXT_QUESTIONS.map((q) => {
                    const v = session.answers[q.id];
                    return (
                      <tr key={q.id}>
                        <th scope="row" className="wrap">
                          <span className="muted small block">{q.section}</span>
                          {q.text}
                        </th>
                        <td className="wrap">{v === null ? 'N/A – chưa có trải nghiệm' : v === undefined ? '—' : `${v} – ${scaleLabel(v)}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Limitations />
          <p className="muted small">
            Số câu DISC có điểm: {summary.nDisc}/24 ({DIMENSIONS.map((d) => `${d} ${summary.dimensions[d].n}/6`).join(', ')}).
          </p>
        </>
      )}

      {(submit.status === 'synced' || submit.status === 'not_configured') && (
        <Actions>
          <button type="button" className="btn btn-ghost" onClick={api.restart}>
            Hoàn tất và xóa khỏi trang này
          </button>
        </Actions>
      )}
    </section>
  );
}
