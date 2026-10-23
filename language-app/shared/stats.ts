// Thống kê tiến độ, dùng cả ở giao diện lẫn khi ghi báo cáo vào Sheets.
import { SKILLS, type Profile, type Skill } from './api.ts';

/** Điểm trung bình từng kỹ năng; null nếu chưa làm bài nào của kỹ năng đó. */
export function skillAverages(profile: Pick<Profile, 'results'>): Record<Skill, number | null> {
  const sums = Object.fromEntries(SKILLS.map((s) => [s, { total: 0, n: 0 }])) as Record<Skill, { total: number; n: number }>;
  for (const r of Object.values(profile.results)) {
    sums[r.skill].total += r.score;
    sums[r.skill].n += 1;
  }
  return Object.fromEntries(
    SKILLS.map((s) => [s, sums[s].n ? Math.round(sums[s].total / sums[s].n) : null]),
  ) as Record<Skill, number | null>;
}

/** Ngày dạng YYYY-MM-DD theo giờ máy người học. */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Số ngày liên tiếp có học, tính đến hôm nay. Hôm nay chưa học thì vẫn giữ chuỗi
 * tính đến hôm qua (người học còn cả ngày để giữ chuỗi).
 */
export function currentStreak(daily: Record<string, number>, today = new Date()): number {
  const day = new Date(today);
  if (!daily[dayKey(day)]) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (daily[dayKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
