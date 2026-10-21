import { ITEM_COUNT, QUESTIONS } from '../../src/domain/questionnaire';
import { DIMENSIONS, type AnswerMap, type AnswerValue, type Dimension, type ScoreSummary } from '../../src/domain/types';

/** Fixture tổng hợp chỉ dùng cho kiểm thử: gán cùng một giá trị cho mọi câu của từng nhóm (gồm cả L/T đã gộp). */
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

/** ScoreSummary trực tiếp từ điểm (để kiểm tra ranh giới diễn giải). */
export function summaryFromScores(scores: Record<Dimension, number>): ScoreSummary {
  const dimensions = Object.fromEntries(
    DIMENSIONS.map((d) => [
      d,
      { dimension: d, n: ITEM_COUNT[d], itemCount: ITEM_COUNT[d], total: 0, mean: scores[d] / 25 + 1, score: scores[d] },
    ]),
  ) as ScoreSummary['dimensions'];
  return { dimensions, nDisc: QUESTIONS.length, discCount: QUESTIONS.length };
}
