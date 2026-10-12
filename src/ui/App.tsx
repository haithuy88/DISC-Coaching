import { useEffect, useRef } from 'react';
import { ORGANIZATION } from '../domain/questionnaire';
import { validateParticipant } from '../domain/session';
import { useAppState, type AppApi, type Screen } from './useAppState';
import { IntroScreen } from './screens/IntroScreen';
import { IdentifyScreen } from './screens/IdentifyScreen';
import { SurveyScreen } from './screens/SurveyScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ResultsScreen } from './screens/ResultsScreen';

const STEPS: { screen: Screen; label: string }[] = [
  { screen: 'intro', label: 'Mở đầu' },
  { screen: 'identify', label: 'Thông tin' },
  { screen: 'survey', label: 'Khảo sát' },
  { screen: 'review', label: 'Rà soát & gửi' },
  { screen: 'result', label: 'Kết quả' },
];

/** Không cho vào bước sau khi chưa đủ điều kiện của bước trước. */
function guard(api: AppApi): Screen {
  const { screen, session, submit } = api.state;
  if (submit.status !== 'idle') return 'result';
  if (screen === 'intro' || screen === 'identify') return screen;
  const identified = Object.keys(validateParticipant(session.participant)).length === 0 && session.consentAt;
  if (!identified) return 'identify';
  if (screen === 'result') return 'review';
  return screen;
}

export function App() {
  const api = useAppState();
  const screen = guard(api);
  const stepIndex = STEPS.findIndex((s) => s.screen === screen);
  const mainRef = useRef<HTMLElement>(null);
  const focusQuestion = api.state.focusQuestion;

  // Đổi màn hình: cuộn lên đầu và đưa focus vào tiêu đề (trừ khi đang mở một câu cụ thể để sửa).
  useEffect(() => {
    if (focusQuestion) return;
    window.scrollTo(0, 0);
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [screen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Bỏ qua đến nội dung chính
      </a>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{ORGANIZATION} · DISC 30 câu</span>
        </div>
      </header>
      <nav className="stepper" aria-label="Các bước">
        <p className="stepper-text">
          Bước {stepIndex + 1}/{STEPS.length}: <strong>{STEPS[stepIndex]?.label}</strong>
        </p>
        <ol className="stepper-dots">
          {STEPS.map((s, i) => (
            <li
              key={s.screen}
              className={i < stepIndex ? 'done' : i === stepIndex ? 'current' : ''}
              aria-current={i === stepIndex ? 'step' : undefined}
            >
              <span className="sr-only">{s.label}</span>
            </li>
          ))}
        </ol>
      </nav>
      <main id="main" ref={mainRef} className="app-main">
        {screen === 'intro' && <IntroScreen api={api} />}
        {screen === 'identify' && <IdentifyScreen api={api} />}
        {screen === 'survey' && <SurveyScreen api={api} />}
        {screen === 'review' && <ReviewScreen api={api} />}
        {screen === 'result' && <ResultsScreen api={api} />}
      </main>
      <footer className="app-footer">
        <p>
          Bộ câu hỏi tự biên soạn, chưa chuẩn hóa tâm trắc. Không phải sản phẩm của bất kỳ nhà cung cấp đánh giá thương
          mại nào. Câu trả lời chỉ được gửi cho coach khi bạn bấm Gửi.
        </p>
      </footer>
    </div>
  );
}
