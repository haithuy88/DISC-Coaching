import { PAGE_COUNT, QUESTIONS, QUESTIONS_PER_PAGE, RULES, SCALE } from '../../domain/questionnaire';
import { todayIso } from '../../domain/session';
import { hasAnswer } from '../../domain/scoring';
import type { Question } from '../../domain/types';
import { Actions, ScreenTitle } from '../components/common';
import { SurveyProgress } from './SurveyScreen';
import type { AppApi } from '../useAppState';

function labelOf(value: number | null | undefined): string {
  if (value === undefined) return 'Chưa trả lời';
  if (value === null) return 'N/A – chưa có trải nghiệm';
  const s = SCALE.find((x) => x.value === value);
  return `${value} – ${s?.label ?? ''}`;
}

export function ReviewScreen({ api }: { api: AppApi }) {
  const { session } = api.state;
  const { interpretation, summary } = api.evaluation;
  const unanswered = QUESTIONS.filter((q) => !hasAnswer(session.answers, q.id));
  const na = QUESTIONS.filter((q) => hasAnswer(session.answers, q.id) && session.answers[q.id] === null);
  const sufficient = interpretation.status !== 'insufficient';

  const edit = (q: Question) => {
    const index = QUESTIONS.indexOf(q);
    api.go('survey', Math.floor(index / QUESTIONS_PER_PAGE), q.id);
  };

  const toResults = () => {
    // Ngày làm = ngày gần nhất học viên xem kết quả với dữ liệu đủ điều kiện.
    if (sufficient) api.updateSession({ completedAt: todayIso() });
    api.go('results');
  };

  const IssueList = ({ items, title, kind }: { items: Question[]; title: string; kind: 'missing' | 'na' }) =>
    items.length === 0 ? null : (
      <div className="card stack">
        <h2>
          {title} ({items.length})
        </h2>
        <ul className="review-list">
          {items.map((q) => {
            const number = QUESTIONS.indexOf(q) + 1;
            return (
              <li key={q.id} className={`review-item ${kind}`} data-testid={`review-${kind}`}>
                <div>
                  <p className="q-number">Câu {number}</p>
                  <p>{q.text}</p>
                </div>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => edit(q)}>
                  Sửa câu {number}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Trước khi xem kết quả">Rà soát câu trả lời</ScreenTitle>
      <SurveyProgress api={api} />

      {sufficient ? (
        <div className="notice notice-success" role="status">
          <p>
            <strong>Đủ dữ liệu để xem kết quả.</strong>{' '}
            {summary.answered < QUESTIONS.length
              ? `Bạn có ${summary.answered}/${QUESTIONS.length} câu có điểm, kết quả sẽ là kết quả tạm thời từ các câu đã trả lời.`
              : 'Bạn đã trả lời tất cả các câu.'}
          </p>
          <p>Câu chưa trả lời hoặc N/A không được tự thay bằng điểm 3.</p>
        </div>
      ) : (
        <div className="notice notice-warn" role="status">
          <p>
            <strong>Chưa đủ dữ liệu để diễn giải.</strong> Cần ít nhất {RULES.minAnsweredTotal}/{QUESTIONS.length} câu có
            điểm và đủ số câu có điểm ở mỗi nhóm phát biểu ({RULES.minAnsweredPerDimension}/8). Hiện có{' '}
            {summary.answered} câu có điểm.
          </p>
          <p>Hãy xem lại các câu chưa trả lời hoặc N/A bên dưới nếu bạn có ví dụ phù hợp.</p>
        </div>
      )}

      <IssueList items={unanswered} title="Câu chưa trả lời" kind="missing" />
      <IssueList items={na} title="Câu đã chọn N/A" kind="na" />

      <details className="card">
        <summary>Xem toàn bộ {QUESTIONS.length} câu trả lời</summary>
        <ol className="all-answers">
          {QUESTIONS.map((q) => (
            <li key={q.id}>
              <span>{q.text}</span>
              <span className="answer-chip">{labelOf(session.answers[q.id])}</span>
              <button type="button" className="btn-link" onClick={() => edit(q)}>
                Sửa
              </button>
            </li>
          ))}
        </ol>
      </details>

      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('survey', PAGE_COUNT - 1)}>
          Về trang khảo sát cuối
        </button>
        <button type="button" className="btn btn-primary" onClick={toResults}>
          {sufficient ? 'Xem kết quả' : 'Xem tình trạng dữ liệu'}
        </button>
      </Actions>
    </section>
  );
}
