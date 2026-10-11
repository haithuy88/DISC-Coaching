import { useId, useState } from 'react';
import { SCALE } from '../../domain/questionnaire';
import { buildReport, reportFileName } from '../../domain/report';
import { FIT_LABEL, formatDateVi } from '../../domain/session';
import { Actions, Limitations, ScreenTitle } from '../components/common';
import { ImportReport } from '../components/ImportReport';
import { PrivacyControls } from '../components/PrivacyPanel';
import { ImportNotice, InterpretationText, ReportMeta } from '../components/ReportParts';
import { ScoreChart } from '../components/ScoreChart';
import type { AppApi } from '../useAppState';

function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportScreen({ api }: { api: AppApi }) {
  const { session, importInfo } = api.state;
  const { evaluation, suggestions } = api;
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const answersHint = useId();
  const canIncludeAnswers = importInfo?.mode !== 'unverified';
  const { plan } = session;

  function onExport() {
    const report = buildReport(session, evaluation, { includeAnswers: includeAnswers && canIncludeAnswers });
    const name = reportFileName(report);
    downloadJson(name, report);
    setExported(name);
  }

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Lưu & chia sẻ">Báo cáo của bạn</ScreenTitle>

      <article className="report card stack" aria-label="Báo cáo in được">
        <header className="report-header">
          <p className="eyebrow">DISC Coaching Lab · Báo cáo tự phản tư</p>
          <h2>Kết quả và kế hoạch 7 ngày</h2>
        </header>
        <ImportNotice info={importInfo} />
        <ReportMeta session={session} />
        <ScoreChart summary={evaluation.summary} />
        <InterpretationText session={session} evaluation={evaluation} />

        <section className="stack-sm">
          <h3>Bằng chứng từ câu trả lời</h3>
          {suggestions.evidence.length === 0 ? (
            <p>Chưa có phát biểu được đánh giá 4–5.</p>
          ) : (
            <ul className="report-list">
              {suggestions.evidence.map((e) => (
                <li key={e.questionId}>
                  <strong>{e.questionId}</strong> ({e.value} – {SCALE.find((s) => s.value === e.value)?.label}): “{e.text}”
                  <br />
                  Gợi ý thử: {e.action}
                  {session.reflections[e.questionId] && (
                    <>
                      <br />
                      Đánh giá của bạn: {FIT_LABEL[session.reflections[e.questionId]!]}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {(session.fitNote || session.notFitNote) && (
          <section className="stack-sm">
            <h3>Phản tư</h3>
            {session.fitNote && (
              <p className="pre">
                <strong>Phù hợp:</strong> {session.fitNote}
              </p>
            )}
            {session.notFitNote && (
              <p className="pre" data-testid="report-notfit">
                <strong>Không phù hợp / cần điều chỉnh:</strong> {session.notFitNote}
              </p>
            )}
          </section>
        )}

        <section className="stack-sm">
          <h3>Kế hoạch 7 ngày</h3>
          <dl className="plan-list">
            <PlanRow label="Mục tiêu" value={session.goalText} />
            <PlanRow label="Tình huống" value={plan.situation} />
            <PlanRow label="Hành vi sẽ thử" value={plan.behavior} />
            <PlanRow label="Số lần" value={plan.count === null ? '' : String(plan.count)} />
            <PlanRow label="Dấu hiệu hữu ích" value={plan.usefulSignal} />
            <PlanRow label="Người phản hồi" value={plan.feedbackPerson} />
            <PlanRow label="Ngày xem lại" value={plan.reviewDate ? formatDateVi(plan.reviewDate) : ''} />
            <PlanRow label="Ghi chú" value={plan.notes} />
          </dl>
        </section>
        <Limitations />
      </article>

      <div className="card stack no-print">
        <h2>In hoặc lưu PDF</h2>
        <p className="muted small">Dùng hộp thoại in của trình duyệt, chọn “Lưu dưới dạng PDF” nếu muốn có file PDF.</p>
        <Actions>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            In / Lưu PDF
          </button>
        </Actions>
      </div>

      <div className="card stack no-print">
        <h2>Xuất file JSON để chia sẻ với coach</h2>
        <p className="muted small">
          File gồm điểm, số câu từng nhóm, gợi ý, phản tư và kế hoạch. Bạn tự quyết định có gửi file cho ai hay không.
        </p>
        {canIncludeAnswers ? (
          <label className="check">
            <input
              type="checkbox"
              checked={includeAnswers}
              aria-describedby={answersHint}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
            />
            <span>Kèm câu trả lời từng câu</span>
          </label>
        ) : (
          <p className="muted small">Báo cáo nhập không có câu trả lời từng câu nên không thể kèm.</p>
        )}
        {canIncludeAnswers && (
          <p id={answersHint} className="muted small">
            Mặc định tắt. Khi bật, coach có thể đối chiếu và tính lại điểm từ câu trả lời của bạn.
          </p>
        )}
        <Actions>
          <button type="button" className="btn btn-primary" onClick={onExport}>
            Tải báo cáo JSON
          </button>
        </Actions>
        {exported && (
          <p className="notice notice-success" role="status">
            Đã tạo file {exported}
            {includeAnswers && canIncludeAnswers ? ' (có kèm câu trả lời).' : ' (không kèm câu trả lời).'}
          </p>
        )}
      </div>

      <details className="card no-print">
        <summary>Mở báo cáo khác</summary>
        <div className="stack top-gap">
          <p className="muted small">Báo cáo đang mở sẽ được thay thế.</p>
          <ImportReport api={api} />
        </div>
      </details>

      <div className="card stack no-print">
        <h2>Quyền riêng tư</h2>
        <PrivacyControls api={api} />
      </div>

      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('plan')}>
          Về kế hoạch
        </button>
      </Actions>
    </section>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="pre">{value || '—'}</dd>
    </div>
  );
}
