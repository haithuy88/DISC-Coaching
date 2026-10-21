import { describe, expect, it } from 'vitest';
import {
  CONTEXT_QUESTIONS,
  DISC_QUESTIONS,
  PAGE_COUNT,
  QUESTIONNAIRE_VERSION,
  QUESTIONS,
  QUESTIONS_PER_PAGE,
  QUESTION_IDS,
  ITEM_COUNT,
} from '../../src/domain/questionnaire';
import { scoreAnswers } from '../../src/domain/scoring';
import { allDiscAnswersIdentical, formatScore, interpret } from '../../src/domain/interpretation';
import { headline, preliminarySummary, selectEvidence } from '../../src/domain/narrative';
import { DIMENSIONS, type AnswerMap } from '../../src/domain/types';
import { allAnswers, answersByDimension, summaryFromScores } from './helpers';

const evaluate = (answers: AnswerMap) => {
  const summary = scoreAnswers(answers);
  return { summary, interpretation: interpret(summary, { allIdentical: allDiscAnswersIdentical(answers) }) };
};
const scoresOf = (answers: AnswerMap) => DIMENSIONS.map((d) => scoreAnswers(answers).dimensions[d].score);

describe('bộ 30 câu', () => {
  it('đúng 30 ID duy nhất, cả 30 câu đều có điểm: D 8, I 6, S 8, C 8', () => {
    expect(QUESTIONNAIRE_VERSION).toBe('lamson-disc-30-vi-3.1.0');
    expect(QUESTIONS).toHaveLength(30);
    expect(new Set(QUESTION_IDS).size).toBe(30);
    expect(DISC_QUESTIONS).toHaveLength(30);
    expect(ITEM_COUNT).toEqual({ D: 8, I: 6, S: 8, C: 8 });
    for (const d of DIMENSIONS) expect(DISC_QUESTIONS.filter((q) => q.dimension === d)).toHaveLength(ITEM_COUNT[d]);
    expect(CONTEXT_QUESTIONS.map((q) => `${q.id}:${q.dimension}`)).toEqual(['L1:D', 'L2:S', 'L3:C', 'T1:D', 'T2:S', 'T3:C']);
  });

  it('8 trang, 4 câu/trang, trang cuối 2 câu', () => {
    expect(QUESTIONS_PER_PAGE).toBe(4);
    expect(PAGE_COUNT).toBe(8);
    expect(QUESTIONS.slice(7 * 4)).toHaveLength(2);
  });
});

describe('chấm điểm', () => {
  it('tất cả 1 → 0, tất cả 3 → 50, tất cả 5 → 100; đều flat và complete', () => {
    for (const [v, s] of [
      [1, 0],
      [3, 50],
      [5, 100],
    ] as const) {
      expect(scoresOf(allAnswers(v))).toEqual([s, s, s, s]);
      const { interpretation } = evaluate(allAnswers(v));
      expect(interpretation.pattern).toBe('flat');
      expect(interpretation.dataStatus).toBe('complete');
    }
  });

  it('bốn điểm không bị ép cộng thành 100', () => {
    expect(scoresOf(allAnswers(5)).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)).toBe(400);
  });

  it('câu L/T được tính vào nhóm đã gộp', () => {
    const base = answersByDimension({ D: 2, I: 3, S: 4, C: 1 });
    const boosted = { ...base, L1: 5 as const, T1: 5 as const };
    expect(scoreAnswers(boosted).dimensions.D.score).toBeGreaterThan(scoreAnswers(base).dimensions.D.score!);
    expect(scoreAnswers(boosted).dimensions.S.score).toBe(scoreAnswers(base).dimensions.S.score);
  });

  it('N/A ở 6 câu L/T: D, S, C còn 6/8 → partial, vẫn kết luận', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 1, S: 1, C: 1 }, ['L1', 'L2', 'L3', 'T1', 'T2', 'T3']));
    expect(r.summary.nDisc).toBe(24);
    expect(r.interpretation.dataStatus).toBe('partial');
    expect(r.interpretation.pattern).toBe('clearer');
  });

  it('D=5, nhóm khác=1 → clearer D', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 1, S: 1, C: 1 }));
    expect(r.interpretation.pattern).toBe('clearer');
    expect(r.interpretation.candidates).toEqual(['D']);
  });

  it('D=I=5 → close_pair đồng hạng; I=C=5 không ưu tiên D', () => {
    const a = evaluate(answersByDimension({ D: 5, I: 5, S: 1, C: 1 })).interpretation;
    expect(a.pattern).toBe('close_pair');
    expect(a.topTied).toEqual(['D', 'I']);
    const b = evaluate(answersByDimension({ D: 1, I: 5, S: 1, C: 5 })).interpretation;
    expect(b.candidates).toEqual(['I', 'C']);
  });

  it('D=I=S=5, C=1 → multiple', () => {
    expect(evaluate(answersByDimension({ D: 5, I: 5, S: 5, C: 1 })).interpretation.pattern).toBe('multiple');
  });

  it('đúng ngưỡng 6/8, 5/6 (tổng 23 < 24) → insufficient vì thiếu tổng', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, ['D1', 'D2', 'I1', 'S1', 'S2', 'C1', 'C2']));
    expect(r.summary.nDisc).toBe(23);
    expect(r.interpretation.dataStatus).toBe('insufficient');
    expect(r.interpretation.missingDimensions).toEqual([]);
  });

  it('mỗi nhóm đủ ngưỡng và tổng 24 → partial, đủ để kết luận', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, ['D1', 'I1', 'S1', 'S2', 'C1', 'C2']));
    expect(r.summary.nDisc).toBe(24);
    expect(r.interpretation.dataStatus).toBe('partial');
    expect(r.interpretation.pattern).toBe('clearer');
  });

  it('nhóm I chỉ 4/6 → insufficient dù tổng ≥ 24', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, ['I1', 'I2']));
    expect(r.summary.nDisc).toBe(28);
    expect(r.interpretation.dataStatus).toBe('insufficient');
    expect(r.interpretation.missingDimensions).toEqual(['I']);
    expect(r.interpretation.candidates).toEqual([]);
  });

  it('nhóm D chỉ 5/8 → insufficient', () => {
    const r = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, ['D1', 'D2', 'L1']));
    expect(r.interpretation.missingDimensions).toEqual(['D']);
  });

  it('N/A không thành 3 và không tính vào n', () => {
    const answers = answersByDimension({ D: 5, I: 1, S: 1, C: 1 });
    answers.D1 = null;
    const r = evaluate(answers);
    expect(r.summary.dimensions.D.n).toBe(7);
    expect(r.summary.dimensions.D.score).toBe(100);
    expect(r.interpretation.dataStatus).toBe('partial');
  });

  it('0 câu → điểm null, không NaN, insufficient', () => {
    const r = evaluate({});
    for (const d of DIMENSIONS) expect(r.summary.dimensions[d].score).toBeNull();
    expect(JSON.stringify(r.summary)).not.toContain('NaN');
    expect(r.interpretation.pattern).toBe('insufficient');
  });

  it('giá trị không hợp lệ trong map bị từ chối', () => {
    expect(() => scoreAnswers({ D1: 3.5 as never })).toThrow();
    expect(() => scoreAnswers({ D1: '4' as never })).toThrow();
  });
});

