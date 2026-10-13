import { QUESTIONS } from './questionnaire';
import { DIMENSIONS, type AnswerMap, type Dimension, type DimensionScore, type Question, type ScoreSummary } from './types';
import { isAnswerValue } from './answers';

export function hasAnswer(answers: AnswerMap, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(answers, id);
}

/**
 * Chấm 24 câu DISC (scored = true). 6 câu bổ sung không được cộng vào bất kỳ nhóm nào.
 * Từng nhóm: n = số câu 1–5 (N/A và câu chưa trả lời không tính, không thay bằng 3),
 * mean = total / n, score = 25 × (mean − 1). n = 0 → null.
 */
export function scoreAnswers(answers: AnswerMap, questions: readonly Question[] = QUESTIONS): ScoreSummary {
  const acc = Object.fromEntries(DIMENSIONS.map((d) => [d, { n: 0, total: 0, itemCount: 0 }])) as Record<
    Dimension,
    { n: number; total: number; itemCount: number }
  >;
  let nDisc = 0;
  let discCount = 0;

  for (const q of questions) {
    if (!q.scored || !q.dimension) continue;
    discCount += 1;
    const bucket = acc[q.dimension];
    bucket.itemCount += 1;
    if (!hasAnswer(answers, q.id)) continue;
    const value = answers[q.id];
    if (!isAnswerValue(value)) throw new Error(`Giá trị không hợp lệ cho ${q.id}`);
    if (value === null) continue;
    bucket.n += 1;
    bucket.total += value;
    nDisc += 1;
  }

  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d): [Dimension, DimensionScore] => {
      const { n, total, itemCount } = acc[d];
      return [
        d,
        { dimension: d, n, itemCount, total, mean: n === 0 ? null : total / n, score: n === 0 ? null : (25 * (total - n)) / n },
      ];
    }),
  ) as Record<Dimension, DimensionScore>;

  return { dimensions, nDisc, discCount };
}
