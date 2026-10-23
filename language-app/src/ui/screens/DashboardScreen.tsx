import { useState } from 'react';
import type { Scenario } from '../../../shared/api';
import type { LanguageInfo } from '../../../shared/languages';
import { getCourse } from '../../content';
import type { TrackId } from '../../content/types';
import { scenariosFor, tracksForLevel, unitsFor } from '../../domain/curriculum';
import { dueReviewKeys, levelUpReady, todayXp, type LearnerProfile } from '../../domain/progress';
import { currentStreak, skillAverages } from '../../../shared/stats';
import { DailyGoal, LevelBadge, SkillBars } from '../components';

export function DashboardScreen({
  language,
  profile,
  onOpenLesson,
  onChat,
  onReview,
  onRetest,
  onLevelUp,
  onBack,
}: {
  language: LanguageInfo;
  profile: LearnerProfile;
  onOpenLesson: (unitId: string, lessonId: string) => void;
  onChat: (scenario: Scenario) => void;
  onReview: () => void;
  onRetest: () => void;
  onLevelUp: () => void;
  onBack: () => void;
}) {
  const course = getCourse(language.code);
  const tracks = tracksForLevel(profile.level, course);
  const [trackId, setTrackId] = useState<TrackId>(tracks[0]!.track.id);
  const units = course ? unitsFor(course, profile.level, trackId) : [];
  const scenarios = scenariosFor(profile.level, trackId);
  const readyFor = levelUpReady(profile, course);
  const dueCards = dueReviewKeys(profile).length;

  return (
    <section>
      <button type="button" className="link" onClick={onBack}>
        ← Ngôn ngữ khác
      </button>
      <div className="card dash-head">
        <div>
          <h1>
            {language.flag} {language.nameVi}
          </h1>
          <LevelBadge level={profile.level} language={language} />
          <p className="muted small">
            {profile.xp} XP · {profile.conversations} cuộc hội thoại ·{' '}
            <button type="button" className="link" onClick={onRetest}>
              Test lại / đổi level
            </button>
          </p>
        </div>
        <SkillBars averages={skillAverages(profile)} />
      </div>

      <div className="today">
        <div className="card">
          <DailyGoal xp={todayXp(profile)} goal={profile.dailyGoal} streak={currentStreak(profile.daily)} />
        </div>
        <button type="button" className="card review-btn" onClick={onReview} disabled={Object.keys(profile.review).length === 0}>
          <strong>🃏 Ôn tập từ vựng</strong>
          <span className="muted small">
            {Object.keys(profile.review).length === 0 ? 'Học một bài để có thẻ ôn' : dueCards ? `${dueCards} thẻ cần ôn hôm nay` : 'Hôm nay đã ôn xong'}
          </span>
        </button>
      </div>

      {readyFor && (
        <div className="card banner">
          🎉 Bạn đã hoàn thành level {profile.level} với kết quả tốt.
          <button type="button" className="btn primary" onClick={onLevelUp}>
            Lên {readyFor}
          </button>
        </div>
      )}

      <h2>Chuyên ngành</h2>
      <div className="tracks">
        {tracks.map(({ track, unlocked, unitCount }) => (
          <button
            key={track.id}
            type="button"
            disabled={!unlocked}
            className={`card track ${trackId === track.id ? 'active' : ''}`}
            onClick={() => setTrackId(track.id)}
            title={track.descriptionVi}
          >
            <span className="icon">{track.icon}</span>
            <strong>{track.nameVi}</strong>
            <span className="muted small">
              {!unlocked ? `🔒 Mở từ ${track.minLevel}` : unitCount ? `${unitCount} unit` : 'Hội thoại AI'}
            </span>
          </button>
        ))}
      </div>

      <h2>Bài học</h2>
      {units.length === 0 ? (
        <p className="muted">
          Chưa có bài soạn sẵn cho chuyên ngành này ở level của bạn. Hãy luyện các tình huống hội thoại bên dưới — AI tự điều chỉnh theo level.
        </p>
      ) : (
        <div className="list">
          {units.map((unit) =>
            unit.lessons.map((lesson) => {
              const done = lesson.activities.filter((a) => profile.results[a.id]).length;
              return (
                <button key={lesson.id} type="button" className="card lesson-row" onClick={() => onOpenLesson(unit.id, lesson.id)}>
                  <span className="pill">{unit.level}</span>
                  <span>
                    <strong>{lesson.titleVi}</strong>
                    <span className="muted small"> · {unit.titleVi}</span>
                  </span>
                  <span className="muted small">
                    {done}/{lesson.activities.length} kỹ năng
                  </span>
                </button>
              );
            }),
          )}
        </div>
      )}

      <h2>Hội thoại thực chiến</h2>
      <div className="list">
        {scenarios.map((s) => (
          <button key={s.title} type="button" className="card lesson-row" onClick={() => onChat(s)}>
            <span className="pill">{s.minLevel}+</span>
            <span>
              <strong>{s.title}</strong>
              <span className="muted small"> · Mục tiêu: {s.goal}</span>
            </span>
            <span>💬</span>
          </button>
        ))}
      </div>
    </section>
  );
}
