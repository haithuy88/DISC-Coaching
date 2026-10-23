import type { Level } from '../../shared/api';
import { SCENARIO_LIBRARY, TRACKS } from '../content/tracks';
import type { Course, Track, TrackId, Unit } from '../content/types';
import { atLeast, levelIndex } from './levels';

export interface TrackStatus {
  track: Track;
  unlocked: boolean;
  /** Số unit soạn sẵn đã mở ở chuyên ngành này. */
  unitCount: number;
}

/**
 * Chuyên ngành mở theo level. Chuyên ngành đã mở và có bài soạn sẵn đứng trước,
 * chuyên ngành còn khoá đứng cuối, sắp theo level cần đạt.
 */
export function tracksForLevel(level: Level, course: Course | undefined): TrackStatus[] {
  return TRACKS.map((track) => ({
    track,
    unlocked: atLeast(level, track.minLevel),
    unitCount: course ? unitsFor(course, level, track.id).length : 0,
  })).sort(
    (a, b) =>
      Number(b.unlocked) - Number(a.unlocked) ||
      Number(b.unitCount > 0) - Number(a.unitCount > 0) ||
      levelIndex(a.track.minLevel) - levelIndex(b.track.minLevel),
  );
}

/** Unit của một chuyên ngành từ A1 đến level hiện tại, level cao (sát trình độ) lên trước. */
export function unitsFor(course: Course, level: Level, track: TrackId): Unit[] {
  return course.units
    .filter((u) => u.track === track && atLeast(level, u.level))
    .sort((a, b) => levelIndex(b.level) - levelIndex(a.level));
}

/** Tình huống hội thoại tự do phù hợp level, gần level hiện tại lên trước. */
export function scenariosFor(level: Level, track: TrackId) {
  return SCENARIO_LIBRARY[track]
    .filter((s) => atLeast(level, s.minLevel))
    .sort((a, b) => levelIndex(b.minLevel) - levelIndex(a.minLevel));
}
