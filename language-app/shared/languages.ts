import type { Level } from './api.ts';

export interface LanguageInfo {
  code: string;
  /** Tên tiếng Việt hiển thị trong app. */
  nameVi: string;
  /** Tên tiếng Anh, dùng trong prompt gửi Claude. */
  nameEn: string;
  flag: string;
  /** Locale cho đọc (speechSynthesis) và nhận giọng nói (SpeechRecognition). */
  speechLocale: string;
  /** Khung chứng chỉ quen thuộc của ngôn ngữ, quy đổi từ CEFR. */
  examFramework?: { name: string; levels: Record<Level, string> };
  /** Đã có giáo trình soạn sẵn chưa. Ngôn ngữ chưa có vẫn luyện được với bot. */
  hasCourse: boolean;
  /** Có phiên âm (pinyin…) để bật/tắt trong bài học. */
  readingName?: string;
  /** Độ dài bài viết tính theo chữ (Hoa, Nhật) thay vì theo từ. */
  countsCharacters?: boolean;
}

// Quy đổi gần đúng, chỉ để người học dễ hình dung; không phải bảng quy đổi chính thức.
export const LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    nameVi: 'Tiếng Anh',
    nameEn: 'English',
    flag: '🇬🇧',
    speechLocale: 'en-US',
    examFramework: {
      name: 'IELTS',
      levels: { A1: '≤3.0', A2: '3.5–4.0', B1: '4.5–5.5', B2: '6.0–6.5', C1: '7.0–8.0', C2: '8.5–9.0' },
    },
    hasCourse: true,
  },
  {
    code: 'zh',
    nameVi: 'Tiếng Hoa',
    nameEn: 'Mandarin Chinese (Simplified)',
    flag: '🇨🇳',
    speechLocale: 'zh-CN',
    readingName: 'pinyin',
    countsCharacters: true,
    examFramework: {
      name: 'HSK',
      levels: { A1: '1–2', A2: '3', B1: '4', B2: '5', C1: '6', C2: '7–9' },
    },
    hasCourse: true,
  },
  {
    code: 'ja',
    nameVi: 'Tiếng Nhật',
    nameEn: 'Japanese',
    flag: '🇯🇵',
    speechLocale: 'ja-JP',
    readingName: 'furigana',
    countsCharacters: true,
    examFramework: {
      name: 'JLPT',
      levels: { A1: 'N5', A2: 'N4', B1: 'N3', B2: 'N2', C1: 'N1', C2: 'N1+' },
    },
    hasCourse: false,
  },
  {
    code: 'ko',
    nameVi: 'Tiếng Hàn',
    nameEn: 'Korean',
    flag: '🇰🇷',
    speechLocale: 'ko-KR',
    examFramework: {
      name: 'TOPIK',
      levels: { A1: '1', A2: '2', B1: '3', B2: '4', C1: '5', C2: '6' },
    },
    hasCourse: false,
  },
  { code: 'fr', nameVi: 'Tiếng Pháp', nameEn: 'French', flag: '🇫🇷', speechLocale: 'fr-FR', hasCourse: false },
  { code: 'de', nameVi: 'Tiếng Đức', nameEn: 'German', flag: '🇩🇪', speechLocale: 'de-DE', hasCourse: false },
];

export function findLanguage(code: string): LanguageInfo | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export const LEVEL_LABELS_VI: Record<Level, string> = {
  A1: 'Mới bắt đầu',
  A2: 'Sơ cấp',
  B1: 'Trung cấp',
  B2: 'Trung cao cấp',
  C1: 'Cao cấp',
  C2: 'Thành thạo',
};
