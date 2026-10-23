import { LEVELS, type Level } from '../../shared/api';

export function levelIndex(level: Level): number {
  return LEVELS.indexOf(level);
}

export function levelAt(index: number): Level {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index))]!;
}

export function atLeast(level: Level, min: Level): boolean {
  return levelIndex(level) >= levelIndex(min);
}

export function nextLevel(level: Level): Level | undefined {
  const i = levelIndex(level);
  return i < LEVELS.length - 1 ? LEVELS[i + 1] : undefined;
}
