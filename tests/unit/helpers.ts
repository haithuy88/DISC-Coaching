import { QUESTIONS } from '../../src/domain/questionnaire';
import { DIMENSIONS, type AnswerMap, type AnswerValue, type Dimension, type ScoreSummary } from '../../src/domain/types';

/** Fixture tổng hợp chỉ dùng cho kiểm thử. `context` là giá trị cho 6 câu L/T. */
export function answersByDimension(
  values: Partial<Record<Dimension, AnswerValue>>,
  skip: string[] = [],
  context: AnswerValue = 3,
): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) {
    if (skip.includes(q.id)) continue;
    const v = q.dimension ? values[q.dimension] : context;
    if (v !== undefined) answers[q.id] = v;
  }
  return answers;
}

export function allAnswers(value: AnswerValue): AnswerMap {
  return answersByDimension({ D: value, I: value, S: value, C: value }, [], value);
}

/** ScoreSummary trực tiếp từ điểm (để kiểm tra ranh giới diễn giải). */
export function summaryFromScores(scores: Record<Dimension, number>, n = 6): ScoreSummary {
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d) => [d, { dimension: d, n, itemCount: 6, total: 0, mean: scores[d] / 25 + 1, score: scores[d] }]),
  ) as ScoreSummary['dimensions'];
  return { dimensions, nDisc: n * 4, discCount: 24 };
}
