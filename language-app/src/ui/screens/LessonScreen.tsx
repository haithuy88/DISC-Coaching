import { useEffect, useState } from 'react';
import type { GradeResult, Level, Scenario, Skill } from '../../../shared/api';
import type { LanguageInfo } from '../../../shared/languages';
import { SKILL_OF, type Activity, type Lesson, type Mcq, type Phrase } from '../../content/types';
import type { LearnerProfile } from '../../domain/progress';
import { countLength, shadowingScore } from '../../domain/shadowing';
import { gradeResponse } from '../../lib/api';
import { shuffledOrder } from '../../lib/shuffle';
import { speak } from '../../lib/speech';
import { GradeCard, ListenButton, MicButton, ReadingToggle, SKILL_LABELS, TargetText, useShowReading } from '../components';

type Step = { key: string; label: string } & ({ type: 'intro' } | { type: 'activity'; activity: Activity } | { type: 'roleplay' });

const KIND_LABEL: Record<Activity['kind'], string> = {
  listening: `${SKILL_LABELS.listening.icon} Nghe`,
  reading: `${SKILL_LABELS.reading.icon} Đọc`,
  shadowing: '🔁 Nói theo',
  speaking: `${SKILL_LABELS.speaking.icon} Nói`,
  writing: `${SKILL_LABELS.writing.icon} Viết`,
};

interface Ctx {
  language: LanguageInfo;
  level: Level;
  code: string;
  showReading: boolean;
  aiEnabled: boolean;
}

