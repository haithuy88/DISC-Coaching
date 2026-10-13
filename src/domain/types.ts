export const DIMENSIONS = ['D', 'I', 'S', 'C'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** 1–5 là điểm; null là N/A (chưa có trải nghiệm). Không có giá trị mặc định. */
export type ScoredValue = 1 | 2 | 3 | 4 | 5;
export type AnswerValue = ScoredValue | null;

/** Câu chưa trả lời không có khóa trong map; N/A có giá trị null. */
export type AnswerMap = Partial<Record<string, AnswerValue>>;

export interface Question {
  id: string;
  /** null với 6 câu bổ sung (leadership / làm việc nhóm) */
  dimension: Dimension | null;
  section: string;
  /** chỉ 24 câu DISC được chấm */
  scored: boolean;
  text: string;
}

export interface ScoringRules {
  itemsPerDimension: number;
  minAnsweredPerDimension: number;
  minAnsweredDiscTotal: number;
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
  /** số câu DISC có điểm */
  nDisc: number;
  discCount: number;
}

/** complete: 24/24 câu DISC có điểm; partial: 20–23 và đủ từng nhóm; insufficient: còn lại. */
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
