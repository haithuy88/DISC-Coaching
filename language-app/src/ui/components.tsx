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

/** Vòng tròn XP hôm nay so với mục tiêu ngày. */
export function DailyGoal({ xp, goal, streak }: { xp: number; goal: number; streak: number }) {
  const pct = Math.min(100, Math.round((xp / goal) * 100));
  return (
    <div className="daily">
      <div className="ring" style={{ background: `conic-gradient(var(--success) ${pct}%, var(--line) 0)` }}>
        <span>
          {xp}/{goal}
        </span>
      </div>
      <div>
        <strong>{pct >= 100 ? 'Đạt mục tiêu hôm nay 🎉' : 'Mục tiêu hôm nay'}</strong>
        <div className="muted small">🔥 {streak} ngày liên tiếp</div>
      </div>
    </div>
  );
}

const READING_KEY = 'polyglot-show-reading';

/** Bật/tắt phiên âm (pinyin…), nhớ lựa chọn trên máy. */
export function useShowReading(): [boolean, (v: boolean) => void] {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem(READING_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  return [
    show,
    (v) => {
      setShow(v);
      try {
        localStorage.setItem(READING_KEY, v ? 'on' : 'off');
      } catch {
        // bỏ qua
      }
    },
  ];
}

export function ReadingToggle({ name, show, onChange }: { name: string; show: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="small muted toggle">
      <input type="checkbox" checked={show} onChange={(e) => onChange(e.target.checked)} /> Hiện {name}
    </label>
  );
}

/** Văn bản ngôn ngữ đích, kèm phiên âm và nghĩa nếu có. */
export function TargetText({ text, reading, meaningVi, showReading }: { text: string; reading?: string; meaningVi?: string; showReading: boolean }) {
  return (
    <span className="target">
      <span className="target-text">{text}</span>
      {showReading && reading && <span className="reading">{reading}</span>}
      {meaningVi && <span className="muted small">{meaningVi}</span>}
    </span>
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
export function MicButton({ locale, onTranscript, label = 'Nói' }: { locale: string; onTranscript: (text: string) => void; label?: string }) {
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
        {recording ? '⏹ Dừng' : `🎙️ ${label}`}
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
