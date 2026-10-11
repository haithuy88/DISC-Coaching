import { QUESTIONS } from '../../src/domain/questionnaire';
import { DIMENSIONS, type AnswerMap, type AnswerValue, type Dimension, type ScoreSummary } from '../../src/domain/types';

/** Fixture tổng hợp chỉ dùng cho kiểm thử. */
export function answersByDimension(values: Partial<Record<Dimension, AnswerValue>>, skip: string[] = []): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) {
    if (skip.includes(q.id)) continue;
    const v = values[q.dimension];
    if (v !== undefined) answers[q.id] = v;
  }
  return answers;
}

export function allAnswers(value: AnswerValue): AnswerMap {
  return answersByDimension({ D: value, I: value, S: value, C: value });
}

/** Tạo ScoreSummary trực tiếp từ điểm (để kiểm tra ranh giới diễn giải). */
export function summaryFromScores(scores: Record<Dimension, number>, n = 8): ScoreSummary {
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d) => [
      d,
      { dimension: d, n, itemCount: 8, total: 0, mean: scores[d] / 25 + 1, score: scores[d] },
    ]),
  ) as ScoreSummary['dimensions'];
  return { dimensions, answered: n * 4, naCount: 0, unanswered: 32 - n * 4, questionCount: 32 };
}
