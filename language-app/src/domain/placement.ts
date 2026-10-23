import { LEVELS, type Level } from '../../shared/api';
import type { PlacementQuestion } from '../content/types';
import { levelAt, levelIndex } from './levels';

/** Tỉ lệ đúng tối thiểu để coi là đã vững một level. */
export const PASS_RATE = 0.6;

export interface PlacementScore {
  perLevel: Record<Level, { correct: number; total: number }>;
  level: Level;
}

/**
 * Level = level cao nhất mà nó và mọi level thấp hơn đều đạt PASS_RATE.
 * Đoán trúng vài câu khó không đẩy level lên nếu chưa vững level dưới.
 * Level không có câu hỏi nào bị bỏ qua khi xét.
 */
export function scorePlacement(questions: PlacementQuestion[], answers: Record<string, number>): PlacementScore {
  const perLevel = Object.fromEntries(LEVELS.map((l) => [l, { correct: 0, total: 0 }])) as PlacementScore['perLevel'];
  for (const q of questions) {
    const bucket = perLevel[q.level];
    bucket.total += 1;
    if (answers[q.id] === q.answer) bucket.correct += 1;
  }
  let level: Level = 'A1';
  for (const l of LEVELS) {
    const { correct, total } = perLevel[l];
    if (total === 0) continue;
    if (correct / total < PASS_RATE) break;
    level = l;
  }
  return { perLevel, level };
}

/**
 * Kết hợp phần trắc nghiệm với level AI ước lượng từ bài viết.
 * Lấy level thấp hơn (trắc nghiệm có thể đoán trúng, bài viết phản ánh khả năng dùng thật),
 * nhưng không hạ quá 1 level so với trắc nghiệm để một bài viết ngắn không kéo tụt quá nhiều.
 */
export function combinePlacement(objective: Level, writing?: Level): Level {
  if (!writing) return objective;
  const lower = Math.min(levelIndex(objective), levelIndex(writing));
  return levelAt(Math.max(lower, levelIndex(objective) - 1));
}
