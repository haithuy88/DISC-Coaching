// Tiến độ người học, lưu trong trình duyệt. Khi có tài khoản, thay load/save bằng API
// mà không phải sửa các hàm thuần bên dưới.
import { SKILLS, type Level, type Skill } from '../../shared/api';
import type { Course } from '../content/types';
import { nextLevel } from './levels';

export interface ActivityResult {
  skill: Skill;
  /** Điểm cao nhất đạt được, 0–100. */
  score: number;
  at: string;
}

export interface LearnerProfile {
  language: string;
  level: Level;
  placement?: { at: string; objectiveLevel?: Level; writingLevel?: Level };
  results: Record<string, ActivityResult>;
  conversations: number;
  xp: number;
}

export interface ProgressState {
  activeLanguage?: string;
  profiles: Record<string, LearnerProfile>;
}

const STORAGE_KEY = 'polyglot-progress-v1';

export function newProfile(language: string, level: Level): LearnerProfile {
  return { language, level, results: {}, conversations: 0, xp: 0 };
}

/** Ghi kết quả một hoạt động; giữ điểm cao nhất, XP chỉ cộng phần vượt điểm cũ. */
export function recordResult(profile: LearnerProfile, activityId: string, skill: Skill, score: number, now = new Date()): LearnerProfile {
  const previous = profile.results[activityId]?.score ?? 0;
  const best = Math.max(previous, score);
  return {
    ...profile,
    xp: profile.xp + Math.round((best - previous) / 10),
    results: { ...profile.results, [activityId]: { skill, score: best, at: now.toISOString() } },
  };
}

export function recordConversation(profile: LearnerProfile, score: number): LearnerProfile {
  return { ...profile, conversations: profile.conversations + 1, xp: profile.xp + 5 + Math.round(score / 20) };
}

/** Điểm trung bình từng kỹ năng; null nếu chưa làm bài nào của kỹ năng đó. */
export function skillAverages(profile: LearnerProfile): Record<Skill, number | null> {
  const sums = Object.fromEntries(SKILLS.map((s) => [s, { total: 0, n: 0 }])) as Record<Skill, { total: number; n: number }>;
  for (const r of Object.values(profile.results)) {
    sums[r.skill].total += r.score;
    sums[r.skill].n += 1;
  }
  return Object.fromEntries(
    SKILLS.map((s) => [s, sums[s].n ? Math.round(sums[s].total / sums[s].n) : null]),
  ) as Record<Skill, number | null>;
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
    bySkill.set(r.skill, [...(bySkill.get(r.skill) ?? []), r.score]);
  }
  for (const scores of bySkill.values()) {
    if (scores.reduce((x, y) => x + y, 0) / scores.length < 70) return undefined;
  }
  return next;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProgressState;
  } catch {
    // Chế độ ẩn danh hoặc dữ liệu hỏng: bắt đầu lại.
  }
  return { profiles: {} };
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Không lưu được thì vẫn dùng tiếp trong phiên hiện tại.
  }
}
