// Tiến độ người học: các hàm thuần, không đụng tới lưu trữ.
import type { Level, Profile, Skill } from '../../shared/api';
import { dayKey } from '../../shared/stats';
import { SKILL_OF, type Course, type Lesson, type VocabItem } from '../content/types';
import { nextLevel } from './levels';

export type LearnerProfile = Profile;

const DAILY_HISTORY_DAYS = 30;

export function newProfile(language: string, level: Level): LearnerProfile {
  return { language, level, results: {}, review: {}, conversations: 0, xp: 0, daily: {}, dailyGoal: 30 };
}

/** Cộng XP vào tổng và vào ngày hôm nay; chỉ giữ lịch sử 30 ngày. */
export function addXp(profile: LearnerProfile, xp: number, now = new Date()): LearnerProfile {
  if (xp <= 0) return profile;
  const today = dayKey(now);
  const keep = Object.keys(profile.daily).sort().slice(-(DAILY_HISTORY_DAYS - 1)).filter((d) => d !== today);
  const daily = Object.fromEntries(keep.map((d) => [d, profile.daily[d]!]));
  daily[today] = (profile.daily[today] ?? 0) + xp;
  return { ...profile, xp: profile.xp + xp, daily };
}

export function todayXp(profile: LearnerProfile, now = new Date()): number {
  return profile.daily[dayKey(now)] ?? 0;
}

/** Ghi kết quả một hoạt động; giữ điểm cao nhất, XP chỉ cộng phần vượt điểm cũ (tối thiểu 1 XP cho mỗi lần luyện). */
export function recordResult(profile: LearnerProfile, activityId: string, skill: Skill, score: number, now = new Date()): LearnerProfile {
  const previous = profile.results[activityId]?.score ?? 0;
  const best = Math.max(previous, score);
  const updated = { ...profile, results: { ...profile.results, [activityId]: { skill, score: best, at: now.toISOString() } } };
  return addXp(updated, Math.max(1, Math.round((best - previous) / 10)), now);
}

export function recordConversation(profile: LearnerProfile, score: number, now = new Date()): LearnerProfile {
  return addXp({ ...profile, conversations: profile.conversations + 1 }, 5 + Math.round(score / 20), now);
}

/** Đã đủ điều kiện lên level: làm hết bài ở level hiện tại, mỗi kỹ năng trung bình ≥ 70. */
export function levelUpReady(profile: LearnerProfile, course: Course | undefined): Level | undefined {
  const next = nextLevel(profile.level);
  if (!course || !next) return undefined;
  const activities = course.units
    .filter((u) => u.level === profile.level)
    .flatMap((u) => u.lessons.flatMap((l) => l.activities));
  if (activities.length === 0) return undefined;
  const bySkill = new Map<Skill, number[]>();
  for (const a of activities) {
    const r = profile.results[a.id];
    if (!r) return undefined;
    const skill = SKILL_OF[a.kind];
    bySkill.set(skill, [...(bySkill.get(skill) ?? []), r.score]);
  }
  for (const scores of bySkill.values()) {
    if (scores.reduce((x, y) => x + y, 0) / scores.length < 70) return undefined;
  }
  return next;
}

// ---------- Ôn tập từ vựng: hộp Leitner ----------

/** Số ngày chờ trước lần ôn tiếp theo, theo hộp (0 = ôn ngay). */
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];

export function reviewKey(lessonId: string, term: string): string {
  return `${lessonId}|${term}`;
}

/** Đưa từ vựng của bài vào hộp ôn tập (bỏ qua từ đã có). */
export function addLessonToReview(profile: LearnerProfile, lesson: Lesson, now = new Date()): LearnerProfile {
  const missing = lesson.vocabulary.filter((v) => !profile.review[reviewKey(lesson.id, v.term)]);
  if (missing.length === 0) return profile;
  const review = { ...profile.review };
  for (const v of missing) review[reviewKey(lesson.id, v.term)] = { box: 0, due: now.toISOString() };
  return { ...profile, review };
}

export function dueReviewKeys(profile: LearnerProfile, now = new Date()): string[] {
  return Object.entries(profile.review)
    .filter(([, card]) => new Date(card.due) <= now)
    .sort(([, a], [, b]) => a.box - b.box || a.due.localeCompare(b.due))
    .map(([key]) => key);
}

/** Nhớ: lên một hộp, giãn lịch ôn. Quên: về hộp 0, ôn lại ở phiên sau. */
export function answerReview(profile: LearnerProfile, key: string, remembered: boolean, now = new Date()): LearnerProfile {
  const card = profile.review[key];
  if (!card) return profile;
  const box = remembered ? Math.min(card.box + 1, REVIEW_INTERVAL_DAYS.length - 1) : 0;
  const due = new Date(now);
  due.setDate(due.getDate() + REVIEW_INTERVAL_DAYS[box]!);
  return addXp({ ...profile, review: { ...profile.review, [key]: { box, due: due.toISOString() } } }, remembered ? 1 : 0, now);
}

export function findVocab(course: Course | undefined, key: string): VocabItem | undefined {
  const [lessonId, term] = key.split('|');
  const lesson = course?.units.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
  return lesson?.vocabulary.find((v) => v.term === term);
}

// ---------- Đồng bộ giữa các máy ----------

/**
 * Hợp nhất bản trên máy với bản trên Sheets. Lấy bản nhiều XP hơn (đã học nhiều hơn),
 * vì XP chỉ tăng; trùng XP thì ưu tiên bản trên Sheets.
 */
export function mergeProfiles(local: Record<string, LearnerProfile>, remote: Record<string, LearnerProfile>): Record<string, LearnerProfile> {
  const out = { ...remote };
  for (const [lang, p] of Object.entries(local)) {
    const r = remote[lang];
    if (!r || p.xp > r.xp) out[lang] = p;
  }
  return out;
}
