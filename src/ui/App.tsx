import { useEffect, useRef } from 'react';
import type { Screen } from '../storage/persistence';
import { useAppState } from './useAppState';
import { PrivacyPanel } from './components/PrivacyPanel';
import { IntroScreen } from './screens/IntroScreen';
import { ContextScreen } from './screens/ContextScreen';
import { SurveyScreen } from './screens/SurveyScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { CoachingScreen } from './screens/CoachingScreen';
import { PlanScreen } from './screens/PlanScreen';
import { ExportScreen } from './screens/ExportScreen';

const STEPS: { screen: Screen; label: string }[] = [
  { screen: 'intro', label: 'Mở đầu' },
  { screen: 'context', label: 'Bối cảnh' },
  { screen: 'survey', label: 'Khảo sát' },
  { screen: 'review', label: 'Rà soát' },
  { screen: 'results', label: 'Kết quả' },
  { screen: 'coaching', label: 'Coaching' },
  { screen: 'plan', label: 'Kế hoạch' },
  { screen: 'export', label: 'Lưu & chia sẻ' },
];

/** Màn hình nào cần điều kiện gì; nếu không thỏa thì quay về bước phù hợp. */
function guard(screen: Screen, api: ReturnType<typeof useAppState>): Screen {
  const { session, importInfo } = api.state;
  if (screen === 'intro') return screen;
  if (!session.consentAcknowledged) return 'intro';
  if (importInfo) return ['results', 'coaching', 'plan', 'export'].includes(screen) ? screen : 'results';
  if (screen === 'context') return screen;
  if (!session.setting) return 'context';
  if (screen === 'survey' || screen === 'review' || screen === 'results') return screen;
  if (api.evaluation.interpretation.status === 'insufficient') return 'results';
  if (!session.completedAt) return 'review';
  return screen;
}

export function App() {
  const api = useAppState();
  const screen = guard(api.state.screen, api);
  const stepIndex = STEPS.findIndex((s) => s.screen === screen);
  const mainRef = useRef<HTMLElement>(null);

  // Khi đổi màn hình: cuộn lên đầu và đưa focus vào tiêu đề để người dùng bàn phím/trình đọc màn hình biết vị trí.
  // Nếu đang mở một câu cụ thể từ màn hình rà soát, màn hình khảo sát tự đưa focus tới câu đó.
  const focusQuestion = api.state.focusQuestion;
  useEffect(() => {
    if (focusQuestion) return;
    window.scrollTo(0, 0);
    const h1 = mainRef.current?.querySelector<HTMLElement>('h1');
    h1?.focus();
  }, [screen]);

  return (
    <div className="app-shell">
      <a className="skip-link no-print" href="#main">
        Bỏ qua đến nội dung chính
      </a>
      <header className="app-header no-print">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">DISC Coaching Lab</span>
        </div>
        <PrivacyPanel api={api} />
      </header>
      <nav className="stepper no-print" aria-label="Các bước">
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
        {screen === 'context' && <ContextScreen api={api} />}
        {screen === 'survey' && <SurveyScreen api={api} />}
        {screen === 'review' && <ReviewScreen api={api} />}
        {screen === 'results' && <ResultsScreen api={api} />}
        {screen === 'coaching' && <CoachingScreen api={api} />}
        {screen === 'plan' && <PlanScreen api={api} />}
        {screen === 'export' && <ExportScreen api={api} />}
      </main>
      <footer className="app-footer no-print">
        <p>
          Bộ câu hỏi tự biên soạn, chưa chuẩn hóa tâm trắc. Không phải sản phẩm của bất kỳ nhà cung cấp đánh giá thương
          mại nào. Câu trả lời không rời khỏi thiết bị trừ khi bạn tự xuất file.
        </p>
      </footer>
    </div>
  );
}
