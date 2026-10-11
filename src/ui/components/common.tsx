import type { ReactNode } from 'react';
import { DISCLAIMER, QUESTIONNAIRE_VERSION, SCORING_CONFIG_VERSION, THRESHOLD_STATUS } from '../../domain/questionnaire';

export function ScreenTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <div className="screen-title">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 tabIndex={-1}>{children}</h1>
    </div>
  );
}

export function Limitations() {
  return (
    <aside className="notice notice-info limitations" aria-label="Giới hạn của kết quả">
      <p>
        <strong>Giới hạn:</strong> {DISCLAIMER}
      </p>
      <p>
        Điểm 0–100 là điểm quy đổi của bộ câu hỏi này, không phải phần trăm tính cách, percentile hay xác suất; bốn
        điểm không cộng thành 100. Ngưỡng 10 điểm và số câu tối thiểu: {THRESHOLD_STATUS}.
      </p>
      <p className="muted small">
        Bộ câu hỏi: {QUESTIONNAIRE_VERSION} · Quy ước chấm: {SCORING_CONFIG_VERSION}
      </p>
    </aside>
  );
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="actions no-print">{children}</div>;
}
