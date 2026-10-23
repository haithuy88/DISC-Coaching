import { useRef, useState } from 'react';
import type { GradeResult, Level, Skill } from '../../shared/api';
import { LEVEL_LABELS_VI, type LanguageInfo } from '../../shared/languages';
import { canRecognizeSpeech, listen, speak, type Listener } from '../lib/speech';

export const SKILL_LABELS: Record<Skill, { vi: string; icon: string }> = {
  listening: { vi: 'Nghe', icon: '🎧' },
  speaking: { vi: 'Nói', icon: '🎙️' },
  reading: { vi: 'Đọc', icon: '📖' },
  writing: { vi: 'Viết', icon: '✍️' },
};

export function LevelBadge({ level, language }: { level: Level; language?: LanguageInfo }) {
  const exam = language?.examFramework;
  return (
    <span className="level-badge">
      <strong>{level}</strong> {LEVEL_LABELS_VI[level]}
      {exam && <small> · ≈ {exam.name} {exam.levels[level]}</small>}
    </span>
  );
}

export function SkillBars({ averages }: { averages: Record<Skill, number | null> }) {
  return (
    <div className="skill-bars">
      {(Object.keys(SKILL_LABELS) as Skill[]).map((skill) => {
        const value = averages[skill];
        return (
          <div key={skill} className="skill-bar">
            <span>
              {SKILL_LABELS[skill].icon} {SKILL_LABELS[skill].vi}
            </span>
            <div className="bar">
              <div className="fill" style={{ width: `${value ?? 0}%` }} />
            </div>
            <span className="muted">{value ?? '–'}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ListenButton({ text, locale, label = 'Nghe' }: { text: string; locale: string; label?: string }) {
  return (
    <button type="button" className="btn ghost" onClick={() => speak(text, locale)}>
      🔊 {label}
    </button>
  );
}

/** Nút ghi âm: bấm để nói, bấm lần nữa để dừng. Bản ghi đẩy ra qua onTranscript. */
export function MicButton({ locale, onTranscript }: { locale: string; onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string>();
  const listener = useRef<Listener>(undefined);

  if (!canRecognizeSpeech()) {
    return <p className="muted small">Trình duyệt này chưa hỗ trợ nhận giọng nói, hãy gõ câu trả lời (hoặc dùng Chrome/Edge/Safari).</p>;
  }

  function toggle() {
    if (recording) {
      listener.current?.stop();
      return;
    }
    setError(undefined);
    listener.current = listen(locale, onTranscript, (err) => {
      setRecording(false);
      setError(err);
    });
    setRecording(true);
  }

  return (
    <span className="mic">
      <button type="button" className={`btn ${recording ? 'danger' : 'primary'}`} onClick={toggle}>
        {recording ? '⏹ Dừng' : '🎙️ Nói'}
      </button>
      {error && <span className="error small">{error}</span>}
    </span>
  );
}

export function GradeCard({ result }: { result: GradeResult }) {
  return (
    <div className="card grade">
      <div className="grade-head">
        <div className="score">{result.score}</div>
        <div>
          <div className="muted small">Trình độ thể hiện trong bài</div>
          <strong>{result.estimatedLevel}</strong>
        </div>
      </div>
      <p>{result.summary}</p>
      {result.strengths.length > 0 && (
        <>
          <h4>Điểm tốt</h4>
          <ul>
            {result.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {result.corrections.length > 0 && (
        <>
          <h4>Cần sửa</h4>
          <ul className="corrections">
            {result.corrections.map((c, i) => (
              <li key={i}>
                <s>{c.original}</s> → <strong>{c.corrected}</strong>
                <div className="muted small">{c.explanation}</div>
              </li>
            ))}
          </ul>
        </>
      )}
      <h4>Phiên bản tốt hơn</h4>
      <p className="improved">{result.improvedVersion}</p>
      <p className="next">👉 {result.nextStep}</p>
    </div>
  );
}