export function LessonScreen({
  language,
  level,
  code,
  aiEnabled,
  lesson,
  profile,
  onOpen,
  onResult,
  onRoleplay,
  onBack,
}: {
  language: LanguageInfo;
  level: Level;
  code: string;
  aiEnabled: boolean;
  lesson: Lesson;
  profile: LearnerProfile;
  /** Gọi một lần khi mở bài (đưa từ vựng vào hộp ôn tập). */
  onOpen: () => void;
  onResult: (activityId: string, skill: Skill, score: number) => void;
  onRoleplay: (scenario: Scenario) => void;
  onBack: () => void;
}) {
  const steps: Step[] = [
    { key: 'intro', label: '📚 Từ vựng', type: 'intro' },
    ...lesson.activities.map((a): Step => ({ key: a.id, label: KIND_LABEL[a.kind], type: 'activity', activity: a })),
    // Hội thoại thực chiến cần AI; khi AI tắt thì bỏ bước này.
    ...(aiEnabled ? [{ key: 'roleplay', label: '💬 Thực chiến', type: 'roleplay' } as Step] : []),
  ];
  const [current, setCurrent] = useState(0);
  const [showReading, setShowReading] = useShowReading();
  const step = steps[current]!;
  const ctx: Ctx = { language, level, code, showReading, aiEnabled };

  // Chỉ chạy khi mở bài mới.
  useEffect(() => onOpen(), [lesson.id]);

  return (
    <section className="narrow">
      <button type="button" className="link" onClick={onBack}>
        ← Tổng quan
      </button>
      <h1>{lesson.titleVi}</h1>
      <div className="row left">
        <span className="muted">{lesson.title}</span>
        {language.readingName && <ReadingToggle name={language.readingName} show={showReading} onChange={setShowReading} />}
      </div>
      <nav className="stepper">
        {steps.map((s, i) => {
          const done = s.type === 'activity' && profile.results[s.activity.id];
          return (
            <button key={s.key} type="button" className={`step ${i === current ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => setCurrent(i)}>
              {s.label}
              {done ? ' ✓' : ''}
            </button>
          );
        })}
      </nav>

      {step.type === 'intro' && <IntroView lesson={lesson} ctx={ctx} />}

      {step.type === 'activity' && (
        <ActivityView key={step.activity.id} activity={step.activity} ctx={ctx} onScore={(score) => onResult(step.activity.id, SKILL_OF[step.activity.kind], score)} />
      )}

      {step.type === 'roleplay' && (
        <div className="card">
          <h3>{lesson.roleplay.title}</h3>
          <p>
            <strong>Bạn đóng vai:</strong> {lesson.roleplay.learnerRole}
          </p>
          <p>
            <strong>Mục tiêu:</strong> {lesson.roleplay.goal}
          </p>
          {lesson.roleplay.targetPhrases.length > 0 && <p className="muted">Cố gắng dùng: {lesson.roleplay.targetPhrases.join(' · ')}</p>}
          <button type="button" className="btn primary" onClick={() => onRoleplay(lesson.roleplay)}>
            Bắt đầu hội thoại với AI
          </button>
        </div>
      )}

      <div className="row">
        <button type="button" className="btn ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Bước trước
        </button>
        <button type="button" className="btn ghost" disabled={current === steps.length - 1} onClick={() => setCurrent(current + 1)}>
          Bước tiếp
        </button>
      </div>
    </section>
  );
}

function IntroView({ lesson, ctx }: { lesson: Lesson; ctx: Ctx }) {
  const locale = ctx.language.speechLocale;
  return (
    <div className="card">
      <h3>Mục tiêu bài học</h3>
      <ul>
        {lesson.objectivesVi.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <h3>Từ vựng</h3>
      <ul className="vocab">
        {lesson.vocabulary.map((v) => (
          <li key={v.term}>
            <button type="button" className="icon-btn" onClick={() => speak(v.example ?? v.term, locale)} aria-label={`Nghe ${v.term}`}>
              🔊
            </button>
            <TargetText text={v.term} reading={v.reading} meaningVi={v.meaningVi} showReading={ctx.showReading} />
            {v.example && <div className="muted small">{v.example}</div>}
          </li>
        ))}
      </ul>
      {lesson.grammar && (
        <>
          <h3>💡 {lesson.grammar.titleVi}</h3>
          <ul>
            {lesson.grammar.pointsVi.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <ul className="vocab">
            {lesson.grammar.examples.map((ex) => (
              <li key={ex.text}>
                <button type="button" className="icon-btn" onClick={() => speak(ex.text, locale)} aria-label={`Nghe ${ex.text}`}>
                  🔊
                </button>
                <TargetText {...ex} showReading={ctx.showReading} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="muted small">Từ vựng của bài đã được thêm vào mục Ôn tập.</p>
    </div>
  );
}

function ActivityView({ activity, ctx, onScore }: { activity: Activity; ctx: Ctx; onScore: (score: number) => void }) {
  const locale = ctx.language.speechLocale;
  switch (activity.kind) {
    case 'listening':
      return (
        <div className="card">
          <h3>{activity.titleVi}</h3>
          <div className="row left">
            <ListenButton text={activity.script} locale={locale} />
            <button type="button" className="btn ghost" onClick={() => speak(activity.script, locale, 0.65)}>
              🐢 Nghe chậm
            </button>
          </div>
          <Quiz
            questions={activity.questions}
            onScore={onScore}
            reveal={<TargetText text={activity.script} reading={activity.reading} meaningVi={activity.translationVi} showReading={ctx.showReading} />}
          />
        </div>
      );
    case 'reading':
      return (
        <div className="card">
          <h3>{activity.titleVi}</h3>
          <blockquote>
            <TargetText text={activity.passage} reading={activity.reading} showReading={ctx.showReading} />
          </blockquote>
          <Quiz questions={activity.questions} onScore={onScore} reveal={activity.translationVi && <p>{activity.translationVi}</p>} />
        </div>
      );
    case 'shadowing':
      return <Shadowing activity={activity} ctx={ctx} onScore={onScore} />;
    case 'speaking':
    case 'writing':
      return <ProductionTask activity={activity} ctx={ctx} onScore={onScore} />;
  }
}

function Quiz({ questions, onScore, reveal }: { questions: Mcq[]; onScore: (score: number) => void; reveal?: React.ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id} className="quiz-q">
          <p>{q.question}</p>
          <div className="options inline">
            {shuffledOrder(q.id + q.question, q.options.length).map((i) => {
              const state = !checked ? (answers[q.id] === i ? 'selected' : '') : i === q.answer ? 'correct' : answers[q.id] === i ? 'wrong' : '';
              return (
                <button key={i} type="button" disabled={checked} className={`option ${state}`} onClick={() => setAnswers({ ...answers, [q.id]: i })}>
                  {q.options[i]}
                </button>
              );
            })}
          </div>
          {checked && q.explanationVi && <p className="muted small">{q.explanationVi}</p>}
        </div>
      ))}
      {!checked ? (
        <button
          type="button"
          className="btn primary"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => {
            setChecked(true);
            onScore(Math.round((correct / questions.length) * 100));
          }}
        >
          Kiểm tra
        </button>
      ) : (
        <div>
          <p>
            <strong>
              Đúng {correct}/{questions.length}
            </strong>
          </p>
          {reveal && (
            <details>
              <summary>Xem lời thoại / bản dịch</summary>
              {reveal}
            </details>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setAnswers({});
              setChecked(false);
            }}
          >
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}

function Shadowing({ activity, ctx, onScore }: { activity: { sentences: Phrase[]; titleVi: string }; ctx: Ctx; onScore: (score: number) => void }) {
  const byChar = Boolean(ctx.language.countsCharacters);
  const [best, setBest] = useState<Record<number, number>>({});
  const [heard, setHeard] = useState<Record<number, string>>({});
  const done = Object.keys(best).length === activity.sentences.length;

  function record(i: number, transcript: string) {
    setHeard((h) => ({ ...h, [i]: transcript }));
    const score = shadowingScore(activity.sentences[i]!.text, transcript, byChar);
    const next = { ...best, [i]: Math.max(best[i] ?? 0, score) };
    setBest(next);
    if (Object.keys(next).length === activity.sentences.length) {
      const values = Object.values(next);
      onScore(Math.round(values.reduce((x, y) => x + y, 0) / values.length));
    }
  }

  return (
    <div className="card">
      <h3>{activity.titleVi}</h3>
      <p className="muted small">Bấm 🔊 nghe câu mẫu, rồi bấm “Nói lại” và đọc theo. App so khớp những gì bạn nói với câu mẫu.</p>
      {activity.sentences.map((s, i) => (
        <div key={s.text} className="shadow-row">
          <button type="button" className="icon-btn" onClick={() => speak(s.text, ctx.language.speechLocale, 0.85)} aria-label="Nghe câu mẫu">
            🔊
          </button>
          <TargetText {...s} showReading={ctx.showReading} />
          <MicButton locale={ctx.language.speechLocale} label="Nói lại" onTranscript={(t) => t && record(i, t)} />
          {heard[i] !== undefined && (
            <div className="small">
              Bạn nói: “{heard[i]}” · <strong className={(best[i] ?? 0) >= 80 ? 'good' : 'warn'}>{best[i]} điểm</strong>
            </div>
          )}
        </div>
      ))}
      {done && <p className="next">Hoàn thành! Điểm được tính theo lần nói tốt nhất của mỗi câu.</p>}
    </div>
  );
}

function ProductionTask({
  activity,
  ctx,
  onScore,
}: {
  activity: Extract<Activity, { kind: 'speaking' | 'writing' }>;
  ctx: Ctx;
  onScore: (score: number) => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<GradeResult>();
  const [selfChecked, setSelfChecked] = useState(false);
  const byChar = Boolean(ctx.language.countsCharacters);
  const length = countLength(text, byChar);
  const isSpeaking = activity.kind === 'speaking';
  const tooShort = activity.kind === 'writing' && length < activity.minLength;

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      const graded = await gradeResponse(ctx.code, {
        language: ctx.language.code,
        level: ctx.level,
        skill: activity.kind,
        task: activity.prompt,
        response: text,
        criteria: activity.criteria,
      });
      setResult(graded);
      onScore(graded.score);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3>{activity.titleVi}</h3>
      <p className="target-text">{activity.prompt}</p>
      <p className="muted small">{activity.hintVi}</p>
      {!ctx.aiEnabled && (
        <p className="note small">
          Tự luyện: AI chấm bài đang tắt. Hãy làm bài rồi tự đối chiếu với các tiêu chí bên dưới. Bài này chưa tính điểm.
        </p>
      )}
      {isSpeaking && <MicButton locale={ctx.language.speechLocale} onTranscript={setText} />}
      <textarea
        rows={isSpeaking ? 4 : 8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isSpeaking ? 'Bản ghi giọng nói hiện ở đây (có thể sửa lỗi nhận dạng)…' : 'Viết câu trả lời…'}
      />
      {activity.kind === 'writing' && (
        <p className="muted small">
          {length} {byChar ? 'chữ' : 'từ'} (tối thiểu {activity.minLength})
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {ctx.aiEnabled ? (
        <button type="button" className="btn primary" disabled={busy || !text.trim() || tooShort} onClick={submit}>
          {busy ? 'AI đang chấm (10–30 giây)…' : 'Nộp để AI chấm'}
        </button>
      ) : (
        <details open={selfChecked}>
          <summary className="btn ghost" onClick={() => setSelfChecked(true)}>
            Tự kiểm tra
          </summary>
          <ul>
            {activity.criteria.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      )}
      {result && <GradeCard result={result} />}
    </div>
  );
}
