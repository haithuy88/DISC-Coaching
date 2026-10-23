import { useEffect, useRef, useState } from 'react';
import type { ChatTurn, GradeResult, Level, Scenario } from '../../../shared/api';
import type { LanguageInfo } from '../../../shared/languages';
import { chat, gradeResponse } from '../../lib/api';
import { speak, stopSpeaking } from '../../lib/speech';
import { GradeCard, MicButton } from '../components';

// Lượt mở đầu ẩn: bot nhận "[start]" để tự mở lời trong vai (xem server/prompts.ts).
const START: ChatTurn = { role: 'user', content: '[start]' };
const MAX_TURNS = 40;

export function ChatScreen({
  language,
  level,
  code,
  scenario,
  onFinished,
  onBack,
}: {
  language: LanguageInfo;
  level: Level;
  code: string;
  scenario: Scenario;
  onFinished: (score: number) => void;
  onBack: () => void;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [feedback, setFeedback] = useState<GradeResult>();
  const [grading, setGrading] = useState(false);
  const started = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  async function send(history: ChatTurn[]) {
    setBusy(true);
    setError(undefined);
    try {
      const reply = await chat(code, { language: language.code, level, scenario, messages: [START, ...history] });
      setTurns([...history, { role: 'assistant', content: reply }]);
      if (autoSpeak) speak(reply, language.speechLocale);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    // StrictMode chạy effect hai lần khi dev; chỉ mở lời một lần.
    if (started.current) return;
    started.current = true;
    void send([]);
    return stopSpeaking;
  }, []);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), [turns, busy]);

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const history = [...turns, { role: 'user' as const, content: text }];
    setTurns(history);
    void send(history);
  }

  async function finish() {
    setGrading(true);
    setError(undefined);
    try {
      const transcript = turns.map((t) => `${t.role === 'user' ? 'Learner' : 'Partner'}: ${t.content}`).join('\n');
      const result = await gradeResponse(code, {
        language: language.code,
        level,
        skill: 'conversation',
        task: `Role-play "${scenario.title}". Learner's role: ${scenario.learnerRole}. Goal: ${scenario.goal}`,
        response: transcript,
        criteria: ['Did the learner reach the goal?', ...(scenario.targetPhrases.length ? [`Use of: ${scenario.targetPhrases.join(', ')}`] : [])],
      });
      setFeedback(result);
      onFinished(result.score);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGrading(false);
    }
  }

  const learnerTurns = turns.filter((t) => t.role === 'user').length;

  return (
    <section className="narrow chat">
      <button type="button" className="link" onClick={onBack}>
        ← Quay lại
      </button>
      <div className="card">
        <h2>{scenario.title}</h2>
        <p className="small">
          <strong>Vai của bạn:</strong> {scenario.learnerRole} · <strong>Mục tiêu:</strong> {scenario.goal}
        </p>
        <label className="small muted">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} /> Tự đọc câu trả lời của bot
        </label>
      </div>

      <div className="messages">
        {turns.map((t, i) => (
          <div key={i} className={`bubble ${t.role}`}>
            {t.content}
            {t.role === 'assistant' && (
              <button type="button" className="icon-btn" onClick={() => speak(t.content, language.speechLocale)}>
                🔊
              </button>
            )}
          </div>
        ))}
        {busy && <div className="bubble assistant muted typing">Đang trả lời…</div>}
        <div ref={bottom} />
      </div>

      {error && <p className="error">{error}</p>}

      {!feedback && (
        <div className="composer card">
          <MicButton locale={language.speechLocale} onTranscript={setInput} />
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Trả lời bằng ${language.nameVi} (bí thì gõ tiếng Việt để nhận gợi ý)…`}
          />
          <div className="row">
            <button type="button" className="btn ghost" disabled={learnerTurns < 2 || grading || busy} onClick={finish}>
              {grading ? 'Đang nhận xét…' : 'Kết thúc & nhận xét'}
            </button>
            <button type="button" className="btn primary" disabled={busy || !input.trim() || turns.length >= MAX_TURNS} onClick={submit}>
              Gửi
            </button>
          </div>
        </div>
      )}
      {feedback && <GradeCard result={feedback} />}
    </section>
  );
}
