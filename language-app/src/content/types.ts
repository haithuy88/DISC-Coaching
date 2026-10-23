import type { Level, Scenario } from '../../shared/api';

export type TrackId =
  | 'general'
  | 'travel'
  | 'sales'
  | 'hospitality'
  | 'business'
  | 'purchasing'
  | 'accounting'
  | 'hr'
  | 'tech';

/** Chuyên ngành. Mỗi chuyên ngành mở từ một level tối thiểu. */
export interface Track {
  id: TrackId;
  nameVi: string;
  icon: string;
  descriptionVi: string;
  minLevel: Level;
}

export interface Mcq {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanationVi?: string;
}

export interface VocabItem {
  term: string;
  meaningVi: string;
  example?: string;
}

export type Activity =
  | { id: string; kind: 'listening'; titleVi: string; script: string; questions: Mcq[] }
  | { id: string; kind: 'reading'; titleVi: string; passage: string; questions: Mcq[] }
  | { id: string; kind: 'speaking'; titleVi: string; prompt: string; hintVi: string; criteria: string[] }
  | { id: string; kind: 'writing'; titleVi: string; prompt: string; hintVi: string; minWords: number; criteria: string[] };

export type ActivityKind = Activity['kind'];

export interface Lesson {
  id: string;
  title: string;
  titleVi: string;
  objectivesVi: string[];
  vocabulary: VocabItem[];
  activities: Activity[];
  /** Tình huống thực chiến cuối bài, sinh từ chủ đề bài học. */
  roleplay: Scenario;
}

export interface Unit {
  id: string;
  level: Level;
  track: TrackId;
  title: string;
  titleVi: string;
  lessons: Lesson[];
}

export interface Course {
  language: string;
  units: Unit[];
}

export interface PlacementQuestion extends Mcq {
  level: Level;
  /** Nếu có, câu hỏi là bài nghe: app đọc đoạn này bằng giọng máy. */
  audio?: string;
}

export interface PlacementTest {
  language: string;
  questions: PlacementQuestion[];
  /** Đề viết ngắn cuối bài test, do AI chấm để tinh chỉnh level. */
  writingTask: string;
}
