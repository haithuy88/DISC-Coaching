import { useId, useRef, useState } from 'react';
import { SCALE } from '../../domain/questionnaire';
import { FITS, FIT_LABEL, MAX_TEXT, type Fit } from '../../domain/session';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

const CUSTOM = 'custom';
const scaleLabel = (v: number) => SCALE.find((s) => s.value === v)?.label ?? '';

function FitChoice({ api, questionId }: { api: AppApi; questionId: string }) {
  const current = api.state.session.reflections[questionId];
  return (
    <fieldset className="fit-group">
      <legend className="small">Với bạn, gợi ý từ câu {questionId} thế nào?</legend>
      <div className="pill-row">
        {FITS.map((f: Fit) => (
          <label key={f} className={`pill ${current === f ? 'selected' : ''}`}>
            <input
              type="radio"
              name={`fit-${questionId}`}
              checked={current === f}
              onChange={() => api.updateSession((s) => ({ reflections: { ...s.reflections, [questionId]: f } }))}
            />
            <span>{FIT_LABEL[f]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CoachingScreen({ api }: { api: AppApi }) {
  const { session, importInfo } = api.state;
  const { suggestions, evaluation } = api;
  const { evidence, hypotheses, pairExercise, goalOptions } = suggestions;
  const status = evaluation.interpretation.status;
  const fitId = useId();
  const notFitId = useId();
  const goalTextId = useId();
  const [goalError, setGoalError] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  function chooseGoal(optionId: string) {
    const option = goalOptions.find((g) => g.id === optionId);
    setGoalError(false);
    api.updateSession({ goalOptionId: optionId, goalText: option ? option.action : session.goalText });
  }

  function next() {
    if (!session.goalText.trim()) {
      setGoalError(true);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    api.go('plan');
  }

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Coaching">Kiểm chứng gợi ý bằng trải nghiệm của bạn</ScreenTitle>
      <p className="notice notice-info">
        Mọi mô tả dưới đây là <strong>khả năng cần bạn xác nhận</strong>, không phải kết luận về bạn. Điểm thấp hơn ở một
        nhóm chỉ cho thấy bạn ít đồng tình hơn với các phát biểu trong bối cảnh đã chọn, không chứng minh thiếu năng lực.
      </p>

      <div className="card stack">
        <h2>Bằng chứng từ câu trả lời của bạn</h2>
        {importInfo?.mode === 'unverified' && (
          <p className="muted small">Lấy từ báo cáo được nhập, chưa đối chiếu đáp án.</p>
        )}
        {evidence.length === 0 ? (
          <p data-testid="no-evidence">
            Chưa có phát biểu nào được bạn đánh giá 4 (khá giống tôi) hoặc 5 (rất giống tôi), nên ứng dụng không đưa ra
            gợi ý từ từng câu. Bạn có thể tự viết mục tiêu ở phần dưới.
          </p>
        ) : (
          <ul className="evidence-list">
            {evidence.map((e) => (
              <li key={e.questionId} className="evidence card-inner" data-testid="evidence-item" data-evidence-id={e.questionId}>
                <p className="q-number">
                  {e.questionId} · bạn chọn {e.value} – {scaleLabel(e.value).toLowerCase()}
                </p>
                <blockquote>“{e.text}”</blockquote>
                <p>
                  Hãy kiểm tra bằng một tình huống gần đây, đồng thời tìm một tình huống không giống như vậy. Nếu bạn muốn
                  thử: <strong>{e.action}</strong>
                </p>
                <FitChoice api={api} questionId={e.questionId} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {hypotheses.length > 0 && (
        <div className="card stack">
          <h2>Giả thuyết theo nhóm</h2>
          <p className="muted small">Dựa trên điểm nhóm, chỉ dùng nếu phù hợp với bạn.</p>
          {hypotheses.map((h) => (
            <div key={h.dimension} className="card-inner stack-sm" data-testid="hypothesis">
              <h3>
                {h.dimension} – {h.name}
              </h3>
              <p>
                <strong>Đóng góp có thể có:</strong> {h.strength}
              </p>
              <p>
                <strong>Điều cần kiểm tra, không phải kết luận:</strong> {h.risk}
              </p>
              <p>
                <strong>Cách trao đổi có thể thử:</strong> {h.need}
              </p>
              <p>
                <strong>Câu hỏi tự coaching:</strong> {h.question}
              </p>
              <p className="muted small">Nguồn: các câu đã chấm {h.sourceIds.join(', ')}.</p>
            </div>
          ))}
        </div>
      )}

      {pairExercise && (
        <div className="card stack-sm" data-testid="pair-exercise">
          <h2>Bài tập cho hai xu hướng gần nhau ({pairExercise.pair.join('/')})</h2>
          <p>{pairExercise.text}</p>
          <p className="muted small">Bài tập tự biên soạn, không phải một “kiểu” chuẩn hóa. Chỉ dùng nếu bạn thấy phù hợp.</p>
        </div>
      )}

      {(status === 'flat' || status === 'multiple') && (
        <p className="notice notice-info">
          Vì các xu hướng gần nhau, hãy dựa vào từng câu trả lời ở trên và mục tiêu của chính bạn.
        </p>
      )}

      <div className="card stack">
        <h2>Phản tư</h2>
        <div className="field">
          <label className="field-label" htmlFor={fitId}>
            Phần nào phù hợp với bạn? Ví dụ gần đây (thời gian, người liên quan)
          </label>
          <textarea
            id={fitId}
            className="input"
            rows={3}
            maxLength={MAX_TEXT}
            value={session.fitNote}
            onChange={(e) => api.updateSession({ fitNote: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={notFitId}>
            Phần nào không giống bạn hoặc cần điều chỉnh?
          </label>
          <textarea
            id={notFitId}
            className="input"
            rows={3}
            maxLength={MAX_TEXT}
            value={session.notFitNote}
            onChange={(e) => api.updateSession({ notFitNote: e.target.value })}
          />
        </div>
      </div>

      <div className="card stack">
        <fieldset className="choice-group">
          <legend>
            <h2>Chọn mục tiêu của bạn</h2>
          </legend>
          <p className="muted small">Bạn quyết định. Có thể chọn một gợi ý rồi sửa lại, hoặc tự viết.</p>
          {goalOptions.map((g) => (
            <label key={g.id} className={`choice-card ${session.goalOptionId === g.id ? 'selected' : ''}`}>
              <input type="radio" name="goal" checked={session.goalOptionId === g.id} onChange={() => chooseGoal(g.id)} />
              <span>
                <strong>{g.label}</strong>
                {g.kind === 'practice' && <span className="muted small block">Một hành vi bạn ít chọn – chỉ thử nếu bạn muốn.</span>}
                <span className="block">{g.action}</span>
              </span>
            </label>
          ))}
          <label className={`choice-card ${session.goalOptionId === CUSTOM ? 'selected' : ''}`}>
            <input type="radio" name="goal" checked={session.goalOptionId === CUSTOM} onChange={() => chooseGoal(CUSTOM)} />
            <span>
              <strong>Mục tiêu do tôi tự viết</strong>
            </span>
          </label>
        </fieldset>
        <div className="field">
          <label className="field-label" htmlFor={goalTextId}>
            Mục tiêu của tôi
          </label>
          <textarea
            id={goalTextId}
            className="input"
            rows={2}
            maxLength={MAX_TEXT}
            aria-invalid={goalError || undefined}
            value={session.goalText}
            onChange={(e) => {
              setGoalError(false);
              api.updateSession({ goalText: e.target.value, goalOptionId: session.goalOptionId ?? CUSTOM });
            }}
          />
          {goalError && (
            <p className="field-error" role="alert" tabIndex={-1} ref={errorRef}>
              Hãy chọn hoặc viết một mục tiêu trước khi lập kế hoạch.
            </p>
          )}
        </div>
      </div>

      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('results')}>
          Về kết quả
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          Lập kế hoạch 7 ngày
        </button>
      </Actions>
    </section>
  );
}
