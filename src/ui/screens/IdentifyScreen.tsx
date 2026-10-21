import { useId, useRef, useState } from 'react';
import {
  DEPARTMENTS,
  MAX_NAME,
  TITLES,
  validateParticipant,
  type Participant,
  type ParticipantErrors,
} from '../../domain/session';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

export function IdentifyScreen({ api }: { api: AppApi }) {
  const { participant, consentAt } = api.state.session;
  const [errors, setErrors] = useState<ParticipantErrors & { consent?: string }>({});
  const [consent, setConsent] = useState(Boolean(consentAt));
  const summaryRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const set = (patch: Partial<Participant>) => {
    api.updateSession((s) => ({ participant: { ...s.participant, ...patch } }));
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, undefined])) }));
  };

  function next() {
    const errs: ParticipantErrors & { consent?: string } = validateParticipant(participant);
    if (!consent) errs.consent = 'Hãy đánh dấu đồng ý để tiếp tục.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (!consentAt) api.updateSession({ consentAt: new Date().toISOString() });
    api.go('survey', 0);
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Trước khi bắt đầu">Thông tin người làm khảo sát</ScreenTitle>
      {errorList.length > 0 && (
        <div className="notice notice-error" role="alert" tabIndex={-1} ref={summaryRef}>
          <p>
            <strong>Cần bổ sung trước khi tiếp tục:</strong>
          </p>
          <ul>
            {errorList.map(([k, v]) => (
              <li key={k}>{v}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="card stack">
        <TextField
          id={`${id}-name`}
          label="Họ và tên"
          required
          autoComplete="name"
          max={MAX_NAME}
          value={participant.fullName}
          error={errors.fullName}
          onChange={(v) => set({ fullName: v })}
        />
        <SelectField
          id={`${id}-dept`}
          label="Phòng ban"
          options={DEPARTMENTS}
          value={participant.department}
          error={errors.department}
          onChange={(v) => set({ department: v })}
        />
        <SelectField
          id={`${id}-title`}
          label="Chức danh"
          options={TITLES}
          value={participant.title}
          error={errors.title}
          onChange={(v) => set({ title: v })}
        />
      </div>

      <div className="card stack">
        <h2>Đồng ý gửi dữ liệu cho coach</h2>
        <p>
          Khi bấm <strong>Gửi</strong> ở cuối bài, họ tên, phòng ban, chức danh, 30 câu trả lời và kết quả sơ bộ sẽ được
          ghi vào bảng Google Sheets chỉ coach được chỉ định mở. Kết quả dùng cho trao đổi coaching, không dùng để thưởng
          phạt, tuyển dụng hay xếp hạng. Trước khi bấm Gửi, không có dữ liệu nào rời khỏi thiết bị.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={consent}
            aria-invalid={errors.consent ? true : undefined}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (!e.target.checked) api.updateSession({ consentAt: null });
              setErrors((er) => ({ ...er, consent: undefined }));
            }}
          />
          <span>Tôi đồng ý gửi câu trả lời và kết quả của mình cho coach như mô tả ở trên.</span>
        </label>
        {errors.consent && <p className="field-error">{errors.consent}</p>}
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

function TextField({
  id,
  label,
  required,
  autoComplete,
  max,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  autoComplete: string;
  max: number;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="required"> (bắt buộc)</span>}
      </label>
      <input
        id={id}
        className="input"
        type="text"
        required={required}
        autoComplete={autoComplete}
        maxLength={max}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        <span className="required"> (bắt buộc)</span>
      </label>
      <select
        id={id}
        className="input select"
        required
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          — Chọn {label.toLowerCase()} —
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
