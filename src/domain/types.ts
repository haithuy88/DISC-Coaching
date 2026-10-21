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
  section: string;
  /** từ bản 3.1.0 cả 30 câu đều được chấm */
  scored: boolean;
  text: string;
}

export interface ScoringRules {
  /** tỉ lệ câu có điểm tối thiểu của mỗi nhóm (0.75 → 6/8, 5/6) */
  minAnsweredShare: number;
  /** tổng số câu có điểm tối thiểu */
  minAnsweredTotal: number;
  closeDelta: number;
  flatRange: number;
}

export interface DimensionScore {
  dimension: Dimension;
  /** số câu DISC đã chấm 1–5 (không tính N/A) */
  n: number;
  itemCount: number;
  total: number;
  /** null khi n = 0 (không chia cho 0) */
  mean: number | null;
  /** 25 × (mean − 1), độ chính xác đầy đủ; null khi n = 0 */
  score: number | null;
}

export interface ScoreSummary {
  dimensions: Record<Dimension, DimensionScore>;
  /** số câu có điểm (trên tổng số câu được chấm) */
  nDisc: number;
  discCount: number;
}

/** complete: 30/30 câu có điểm; partial: 24–29 và đủ từng nhóm; insufficient: còn lại. */
export type DataStatus = 'complete' | 'partial' | 'insufficient';
export type PatternStatus = 'insufficient' | 'flat' | 'clearer' | 'close_pair' | 'multiple';

export interface Interpretation {
  dataStatus: DataStatus;
  pattern: PatternStatus;
  /** các nhóm cách điểm cao nhất ≤ closeDelta (rỗng khi insufficient hoặc flat) */
  candidates: Dimension[];
  /** các nhóm bằng điểm cao nhất */
  topTied: Dimension[];
  range: number | null;
  /** mọi câu DISC có điểm cùng một giá trị */
  reviewSuggested: boolean;
  missingDimensions: Dimension[];
}
