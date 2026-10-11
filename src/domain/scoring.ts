import { QUESTIONS } from './questionnaire';
import { DIMENSIONS, type AnswerMap, type Dimension, type DimensionScore, type Question, type ScoreSummary } from './types';
import { isAnswerValue } from './answers';

export function hasAnswer(answers: AnswerMap, id: string): boolean {
  return Object.prototype.hasOwnProperty.call(answers, id);
}

/**
 * Chấm điểm từng nhóm: n = số câu đã chấm 1–5, mean = total / n, score = 25 × (mean − 1).
 * N/A (null) không được tính và không bị thay bằng 3. Không đảo điểm.
 * n = 0 → mean và score là null (không chia cho 0).
 * Đầu vào phải đã được kiểm tra; giá trị không hợp lệ sẽ gây lỗi thay vì bị bỏ qua âm thầm.
 */
export function scoreAnswers(answers: AnswerMap, questions: readonly Question[] = QUESTIONS): ScoreSummary {
  const acc = Object.fromEntries(
    DIMENSIONS.map((d) => [d, { n: 0, total: 0, itemCount: 0 }]),
  ) as Record<Dimension, { n: number; total: number; itemCount: number }>;
  let answered = 0;
  let naCount = 0;
  let unanswered = 0;

  for (const q of questions) {
    const bucket = acc[q.dimension];
    bucket.itemCount += 1;
    if (!hasAnswer(answers, q.id)) {
      unanswered += 1;
      continue;
    }
    const value = answers[q.id];
    if (!isAnswerValue(value)) throw new Error(`Giá trị không hợp lệ cho ${q.id}`);
    if (value === null) {
      naCount += 1;
      continue;
    }
    bucket.n += 1;
    bucket.total += value;
    answered += 1;
  }

  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d): [Dimension, DimensionScore] => {
      const { n, total, itemCount } = acc[d];
      const mean = n === 0 ? null : total / n;
      // 25 × (total − n) / n: một phép chia duy nhất để giảm sai số làm tròn.
      const score = n === 0 ? null : (25 * (total - n)) / n;
      return [d, { dimension: d, n, itemCount, total, mean, score }];
    }),
  ) as Record<Dimension, DimensionScore>;

  return { dimensions, answered, naCount, unanswered, questionCount: questions.length };
}
