import { DISC_QUESTIONS, RULES } from './questionnaire';
import { DIMENSIONS, type AnswerMap, type Dimension, type Interpretation, type ScoreSummary, type ScoringRules } from './types';

/** Sai số cho so sánh ranh giới trên số thực (ví dụ đúng bằng 10 điểm). */
export const EPSILON = 1e-9;
const lte = (a: number, b: number) => a <= b + EPSILON;

export interface InterpretOptions {
  rules?: ScoringRules;
  /** true khi mọi câu DISC có điểm cùng một giá trị */
  allIdentical?: boolean;
}

/** Mọi câu DISC có điểm (bỏ qua N/A và 6 câu bổ sung) cùng một giá trị. Cần ít nhất 2 câu. */
export function allDiscAnswersIdentical(answers: AnswerMap): boolean {
  const values = DISC_QUESTIONS.map((q) => answers[q.id]).filter((v): v is 1 | 2 | 3 | 4 | 5 => typeof v === 'number');
  return values.length >= 2 && values.every((v) => v === values[0]);
}

/**
 * Quy ước MVP (chưa kiểm định tâm trắc):
 * - insufficient: có nhóm n < 5 hoặc tổng câu DISC có điểm < 20.
 * - complete: đủ 24/24; partial: 20–23 và đủ từng nhóm.
 * - flat: max − min ≤ 10. Còn lại: candidates = mọi nhóm max − score ≤ 10, giữ đồng hạng.
 * So sánh trên điểm chưa làm tròn; thứ tự D/I/S/C chỉ để hiển thị.
 */
export function interpret(summary: ScoreSummary, options: InterpretOptions = {}): Interpretation {
  const rules = options.rules ?? RULES;
  const missingDimensions = DIMENSIONS.filter((d) => summary.dimensions[d].n < rules.minAnsweredPerDimension);
  const reviewSuggested = Boolean(options.allIdentical) && summary.nDisc >= rules.minAnsweredDiscTotal;

  if (missingDimensions.length > 0 || summary.nDisc < rules.minAnsweredDiscTotal) {
    return { dataStatus: 'insufficient', pattern: 'insufficient', candidates: [], topTied: [], range: null, reviewSuggested, missingDimensions };
  }
  const dataStatus = summary.nDisc >= summary.discCount ? 'complete' : 'partial';

  const scores = DIMENSIONS.map((d) => {
    const s = summary.dimensions[d].score;
    if (s === null || !Number.isFinite(s)) throw new Error(`Điểm nhóm ${d} không hợp lệ`);
    return [d, s] as const;
  });
  const values = scores.map(([, s]) => s);
  const max = Math.max(...values);
  const range = max - Math.min(...values);

  if (lte(range, rules.flatRange)) {
    return { dataStatus, pattern: 'flat', candidates: [], topTied: [], range, reviewSuggested, missingDimensions };
  }
  const candidates: Dimension[] = scores.filter(([, s]) => lte(max - s, rules.closeDelta)).map(([d]) => d);
  const topTied: Dimension[] = scores.filter(([, s]) => lte(max - s, 0)).map(([d]) => d);
  const pattern = candidates.length === 1 ? 'clearer' : candidates.length === 2 ? 'close_pair' : 'multiple';
  return { dataStatus, pattern, candidates, topTied, range, reviewSuggested, missingDimensions };
}

const VI_NUMBER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 0 });

/** Làm tròn 1 chữ số chỉ để hiển thị; không dùng kết quả này để so sánh. */
export function formatScore(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return '—';
  return VI_NUMBER.format(Math.round(score * 10) / 10);
}
