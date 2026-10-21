import { formatScore } from '../../domain/interpretation';
import { DIMENSION_LABEL, DIMENSION_NAME } from '../../domain/questionnaire';
import { DIMENSIONS, type ScoreSummary } from '../../domain/types';

/** Bốn thanh ngang có nhãn số + bảng văn bản tương đương. Không dùng pie chart vì điểm không cộng thành 100. */
export function ScoreChart({ summary }: { summary: ScoreSummary }) {
  return (
    <div className="score-chart">
      <div className="bars" aria-hidden="true">
        {DIMENSIONS.map((d) => {
          const s = summary.dimensions[d];
          const width = s.score === null ? 0 : Math.max(0, Math.min(100, s.score));
          return (
            <div className="bar-row" key={d}>
              <span className="bar-label">
                <strong>{d}</strong>
                <span className="muted small">{DIMENSION_NAME[d]}</span>
              </span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${width}%` }} />
              </span>
              <span className="bar-value" data-testid={`score-${d}`}>
                {formatScore(s.score)}
              </span>
            </div>
          );
        })}
        <div className="bar-scale muted small">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
      <table className="score-table">
        <caption>Điểm quy đổi 0–100 của từng nhóm và số câu có điểm</caption>
        <thead>
          <tr>
            <th scope="col">Nhóm</th>
            <th scope="col">Điểm</th>
            <th scope="col">Số câu có điểm</th>
          </tr>
        </thead>
        <tbody>
          {DIMENSIONS.map((d) => {
            const s = summary.dimensions[d];
            return (
              <tr key={d}>
                <th scope="row">{DIMENSION_LABEL[d]}</th>
                <td data-testid={`table-score-${d}`}>{formatScore(s.score)}</td>
                <td data-testid={`table-n-${d}`}>
                  {s.n}/{s.itemCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
