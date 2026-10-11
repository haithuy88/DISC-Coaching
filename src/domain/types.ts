export const DIMENSIONS = ['D', 'I', 'S', 'C'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** 1–5 là điểm; null là N/A (chưa có trải nghiệm). Không có giá trị mặc định. */
export type ScoredValue = 1 | 2 | 3 | 4 | 5;
export type AnswerValue = ScoredValue | null;

/** Câu chưa trả lời không có khóa trong map; N/A có giá trị null. */
export type AnswerMap = Partial<Record<string, AnswerValue>>;

export interface Question {
  id: string;
  dimension: Dimension;
  text: string;
  tag: string;
  action: string;
  reverse: false;
}

export interface Profile {
  name: string;
  strength: string;
  risk: string;
  need: string;
  question: string;
  action: string;
}

export interface ScoringRules {
  minAnsweredPerDimension: number;
  minAnsweredTotal: number;
  closeDelta: number;
  flatRange: number;
  tieDelta: number;
}

export interface DimensionScore {
  dimension: Dimension;
  /** số câu đã chấm 1–5 (không tính N/A) */
  n: number;
  /** số câu của nhóm trong bộ câu hỏi */
  itemCount: number;
  total: number;
  /** null khi n = 0 (không chia cho 0) */
  mean: number | null;
  /** 25 × (mean − 1), độ chính xác đầy đủ; null khi n = 0 */
  score: number | null;
}

export interface ScoreSummary {
  dimensions: Record<Dimension, DimensionScore>;
  answered: number;
  naCount: number;
  unanswered: number;
  questionCount: number;
}

export type InterpretationStatus = 'insufficient' | 'flat' | 'clearer' | 'close_pair' | 'multiple';

export interface Interpretation {
  status: InterpretationStatus;
  /** đủ điều kiện nhưng chưa trả lời đủ toàn bộ câu: kết quả tạm thời */
  partial: boolean;
  /** các nhóm cách điểm cao nhất ≤ closeDelta (rỗng khi insufficient hoặc flat) */
  candidates: Dimension[];
  /** các nhóm bằng điểm cao nhất (trong candidates) */
  topTied: Dimension[];
  range: number | null;
  reviewSuggested: boolean;
  /** các nhóm chưa đủ số câu tối thiểu */
  missingDimensions: Dimension[];
}
