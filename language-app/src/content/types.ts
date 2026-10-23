import type { Level, Scenario, Skill } from '../../shared/api';

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

/** Một câu/cụm từ ở ngôn ngữ đích, kèm phiên âm (pinyin…) và nghĩa tiếng Việt. */
export interface Phrase {
  text: string;
  /** Phiên âm: pinyin cho tiếng Hoa, romaji/hiragana cho tiếng Nhật… */
  reading?: string;
  meaningVi: string;
}

export interface VocabItem {
  term: string;
  reading?: string;
  meaningVi: string;
  example?: string;
}

/** Mẹo ngữ pháp ngắn, học ngay trong ngữ cảnh bài. */
export interface GrammarNote {
  titleVi: string;
  pointsVi: string[];
  examples: Phrase[];
}

export type Activity =
  | {
      id: string;
      kind: 'listening';
      titleVi: string;
      script: string;
      /** Phiên âm của lời thoại (hiện khi bật pinyin). */
      reading?: string;
      translationVi?: string;
      questions: Mcq[];
    }
  | { id: string; kind: 'reading'; titleVi: string; passage: string; reading?: string; translationVi?: string; questions: Mcq[] }
  /** Nghe câu mẫu rồi nói lại; app tự so khớp bản ghi, không tốn lượt AI. */
  | { id: string; kind: 'shadowing'; titleVi: string; sentences: Phrase[] }
  | { id: string; kind: 'speaking'; titleVi: string; prompt: string; hintVi: string; criteria: string[] }
  /** minLength tính theo từ, riêng tiếng Hoa/Nhật tính theo chữ. */
  | { id: string; kind: 'writing'; titleVi: string; prompt: string; hintVi: string; minLength: number; criteria: string[] };

export type ActivityKind = Activity['kind'];

export const SKILL_OF: Record<ActivityKind, Skill> = {
  listening: 'listening',
  reading: 'reading',
  shadowing: 'speaking',
  speaking: 'speaking',
  writing: 'writing',
};

export interface Lesson {
  id: string;
  title: string;
  titleVi: string;
  objectivesVi: string[];
  vocabulary: VocabItem[];
  grammar?: GrammarNote;
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
