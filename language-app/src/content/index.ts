// Danh mục nội dung theo ngôn ngữ. Thêm ngôn ngữ mới: tạo courses/<code>/ và placement/<code>.ts
// rồi đăng ký ở đây, sau đó bật hasCourse trong shared/languages.ts.
import type { Course, PlacementTest } from './types';
import { EN_COURSE } from './courses/en';
import { ZH_COURSE } from './courses/zh';
import { EN_PLACEMENT } from './placement/en';
import { ZH_PLACEMENT } from './placement/zh';

const COURSES: Record<string, Course> = { en: EN_COURSE, zh: ZH_COURSE };
const PLACEMENTS: Record<string, PlacementTest> = { en: EN_PLACEMENT, zh: ZH_PLACEMENT };

export function getCourse(language: string): Course | undefined {
  return COURSES[language];
}

export function getPlacementTest(language: string): PlacementTest | undefined {
  return PLACEMENTS[language];
}
