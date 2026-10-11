import { QUESTIONNAIRE_VERSION, RULES, SCORING_CONFIG_VERSION } from '../../domain/questionnaire';
import { conclusion, headline } from '../../domain/narrative';
import type { Evaluation, ImportInfo } from '../../domain/report';
import { PERIOD_LABEL, SETTING_LABEL, formatDateVi, type Session } from '../../domain/session';
import { DIMENSIONS } from '../../domain/types';

export function ReportMeta({ session }: { session: Session }) {
  return (
    <dl className="meta">
      {session.displayName && (
        <div>
          <dt>Tên hiển thị</dt>
          <dd>{session.displayName}</dd>
        </div>
      )}
      <div>
        <dt>Bối cảnh</dt>
        <dd data-testid="meta-setting">{session.setting ? SETTING_LABEL[session.setting] : '—'}</dd>
      </div>
      <div>
        <dt>Khoảng thời gian</dt>
        <dd>{PERIOD_LABEL}</dd>
      </div>
      <div>
        <dt>Ngày làm</dt>
        <dd>{formatDateVi(session.completedAt ?? session.startedAt)}</dd>
      </div>
      <div>
        <dt>Phiên bản</dt>
        <dd>
          {QUESTIONNAIRE_VERSION} · {SCORING_CONFIG_VERSION}
        </dd>
      </div>
    </dl>
  );
}

export function ImportNotice({ info }: { info: ImportInfo | null }) {
  if (!info) return null;
  if (info.mode === 'unverified') {
    return (
      <p className="notice notice-warn" data-testid="import-unverified">
        <strong>Báo cáo được nhập, chưa đối chiếu đáp án.</strong> File không kèm câu trả lời từng câu nên điểm và bằng
        chứng dưới đây lấy từ file (đã kiểm tra định dạng), không được tính lại.
      </p>
    );
  }
  return (
    <p className="notice notice-info" data-testid="import-recomputed">
      <strong>Báo cáo được nhập và đã tính lại từ câu trả lời trong file.</strong>
      {info.scoresMismatch && ' Điểm ghi trong file không khớp với câu trả lời nên đã được thay bằng điểm tính lại.'}
    </p>
  );
}

export function InterpretationText({ session, evaluation }: { session: Session; evaluation: Evaluation }) {
  const { summary, interpretation } = evaluation;
  return (
    <div className="stack">
      <h2 data-testid="headline">{headline(interpretation)}</h2>
      <p data-testid="conclusion">
        {conclusion(session.setting ? SETTING_LABEL[session.setting] : '', summary, interpretation)}
      </p>
      {interpretation.partial && (
        <p className="notice notice-warn" data-testid="partial-notice">
          <strong>Kết quả tạm thời từ câu đã trả lời.</strong> Bạn có {summary.answered}/{summary.questionCount} câu có
          điểm (D {summary.dimensions.D.n}/8, I {summary.dimensions.I.n}/8, S {summary.dimensions.S.n}/8, C{' '}
          {summary.dimensions.C.n}/8).
        </p>
      )}
      {interpretation.reviewSuggested && (
        <p className="notice notice-info" data-testid="review-suggested">
          Bạn đã chọn cùng một mức cho mọi câu có điểm. Điều này hoàn toàn có thể xảy ra. Nếu muốn, hãy thử xem lại vài
          câu bằng một ví dụ cụ thể gần đây để chắc rằng mỗi lựa chọn phản ánh đúng trải nghiệm của bạn.
        </p>
      )}
      {(interpretation.status === 'flat' || interpretation.status === 'multiple') && (
        <p className="muted">
          Khi các xu hướng gần nhau, phần coaching sẽ ưu tiên từng câu trả lời và mục tiêu bạn tự chọn thay vì gán một
          kiểu.
        </p>
      )}
    </div>
  );
}

export function InsufficientView({ evaluation }: { evaluation: Evaluation }) {
  const { summary } = evaluation;
  return (
    <div className="stack" data-testid="insufficient">
      <h2>Chưa đủ dữ liệu để diễn giải</h2>
      <p>
        Cần mỗi nhóm có ít nhất {RULES.minAnsweredPerDimension}/8 câu có điểm và tổng ít nhất {RULES.minAnsweredTotal}/
        {summary.questionCount} câu. Ứng dụng không tự điền câu thiếu, nên chưa có kết luận, điểm mạnh hay gợi ý.
      </p>
      <ul className="n-list">
        {DIMENSIONS.map((d) => (
          <li key={d} className={summary.dimensions[d].n < RULES.minAnsweredPerDimension ? 'short' : ''}>
            Nhóm {d}: {summary.dimensions[d].n}/8 câu có điểm
            {summary.dimensions[d].n < RULES.minAnsweredPerDimension ? ' – cần thêm' : ''}
          </li>
        ))}
      </ul>
      <p>
        Tổng: {summary.answered}/{summary.questionCount} câu có điểm, {summary.naCount} N/A, {summary.unanswered} chưa trả
        lời.
      </p>
    </div>
  );
}
