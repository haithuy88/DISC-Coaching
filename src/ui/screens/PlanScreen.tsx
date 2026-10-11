import { useEffect, useId } from 'react';
import { MAX_NAME, MAX_TEXT, addDaysIso, todayIso, type Plan } from '../../domain/session';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

type TextKey = Exclude<keyof Plan, 'count' | 'reviewDate'>;

const TEXT_FIELDS: { key: TextKey; label: string; hint: string; rows: number; max: number }[] = [
  { key: 'situation', label: 'Tình huống sẽ áp dụng', hint: 'Ví dụ: họp nhóm sáng thứ Hai', rows: 2, max: MAX_TEXT },
  { key: 'behavior', label: 'Hành vi cụ thể sẽ thử', hint: 'Một việc quan sát được', rows: 2, max: MAX_TEXT },
  { key: 'usefulSignal', label: 'Dấu hiệu cho thấy thử nghiệm hữu ích', hint: 'Bạn sẽ quan sát điều gì?', rows: 2, max: MAX_TEXT },
  { key: 'feedbackPerson', label: 'Người phản hồi (nếu họ đồng ý, tùy chọn)', hint: '', rows: 1, max: MAX_NAME * 2 },
  { key: 'notes', label: 'Ghi chú tự do', hint: 'Điều bạn muốn điều chỉnh sau thử nghiệm…', rows: 3, max: MAX_TEXT },
];

export function PlanScreen({ api }: { api: AppApi }) {
  const { session } = api.state;
  const { plan } = session;
  const baseId = useId();
  const setPlan = (patch: Partial<Plan>) => api.updateSession((s) => ({ plan: { ...s.plan, ...patch } }));

  // Đề xuất ngày xem lại sau 7 ngày; học viên có thể sửa.
  useEffect(() => {
    if (!plan.reviewDate) setPlan({ reviewDate: addDaysIso(todayIso(), 7) });
  }, []);

  return (
    <section className="stack">
      <ScreenTitle eyebrow="Kế hoạch">Thử nghiệm 7 ngày</ScreenTitle>
      <div className="card stack-sm">
        <p className="muted small">Mục tiêu của tôi</p>
        <p className="goal" data-testid="plan-goal">
          {session.goalText || 'Chưa có mục tiêu'}
        </p>
      </div>
      <div className="card stack">
        {TEXT_FIELDS.slice(0, 2).map((f) => (
          <TextField key={f.key} id={`${baseId}-${f.key}`} label={f.label} hint={f.hint} rows={f.rows} max={f.max} value={plan[f.key]} onChange={(v) => setPlan({ [f.key]: v })} />
        ))}
        <div className="field">
          <label className="field-label" htmlFor={`${baseId}-count`}>
            Số lần sẽ thực hiện trong 7 ngày
          </label>
          <input
            id={`${baseId}-count`}
            className="input input-short"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={plan.count ?? ''}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              setPlan({ count: Number.isInteger(n) && n >= 1 && n <= 50 ? n : null });
            }}
          />
        </div>
        {TEXT_FIELDS.slice(2).map((f) => (
          <TextField key={f.key} id={`${baseId}-${f.key}`} label={f.label} hint={f.hint} rows={f.rows} max={f.max} value={plan[f.key]} onChange={(v) => setPlan({ [f.key]: v })} />
        ))}
        <div className="field">
          <label className="field-label" htmlFor={`${baseId}-date`}>
            Ngày xem lại
          </label>
          <input
            id={`${baseId}-date`}
            className="input input-short"
            type="date"
            value={plan.reviewDate}
            onChange={(e) => setPlan({ reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : '' })}
          />
          <p className="muted small">
            Ứng dụng không gửi nhắc nhở hay thông báo. Nếu cần, hãy tự ghi ngày này vào lịch của bạn.
          </p>
        </div>
      </div>
      <Actions>
        <button type="button" className="btn btn-ghost" onClick={() => api.go('coaching')}>
          Về coaching
        </button>
        <button type="button" className="btn btn-primary" onClick={() => api.go('export')}>
          Xem báo cáo & lưu
        </button>
      </Actions>
    </section>
  );
}

function TextField({
  id,
  label,
  hint,
  rows,
  max,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  rows: number;
  max: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {rows === 1 ? (
        <input id={id} className="input" type="text" maxLength={max} placeholder={hint} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <textarea id={id} className="input" rows={rows} maxLength={max} placeholder={hint} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
