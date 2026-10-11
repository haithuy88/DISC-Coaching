import { useId } from 'react';
import { DISCLAIMER, QUESTIONS } from '../../domain/questionnaire';
import { Actions, ScreenTitle } from '../components/common';
import { ImportReport } from '../components/ImportReport';
import type { AppApi } from '../useAppState';

export function IntroScreen({ api }: { api: AppApi }) {
  const { session } = api.state;
  const hintId = useId();
  const ack = session.consentAcknowledged;
  return (
    <section className="stack">
      <ScreenTitle eyebrow="Tự phản tư · Coaching">Hiểu cách bạn thường hành động, rồi thử một thay đổi nhỏ</ScreenTitle>
      <div className="card stack">
        <p className="lead">
          DISC Coaching Lab giúp bạn nhìn lại hành vi thường gặp trong một bối cảnh, xem gợi ý dựa trên chính câu trả
          lời của bạn và lập kế hoạch thử nghiệm 7 ngày.
        </p>
        <ul className="facts">
          <li>
            <strong>{QUESTIONS.length} phát biểu</strong>, chọn mức độ giống bạn từ 1 đến 5 hoặc “Chưa có trải nghiệm”.
          </li>
          <li>
            <strong>Khoảng 8–10 phút</strong> – con số ước lượng, đang được kiểm tra lại trong thử nghiệm thực tế.
          </li>
          <li>
            <strong>Không có đáp án đúng/sai</strong> hay phong cách tốt nhất. Hãy trả lời theo hành vi thật, không theo
            hình mẫu mong muốn.
          </li>
        </ul>
      </div>

      <div className="notice notice-info">
        <p>
          <strong>Giới hạn của bộ câu hỏi.</strong> {DISCLAIMER}
        </p>
        <p>Mọi diễn giải là giả thuyết để bạn tự kiểm chứng bằng tình huống thực tế.</p>
      </div>

      <div className="card stack">
        <h2>Quyền riêng tư</h2>
        <p>
          Câu trả lời chỉ nằm trên thiết bị này, không được gửi qua mạng và không có analytics. Bạn có thể tự xuất báo
          cáo để chia sẻ với coach nếu muốn. Lưu trên thiết bị là tùy chọn (nút “Quyền riêng tư” phía trên).
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={ack}
            aria-describedby={hintId}
            onChange={(e) => api.updateSession({ consentAcknowledged: e.target.checked })}
          />
          <span>Tôi hiểu đây là công cụ tự phản tư chưa chuẩn hóa, không dùng để chẩn đoán, tuyển dụng hay xếp hạng.</span>
        </label>
        <p id={hintId} className="muted small">
          Xác nhận này không có nghĩa là bạn đồng ý chia sẻ dữ liệu.
        </p>
        <Actions>
          <button type="button" className="btn btn-primary" disabled={!ack} onClick={() => api.go('context')}>
            Bắt đầu
          </button>
        </Actions>
        {!ack && <p className="muted small">Hãy đánh dấu ô xác nhận để bắt đầu.</p>}
      </div>

      <details className="card">
        <summary>Đã có báo cáo được xuất trước đó?</summary>
        <div className="stack top-gap">
          {ack ? (
            <ImportReport api={api} />
          ) : (
            <p className="muted">Đánh dấu ô xác nhận phía trên để mở báo cáo.</p>
          )}
        </div>
      </details>
    </section>
  );
}
