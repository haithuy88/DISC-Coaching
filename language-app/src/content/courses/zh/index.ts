// Giáo trình tiếng Hoa (giản thể, pinyin có dấu thanh). Level CEFR quy đổi gần đúng sang HSK.
import type { Course } from '../../types';
import { ZH_A1 } from './a1';
import { ZH_A2 } from './a2';
import { ZH_B1 } from './b1';

export const ZH_COURSE: Course = { language: 'zh', units: [...ZH_A1, ...ZH_A2, ...ZH_B1] };
