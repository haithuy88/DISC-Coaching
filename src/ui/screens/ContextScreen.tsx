import { useId, useRef, useState } from 'react';
import { MAX_NAME, PERIOD_LABEL, SETTINGS, SETTING_LABEL, todayIso } from '../../domain/session';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

const SETTING_HINT = {
  work: 'Hành vi trong công việc hằng ngày',
  study: 'Hành vi khi học tập, làm bài, ôn thi',
  team: 'Hành vi khi làm dự án hoặc hoạt động nhóm',
} as const;

export function ContextScreen({ api }: { api: AppApi }) {
  const { session } = api.state;
  const [error, setError] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const nameId = useId();
  const errId = useId();

  function next() {
    if (!session.setting) {
      setError(true);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (!session.startedAt) api.updateSession({ startedAt: todayIso() });
    api.go('survey', 0);
  }

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Bước chuẩn bị">Bạn sẽ trả lời trong bối cảnh nào?</ScreenTitle>
      <div className="card stack">
        <fieldset className="choice-group" aria-describedby={error ? errId : undefined} aria-invalid={error || undefined}>
          <legend className="field-label">Chọn một bối cảnh và giữ nguyên trong suốt bài khảo sát</legend>
          {SETTINGS.map((s) => (
            <label key={s} className={`choice-card ${session.setting === s ? 'selected' : ''}`}>
              <input
                type="radio"
                name="setting"
                value={s}
                checked={session.setting === s}
                onChange={() => {
                  setError(false);
                  api.updateSession({ setting: s });
                }}
              />
              <span>
                <strong>{SETTING_LABEL[s]}</strong>
                <span className="muted small block">{SETTING_HINT[s]}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {error && (
          <p id={errId} className="field-error" role="alert" tabIndex={-1} ref={errorRef}>
            Hãy chọn một bối cảnh để tiếp tục.
          </p>
        )}
        <p className="notice notice-info">
          Khoảng thời gian: <strong>{PERIOD_LABEL}</strong>. Hãy nghĩ về hành vi thường gặp trong {PERIOD_LABEL}, không
          phải một lần đặc biệt.
        </p>
        <div className="field">
          <label htmlFor={nameId} className="field-label">
            Tên hiển thị (tùy chọn)
          </label>
          <input
            id={nameId}
            className="input"
            type="text"
            autoComplete="off"
            maxLength={MAX_NAME}
            value={session.displayName}
            onChange={(e) => api.updateSession({ displayName: e.target.value.slice(0, MAX_NAME) })}
          />
          <p className="muted small">Chỉ dùng để in trên báo cáo của bạn. Không cần email, ngày sinh hay giới tính.</p>
        </div>
      </div>
      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('intro')}>
          Quay lại
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          Bắt đầu khảo sát
        </button>
      </Actions>
    </section>
  );
}
