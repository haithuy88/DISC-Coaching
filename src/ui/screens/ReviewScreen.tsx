import { useRef, useState } from 'react';
import { PAGE_COUNT, QUESTIONS, QUESTIONS_PER_PAGE, scaleLabel } from '../../domain/questionnaire';
import { hasAnswer } from '../../domain/scoring';
import { unansweredIds } from '../../domain/submission';
import type { Question } from '../../domain/types';
import { Actions, ScreenTitle } from '../components/common';
import { SurveyProgress } from './SurveyScreen';
import { canSubmit, type AppApi } from '../useAppState';

export function ReviewScreen({ api }: { api: AppApi }) {
  const { session } = api.state;
  const missingIds = unansweredIds(session.answers);
  const missing = QUESTIONS.filter((q) => missingIds.includes(q.id));
  const na = QUESTIONS.filter((q) => hasAnswer(session.answers, q.id) && session.answers[q.id] === null);
  const [blocked, setBlocked] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const edit = (q: Question) => {
    const index = QUESTIONS.indexOf(q);
    api.go('survey', Math.floor(index / QUESTIONS_PER_PAGE), q.id);
  };

  const onSubmit = () => {
    if (missing.length > 0) {
      setBlocked(true);
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }
    void api.submit();
  };

  const IssueList = ({ items, title, kind, hint }: { items: Question[]; title: string; kind: 'missing' | 'na'; hint: string }) =>
    items.length === 0 ? null : (
      <div className="card stack">
        <h2>
          {title} ({items.length})
        </h2>
        <p className="muted small">{hint}</p>
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
      <ScreenTitle eyebrow="Trước khi gửi">Rà soát câu trả lời</ScreenTitle>
      <SurveyProgress api={api} />

      {missing.length === 0 ? (
        <div className="notice notice-success" role="status">
          <p>
            <strong>Bạn đã chọn đủ {QUESTIONS.length} câu.</strong> Có thể gửi cho coach.
          </p>
          {na.length > 0 && <p>Câu N/A không được tính thành điểm 3.</p>}
        </div>
      ) : (
        <div
          className={`notice ${blocked ? 'notice-error' : 'notice-warn'}`}
          role={blocked ? 'alert' : 'status'}
          tabIndex={-1}
          ref={alertRef}
        >
          <p>
            <strong>Còn {missing.length} câu chưa có lựa chọn.</strong> Hãy chọn 1–5 hoặc N/A cho đủ {QUESTIONS.length}{' '}
            câu trước khi gửi.
          </p>
        </div>
      )}

      <IssueList items={missing} title="Câu chưa chọn" kind="missing" hint="Bắt buộc chọn trước khi gửi." />
      <IssueList items={na} title="Câu đã chọn N/A" kind="na" hint="Có thể giữ nguyên nếu bạn chưa có trải nghiệm." />

      <details className="card">
        <summary>Xem toàn bộ {QUESTIONS.length} câu trả lời</summary>
        <ol className="all-answers">
          {QUESTIONS.map((q) => (
            <li key={q.id}>
              <span>{q.text}</span>
              <span className="answer-chip">
                {hasAnswer(session.answers, q.id)
                  ? session.answers[q.id] === null
                    ? 'N/A'
                    : `${session.answers[q.id]} – ${scaleLabel(session.answers[q.id])}`
                  : 'Chưa chọn'}
              </span>
              <button type="button" className="btn-link" onClick={() => edit(q)}>
                Sửa
              </button>
            </li>
          ))}
        </ol>
      </details>

      {!canSubmit() && (
        <p className="notice notice-warn" data-testid="demo-mode">
          <strong>Bản chạy thử:</strong> chưa cấu hình địa chỉ Google Sheets, nên bấm Gửi chỉ hiện kết quả trên máy này và
          không gửi cho coach.
        </p>
      )}

      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('survey', PAGE_COUNT - 1)}>
          Về trang khảo sát cuối
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmit}>
          Gửi cho coach và xem kết quả
        </button>
      </Actions>
    </section>
  );
}
