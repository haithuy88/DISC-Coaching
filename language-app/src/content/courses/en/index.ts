// Giáo trình tiếng Anh: mỗi unit là một cặp (level, chuyên ngành). Thêm unit mới theo đúng khuôn trong các file level.
import type { Course } from '../../types';
import { EN_A1 } from './a1';
import { EN_A2 } from './a2';
import { EN_B1 } from './b1';
import { EN_B2 } from './b2';

export const EN_COURSE: Course = { language: 'en', units: [...EN_A1, ...EN_A2, ...EN_B1, ...EN_B2] };
