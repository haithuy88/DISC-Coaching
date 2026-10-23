import { useState } from 'react';
import { LEVELS, type GradeResult, type Level } from '../../../shared/api';
import { LEVEL_LABELS_VI, type LanguageInfo } from '../../../shared/languages';
import { getPlacementTest } from '../../content';
import { combinePlacement, scorePlacement, type PlacementScore } from '../../domain/placement';
import { gradeResponse } from '../../lib/api';
import { shuffledOrder } from '../../lib/shuffle';
import { GradeCard, LevelBadge, ListenButton } from '../components';

type Stage = 'intro' | 'questions' | 'writing' | 'result';

/** Writing-only khi ngôn ngữ chưa có bộ trắc nghiệm: AI chấm một đoạn viết để xếp level. */
const GENERIC_WRITING_TASK = 'Write as much as you can (3–8 sentences) about yourself, your work and your plans.';

export function PlacementScreen({
  language,
  code,
  aiEnabled,
  onDone,
  onBack,
}: {
  language: LanguageInfo;
  code: string;
  aiEnabled: boolean;
  onDone: (level: Level, placement?: { objectiveLevel?: Level; writingLevel?: Level }) => void;
  onBack: () => void;
}) {
  const test = getPlacementTest(language.code);
  const [stage, setStage] = useState<Stage>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [objective, setObjective] = useState<PlacementScore>();
  const [writing, setWriting] = useState('');
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string>();
  const [grade, setGrade] = useState<GradeResult>();

  const finalLevel = objective ? combinePlacement(objective.level, grade?.estimatedLevel) : (grade?.estimatedLevel ?? 'A1');

  async function submitWriting() {
    setGrading(true);
    setError(undefined);
    try {
      const result = await gradeResponse(code, {
        language: language.code,
        // Chấm so với B1 để thang điểm ở giữa; level thật lấy từ estimatedLevel.
        level: objective?.level ?? 'B1',
        skill: 'writing',
        task: test?.writingTask ?? GENERIC_WRITING_TASK,
        response: writing,
        criteria: ['This is a placement test: estimate the CEFR level carefully from grammar range, vocabulary and coherence'],
      });
      setGrade(result);
      setStage('result');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGrading(false);
    }
  }

  if (stage === 'intro') {
    return (
      <section className="narrow">
        <button type="button" className="link" onClick={onBack}>
          ← Đổi ngôn ngữ
        </button>
        <h1>
          {language.flag} {language.nameVi}: xác định trình độ
        </h1>
        {(test || aiEnabled) && (
          <div className="card">
            <h3>Làm bài test xếp lớp (khuyên dùng)</h3>
            <p className="muted">
              {!test
                ? 'Viết một đoạn ngắn, AI sẽ đánh giá trình độ. Khoảng 5 phút.'
                : aiEnabled
                  ? `${test.questions.length} câu trắc nghiệm (có câu nghe) từ dễ đến khó, sau đó viết một đoạn ngắn để AI đánh giá. Khoảng 10 phút.`
                  : `${test.questions.length} câu trắc nghiệm (có câu nghe) từ dễ đến khó. Khoảng 7 phút.`}
            </p>
            <button type="button" className="btn primary" onClick={() => setStage(test ? 'questions' : 'writing')}>
              Bắt đầu test
            </button>
          </div>
        )}
        <div className="card">
          <h3>Hoặc tự chọn level</h3>
          <div className="chips">
            {LEVELS.map((l) => (
              <button key={l} type="button" className="chip" onClick={() => onDone(l)}>
                <strong>{l}</strong> {LEVEL_LABELS_VI[l]}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stage === 'questions' && test) {
    const q = test.questions[index]!;
    const chosen = answers[q.id];
    const isLast = index === test.questions.length - 1;
    return (
      <section className="narrow">
        <div className="progress-line">
          <div style={{ width: `${((index + 1) / test.questions.length) * 100}%` }} />
        </div>
        <p className="muted small">
          Câu {index + 1}/{test.questions.length}
        </p>
        <div className="card">
          {q.audio && <ListenButton text={q.audio} locale={language.speechLocale} label="Nghe đoạn âm thanh" />}
          <h3>{q.question}</h3>
          <div className="options">
            {shuffledOrder(q.id + q.question, q.options.length).map((i) => (
              <button
                key={i}
                type="button"
                className={`option ${chosen === i ? 'selected' : ''}`}
                onClick={() => setAnswers({ ...answers, [q.id]: i })}
              >
                {q.options[i]}
              </button>
            ))}
            <button type="button" className={`option muted ${chosen === -1 ? 'selected' : ''}`} onClick={() => setAnswers({ ...answers, [q.id]: -1 })}>
              Tôi không biết
            </button>
          </div>
          <div className="row">
            <button type="button" className="btn ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Quay lại
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={chosen === undefined}
              onClick={() => {
                if (!isLast) return setIndex(index + 1);
                setObjective(scorePlacement(test.questions, answers));
                // Phần viết cần AI chấm; khi AI tắt, xếp lớp chỉ theo trắc nghiệm.
                setStage(aiEnabled ? 'writing' : 'result');
              }}
            >
              {isLast ? 'Xong phần trắc nghiệm' : 'Tiếp'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (stage === 'writing') {
    const task = test?.writingTask ?? GENERIC_WRITING_TASK;
    return (
      <section className="narrow">
        <div className="card">
          <h3>Phần viết</h3>
          <p>{task}</p>
          <textarea rows={7} value={writing} onChange={(e) => setWriting(e.target.value)} placeholder={`Viết bằng ${language.nameVi}…`} />
          {error && <p className="error">{error}</p>}
          <div className="row">
            {objective && (
              <button type="button" className="btn ghost" onClick={() => setStage('result')}>
                Bỏ qua phần viết
              </button>
            )}
            <button type="button" className="btn primary" disabled={grading || writing.trim().length < 20} onClick={submitWriting}>
              {grading ? 'AI đang chấm…' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="narrow">
      <h1>Kết quả xếp lớp</h1>
      <div className="card center">
        <p className="muted">Level đề xuất</p>
        <LevelBadge level={finalLevel} language={language} />
        {objective && (
          <table className="table">
            <tbody>
              {LEVELS.filter((l) => objective.perLevel[l].total > 0).map((l) => (
                <tr key={l}>
                  <td>{l}</td>
                  <td>
                    {objective.perLevel[l].correct}/{objective.perLevel[l].total} câu đúng
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          type="button"
          className="btn primary"
          onClick={() => onDone(finalLevel, { objectiveLevel: objective?.level, writingLevel: grade?.estimatedLevel })}
        >
          Bắt đầu học ở {finalLevel}
        </button>
      </div>
      {grade && <GradeCard result={grade} />}
    </section>
  );
}
