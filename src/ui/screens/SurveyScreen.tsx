import { useEffect, useRef, useState } from 'react';
import { PAGE_COUNT, QUESTIONS, QUESTIONS_PER_PAGE, SCALE } from '../../domain/questionnaire';
import { hasAnswer } from '../../domain/scoring';
import type { AnswerValue, Question } from '../../domain/types';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

const SCORED_SCALE = SCALE.filter((s) => s.value !== null);
const NA_LABEL = SCALE.find((s) => s.value === null)?.label ?? 'Chưa có trải nghiệm / chưa thể trả lời';

export function SurveyProgress({ api }: { api: AppApi }) {
  const { answers } = api.state.session;
  const scored = QUESTIONS.filter((q) => hasAnswer(answers, q.id) && answers[q.id] !== null).length;
  const na = QUESTIONS.filter((q) => hasAnswer(answers, q.id) && answers[q.id] === null).length;
  const answeredAny = scored + na;
  return (
    <div className="progress" aria-live="polite">
      <div
        className="progress-bar"
        role="progressbar"
        aria-label="Số câu đã trả lời"
        aria-valuemin={0}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={answeredAny}
      >
        <span style={{ width: `${(answeredAny / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="small">
        Có điểm: <strong data-testid="count-scored">{scored}</strong>/{QUESTIONS.length} · N/A:{' '}
        <strong data-testid="count-na">{na}</strong> · Chưa trả lời: <strong>{QUESTIONS.length - answeredAny}</strong>
      </p>
    </div>
  );
}

function QuestionField({
  question,
  number,
  value,
  answered,
  invalid,
  onChange,
}: {
  question: Question;
  number: number;
  value: AnswerValue | undefined;
  answered: boolean;
  invalid: boolean;
  onChange: (v: AnswerValue) => void;
}) {
  const name = `q-${number}`;
  const errId = `${name}-err`;
  return (
    <fieldset
      className={`question card ${invalid ? 'invalid' : ''}`}
      id={`question-${number}`}
      aria-describedby={invalid ? errId : undefined}
      data-question-number={number}
    >
      <legend>
        <span className="q-number">Câu {number}</span>
        <span className="q-text">{question.text}</span>
      </legend>
      <div className="scale" role="presentation">
        {SCORED_SCALE.map((s) => (
          <label key={s.value} className={`scale-option ${answered && value === s.value ? 'selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={String(s.value)}
              checked={answered && value === s.value}
              onChange={() => onChange(s.value as AnswerValue)}
            />
            <span className="scale-value" aria-hidden="true">
              {s.value}
            </span>
            <span className="scale-label">
              <span className="sr-only">{s.value} – </span>
              {s.label}
            </span>
          </label>
        ))}
        <label className={`scale-option scale-na ${answered && value === null ? 'selected' : ''}`}>
          <input type="radio" name={name} value="na" checked={answered && value === null} onChange={() => onChange(null)} />
          <span className="scale-value" aria-hidden="true">
            N/A
          </span>
          <span className="scale-label">{NA_LABEL}</span>
        </label>
      </div>
      {invalid && (
        <p id={errId} className="field-error">
          Câu này chưa có lựa chọn.
        </p>
      )}
    </fieldset>
  );
}

export function SurveyScreen({ api }: { api: AppApi }) {
  const { session, page: rawPage, focusQuestion } = api.state;
  const page = Math.min(Math.max(rawPage, 0), PAGE_COUNT - 1);
  const start = page * QUESTIONS_PER_PAGE;
  const pageQuestions = QUESTIONS.slice(start, start + QUESTIONS_PER_PAGE);
  const [warned, setWarned] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const missing = pageQuestions.filter((q) => !hasAnswer(session.answers, q.id));

  useEffect(() => {
    setWarned(false);
    if (focusQuestion) {
      const idx = QUESTIONS.findIndex((q) => q.id === focusQuestion);
      const el = document.getElementById(`question-${idx + 1}`);
      if (el) {
        el.scrollIntoView({ block: 'center' });
        const target = el.querySelector<HTMLInputElement>('input:checked') ?? el.querySelector<HTMLInputElement>('input');
        target?.focus();
      }
      return;
    }
    if (firstRender.current) {
      firstRender.current = false;
      return; // App đã đưa focus vào tiêu đề màn hình
    }
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, [page, focusQuestion]);

  function setAnswer(id: string, value: AnswerValue) {
    api.updateSession((s) => ({ answers: { ...s.answers, [id]: value } }));
  }

  function goPage(next: number) {
    if (next < 0) {
      api.go('context');
      return;
    }
    if (next >= PAGE_COUNT) {
      api.go('review');
      return;
    }
    api.go('survey', next);
  }

  function onNext() {
    if (missing.length > 0 && !warned) {
      setWarned(true);
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }
    goPage(page + 1);
  }

  return (
    <section className="stack">
      <ScreenTitle eyebrow={`Trang ${page + 1}/${PAGE_COUNT}`}>Mức độ giống bạn</ScreenTitle>
      <p className="muted">
        Nghĩ về hành vi thường gặp trong 3 tháng gần đây. Chọn 1 (hầu như không giống) đến 5 (rất giống), hoặc N/A nếu
        chưa có trải nghiệm. Dùng phím mũi tên để đổi lựa chọn trong một câu.
      </p>
      <SurveyProgress api={api} />
      <h2 className="sr-only" tabIndex={-1} ref={headingRef}>
        Trang {page + 1} trên {PAGE_COUNT}, câu {start + 1} đến {start + pageQuestions.length}
      </h2>

      {warned && missing.length > 0 && (
        <div className="notice notice-error" role="alert" tabIndex={-1} ref={alertRef}>
          <p>
            <strong>
              {missing.length === 1 ? 'Còn 1 câu' : `Còn ${missing.length} câu`} trên trang này chưa có lựa chọn:{' '}
              {missing.map((q) => `câu ${QUESTIONS.indexOf(q) + 1}`).join(', ')}.
            </strong>
          </p>
          <p>Bạn có thể chọn N/A nếu chưa có trải nghiệm, hoặc bỏ qua và quay lại ở bước rà soát.</p>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => goPage(page + 1)}>
            Bỏ qua, sang {page + 1 >= PAGE_COUNT ? 'bước rà soát' : 'trang sau'}
          </button>
        </div>
      )}

      {pageQuestions.map((q, i) => (
        <QuestionField
          key={q.id}
          question={q}
          number={start + i + 1}
          value={session.answers[q.id]}
          answered={hasAnswer(session.answers, q.id)}
          invalid={warned && !hasAnswer(session.answers, q.id)}
          onChange={(v) => setAnswer(q.id, v)}
        />
      ))}

      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => goPage(page - 1)}>
          {page === 0 ? 'Quay lại bối cảnh' : 'Trang trước'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          {page + 1 >= PAGE_COUNT ? 'Rà soát câu trả lời' : 'Trang sau'}
        </button>
      </Actions>
      {page + 1 < PAGE_COUNT && (
        <p className="center">
          <button type="button" className="btn-link" onClick={() => api.go('review')}>
            Đến bước rà soát
          </button>
        </p>
      )}
    </section>
  );
}
