import { useState } from 'react';
import type { GradeResult, Level, Scenario, Skill } from '../../../shared/api';
import type { LanguageInfo } from '../../../shared/languages';
import type { Activity, Lesson, Mcq } from '../../content/types';
import type { LearnerProfile } from '../../domain/progress';
import { gradeResponse } from '../../lib/api';
import { speak } from '../../lib/speech';
import { GradeCard, ListenButton, MicButton, SKILL_LABELS } from '../components';

type Step = { key: string; label: string } & ({ type: 'vocab' } | { type: 'activity'; activity: Activity } | { type: 'roleplay' });

export function LessonScreen({
  language,
  level,
  lesson,
  profile,
  onResult,
  onRoleplay,
  onBack,
}: {
  language: LanguageInfo;
  level: Level;
  lesson: Lesson;
  profile: LearnerProfile;
  onResult: (activityId: string, skill: Skill, score: number) => void;
  onRoleplay: (scenario: Scenario) => void;
  onBack: () => void;
}) {
  const steps: Step[] = [
    { key: 'vocab', label: '📚 Từ vựng', type: 'vocab' },
    ...lesson.activities.map((a): Step => ({
      key: a.id,
      label: `${SKILL_LABELS[a.kind].icon} ${SKILL_LABELS[a.kind].vi}`,
      type: 'activity',
      activity: a,
    })),
    { key: 'roleplay', label: '💬 Thực chiến', type: 'roleplay' },
  ];
  const [current, setCurrent] = useState(0);
  const step = steps[current]!;

  return (
    <section className="narrow">
      <button type="button" className="link" onClick={onBack}>
        ← Tổng quan
      </button>
      <h1>{lesson.titleVi}</h1>
      <p className="muted">{lesson.title}</p>
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

      {step.type === 'vocab' && (
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
                <button type="button" className="icon-btn" onClick={() => speak(v.example ?? v.term, language.speechLocale)}>
                  🔊
                </button>
                <strong>{v.term}</strong> — {v.meaningVi}
                {v.example && <div className="muted small">{v.example}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.type === 'activity' && (
        <ActivityView
          key={step.activity.id}
          activity={step.activity}
          language={language}
          level={level}
          onScore={(score) => onResult(step.activity.id, step.activity.kind, score)}
        />
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

function ActivityView({
  activity,
  language,
  level,
  onScore,
}: {
  activity: Activity;
  language: LanguageInfo;
  level: Level;
  onScore: (score: number) => void;
}) {
  switch (activity.kind) {
    case 'listening':
      return (
        <div className="card">
          <h3>{activity.titleVi}</h3>
          <div className="row left">
            <ListenButton text={activity.script} locale={language.speechLocale} />
            <button type="button" className="btn ghost" onClick={() => speak(activity.script, language.speechLocale, 0.7)}>
              🐢 Nghe chậm
            </button>
          </div>
          <Quiz questions={activity.questions} onScore={onScore} reveal={activity.script} />
        </div>
      );
    case 'reading':
      return (
        <div className="card">
          <h3>{activity.titleVi}</h3>
          <blockquote>{activity.passage}</blockquote>
          <Quiz questions={activity.questions} onScore={onScore} />
        </div>
      );
    case 'speaking':
    case 'writing':
      return <ProductionTask activity={activity} language={language} level={level} onScore={onScore} />;
  }
}

function Quiz({ questions, onScore, reveal }: { questions: Mcq[]; onScore: (score: number) => void; reveal?: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id} className="quiz-q">
          <p>{q.question}</p>
          <div className="options inline">
            {q.options.map((opt, i) => {
              const state = !checked ? (answers[q.id] === i ? 'selected' : '') : i === q.answer ? 'correct' : answers[q.id] === i ? 'wrong' : '';
              return (
                <button key={opt} type="button" disabled={checked} className={`option ${state}`} onClick={() => setAnswers({ ...answers, [q.id]: i })}>
                  {opt}
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
              <summary>Xem lời thoại</summary>
              <p>{reveal}</p>
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

function ProductionTask({
  activity,
  language,
  level,
  onScore,
}: {
  activity: Extract<Activity, { kind: 'speaking' | 'writing' }>;
  language: LanguageInfo;
  level: Level;
  onScore: (score: number) => void;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<GradeResult>();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isSpeaking = activity.kind === 'speaking';

  async function submit() {
    setBusy(true);
    setError(undefined);
    try {
      const graded = await gradeResponse({
        language: language.code,
        level,
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
      <p>{activity.prompt}</p>
      <p className="muted small">{activity.hintVi}</p>
      {isSpeaking && <MicButton locale={language.speechLocale} onTranscript={setText} />}
      <textarea
        rows={isSpeaking ? 4 : 8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isSpeaking ? 'Bản ghi giọng nói hiện ở đây (có thể sửa lỗi nhận dạng)…' : 'Viết câu trả lời…'}
      />
      {activity.kind === 'writing' && (
        <p className="muted small">
          {words} từ (tối thiểu {activity.minWords})
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <button
        type="button"
        className="btn primary"
        disabled={busy || !text.trim() || (activity.kind === 'writing' && words < activity.minWords)}
        onClick={submit}
      >
        {busy ? 'AI đang chấm…' : 'Nộp để AI chấm'}
      </button>
      {result && <GradeCard result={result} />}
    </div>
  );
}
