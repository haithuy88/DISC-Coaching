import { useState } from 'react';
import type { LanguageInfo } from '../../../shared/languages';
import { getCourse } from '../../content';
import { dueReviewKeys, findVocab, type LearnerProfile } from '../../domain/progress';
import { speak } from '../../lib/speech';
import { ReadingToggle, useShowReading } from '../components';

const SESSION_SIZE = 20;

/** Ôn từ vựng kiểu thẻ ghi nhớ: xem từ → tự nhớ nghĩa → lật thẻ → tự chấm Nhớ / Quên. */
export function ReviewScreen({
  language,
  profile,
  onAnswer,
  onBack,
}: {
  language: LanguageInfo;
  profile: LearnerProfile;
  onAnswer: (key: string, remembered: boolean) => void;
  onBack: () => void;
}) {
  const course = getCourse(language.code);
  // Chốt danh sách thẻ lúc mở phiên, để thẻ vừa trả lời không quay lại ngay.
  const [queue] = useState(() => dueReviewKeys(profile).slice(0, SESSION_SIZE));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [showReading, setShowReading] = useShowReading();

  const key = queue[index];
  const vocab = key ? findVocab(course, key) : undefined;

  function answer(ok: boolean) {
    if (!key) return;
    onAnswer(key, ok);
    if (ok) setRemembered(remembered + 1);
    setFlipped(false);
    setIndex(index + 1);
  }

  return (
    <section className="narrow">
      <button type="button" className="link" onClick={onBack}>
        ← Tổng quan
      </button>
      <h1>Ôn tập từ vựng</h1>
      {queue.length === 0 ? (
        <div className="card">Hôm nay không có thẻ nào cần ôn. Học bài mới để thêm từ vựng nhé!</div>
      ) : !key ? (
        <div className="card center">
          <h3>Xong phiên ôn tập 🎉</h3>
          <p>
            Nhớ {remembered}/{queue.length} thẻ. Thẻ quên sẽ quay lại ở lần ôn sau; thẻ nhớ được giãn lịch dần (1, 3, 7, 14, 30 ngày).
          </p>
          <button type="button" className="btn primary" onClick={onBack}>
            Về tổng quan
          </button>
        </div>
      ) : (
        <>
          <div className="row left">
            <span className="muted small">
              Thẻ {index + 1}/{queue.length}
            </span>
            {language.readingName && <ReadingToggle name={language.readingName} show={showReading} onChange={setShowReading} />}
          </div>
          <div className="card flashcard">
            <button type="button" className="icon-btn" onClick={() => speak(vocab?.term ?? key.split('|')[1]!, language.speechLocale)}>
              🔊
            </button>
            <div className="term">{vocab?.term ?? key.split('|')[1]}</div>
            {showReading && vocab?.reading && <div className="reading">{vocab.reading}</div>}
            {flipped ? (
              <>
                <div className="meaning">{vocab?.meaningVi ?? '—'}</div>
                {vocab?.example && <div className="muted small">{vocab.example}</div>}
                <div className="row">
                  <button type="button" className="btn ghost" onClick={() => answer(false)}>
                    😕 Quên
                  </button>
                  <button type="button" className="btn primary" onClick={() => answer(true)}>
                    😀 Nhớ
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="btn primary" onClick={() => setFlipped(true)}>
                Lật thẻ
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