describe('ranh giới diễn giải', () => {
  it('D75/I65/S50/C25: I ở biên 10 vẫn là ứng viên; 64,99 thì bị loại', () => {
    expect(interpret(summaryFromScores({ D: 75, I: 65, S: 50, C: 25 })).candidates).toEqual(['D', 'I']);
    expect(interpret(summaryFromScores({ D: 75, I: 64.99, S: 50, C: 25 })).candidates).toEqual(['D']);
  });

  it('range = 10 → flat; hơn 10 một chút → không flat', () => {
    expect(interpret(summaryFromScores({ D: 60, I: 50, S: 55, C: 52 })).pattern).toBe('flat');
    expect(interpret(summaryFromScores({ D: 60.01, I: 50, S: 55, C: 52 })).pattern).not.toBe('flat');
  });

  it('làm tròn hiển thị không tạo hay loại đồng hạng/ứng viên', () => {
    const r = interpret(summaryFromScores({ D: 62.52, I: 62.48, S: 20, C: 20 }));
    expect(formatScore(62.52)).toBe(formatScore(62.48));
    expect(r.topTied).toEqual(['D']);
    expect(interpret(summaryFromScores({ D: 75.04, I: 65, S: 20, C: 20 })).candidates).toEqual(['D']);
    expect(interpret(summaryFromScores({ D: 74.96, I: 65, S: 20, C: 20 })).candidates).toEqual(['D', 'I']);
  });

  it('chịu được sai số dấu phẩy động ở biên', () => {
    const r = interpret(summaryFromScores({ D: 75 + (0.1 + 0.2 - 0.3), I: 65, S: 50, C: 25 }));
    expect(r.candidates).toEqual(['D', 'I']);
  });

  it('định dạng 1 chữ số thập phân kiểu Việt Nam', () => {
    expect(formatScore((25 * 13) / 5)).toBe('65');
    expect(formatScore(68.75)).toBe('68,8');
    expect(formatScore(null)).toBe('—');
  });
});

describe('nhận xét và minh chứng', () => {
  it('30 câu giống nhau → mời rà soát', () => {
    const a = answersByDimension({ D: 4, I: 4, S: 4, C: 4 });
    expect(evaluate(a).interpretation.reviewSuggested).toBe(true);
    expect(evaluate(answersByDimension({ D: 4, I: 3, S: 4, C: 4 })).interpretation.reviewSuggested).toBe(false);
  });

  it('tối đa 2 minh chứng từ câu 4–5, sắp điểm rồi ID', () => {
    const a = answersByDimension({ D: 3, I: 3, S: 3, C: 3 });
    Object.assign(a, { S5: 5, D4: 5, C2: 4, L1: 4 });
    expect(selectEvidence(a).map((e) => e.id)).toEqual(['D4', 'S5']);
    expect(selectEvidence(answersByDimension({ D: 2, I: 2, S: 2, C: 2 }))).toEqual([]);
  });

  it('nhận xét bắt đầu "Trong các câu trả lời này" và không có từ ngữ cấm', () => {
    const r = evaluate(answersByDimension({ D: 1, I: 5, S: 1, C: 5 }));
    const text = preliminarySummary(r.summary, r.interpretation);
    expect(headline(r.interpretation)).toBe('Hai xu hướng gần nhau: I và C');
    expect(text.startsWith('Trong các câu trả lời này')).toBe(true);
    expect(text).toContain('với điểm bằng nhau');
    expect(text).not.toMatch(/%|percentile|chắc chắn|tin cậy|coach/i);
  });
});
