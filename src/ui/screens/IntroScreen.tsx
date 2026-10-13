import { AUDIENCE, CONTEXT_PROMPT, DISCLAIMER, ORGANIZATION, QUESTIONS } from '../../domain/questionnaire';
import { Actions, ScreenTitle } from '../components/common';
import type { AppApi } from '../useAppState';

export function IntroScreen({ api }: { api: AppApi }) {
  return (
    <section className="stack">
      <ScreenTitle eyebrow={`${ORGANIZATION} · ${AUDIENCE}`}>Khảo sát xu hướng hành vi trong công việc</ScreenTitle>
      <div className="card stack">
        <p className="lead">{CONTEXT_PROMPT}</p>
        <ul className="facts">
          <li>
            <strong>{QUESTIONS.length} câu trắc nghiệm</strong>: 24 câu về xu hướng hành vi và 6 câu về leadership, làm
            việc nhóm. Chọn mức 1–5 hoặc “Chưa có trải nghiệm”.
          </li>
          <li>
            <strong>Khoảng 6–8 phút.</strong> Cần chọn đủ {QUESTIONS.length} câu trước khi gửi.
          </li>
          <li>
            Sau khi gửi, bạn xem được <strong>kết quả sơ bộ của chính mình</strong>. Coach nhận câu trả lời và kết quả
            để chuẩn bị buổi trao đổi.
          </li>
        </ul>
      </div>
      <div className="notice notice-info">
        <p>
          <strong>Giới hạn.</strong> {DISCLAIMER}
        </p>
      </div>
      <Actions>
        <button type="button" className="btn btn-primary" onClick={() => api.go('identify')}>
          Bắt đầu
        </button>
      </Actions>
    </section>
  );
}
