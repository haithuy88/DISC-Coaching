import { describe, expect, it } from 'vitest';
import { QUESTIONS, QUESTION_IDS } from '../../src/domain/questionnaire';
import { scoreAnswers } from '../../src/domain/scoring';
import { allScoredAnswersIdentical, formatScore, interpret } from '../../src/domain/interpretation';
import { DIMENSIONS, type AnswerMap } from '../../src/domain/types';
import { allAnswers, answersByDimension, summaryFromScores } from './helpers';

const evaluate = (answers: AnswerMap) => {
  const summary = scoreAnswers(answers);
  return { summary, interpretation: interpret(summary, { allIdentical: allScoredAnswersIdentical(answers) }) };
};
const scoresOf = (answers: AnswerMap) => {
  const { summary } = evaluate(answers);
  return DIMENSIONS.map((d) => summary.dimensions[d].score);
};

describe('bộ câu hỏi', () => {
  it('có 32 câu, 8 câu mỗi nhóm, xen kẽ D/I/S/C, không đảo điểm', () => {
    expect(QUESTIONS).toHaveLength(32);
    expect(new Set(QUESTION_IDS).size).toBe(32);
    for (const d of DIMENSIONS) expect(QUESTIONS.filter((q) => q.dimension === d)).toHaveLength(8);
    QUESTIONS.forEach((q, i) => expect(q.dimension).toBe(DIMENSIONS[i % 4]));
    expect(QUESTIONS.every((q) => q.reverse === false)).toBe(true);
  });
});

describe('chấm điểm', () => {
  it('tất cả 1 → bốn điểm 0 và flat', () => {
    const { interpretation } = evaluate(allAnswers(1));
    expect(scoresOf(allAnswers(1))).toEqual([0, 0, 0, 0]);
    expect(interpretation.status).toBe('flat');
    expect(interpretation.candidates).toEqual([]);
  });

  it('tất cả 3 → bốn điểm 50 và flat', () => {
    expect(scoresOf(allAnswers(3))).toEqual([50, 50, 50, 50]);
    expect(evaluate(allAnswers(3)).interpretation.status).toBe('flat');
  });

  it('tất cả 5 → bốn điểm 100 và flat (điểm cao đồng thời vẫn hợp lệ)', () => {
    expect(scoresOf(allAnswers(5))).toEqual([100, 100, 100, 100]);
    expect(evaluate(allAnswers(5)).interpretation.status).toBe('flat');
  });

  it('điểm bốn nhóm không bị ép cộng thành 100', () => {
    const total = scoresOf(allAnswers(5)).reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
    expect(total).toBe(400);
  });

  it('D=5, nhóm khác=1 → D100, còn lại 0, clearer', () => {
    const answers = answersByDimension({ D: 5, I: 1, S: 1, C: 1 });
    expect(scoresOf(answers)).toEqual([100, 0, 0, 0]);
    const { interpretation } = evaluate(answers);
    expect(interpretation.status).toBe('clearer');
    expect(interpretation.candidates).toEqual(['D']);
  });

  it('D=I=5, S=C=1 → close_pair với hai nhóm đồng hạng', () => {
    const { interpretation } = evaluate(answersByDimension({ D: 5, I: 5, S: 1, C: 1 }));
    expect(interpretation.status).toBe('close_pair');
    expect(interpretation.candidates).toEqual(['D', 'I']);
    expect(interpretation.topTied).toEqual(['D', 'I']);
  });

  it('đồng hạng không ưu tiên D: I=C=5 vẫn giữ cả hai, theo thứ tự hiển thị', () => {
    const { interpretation } = evaluate(answersByDimension({ D: 1, I: 5, S: 1, C: 5 }));
    expect(interpretation.status).toBe('close_pair');
    expect(interpretation.topTied).toEqual(['I', 'C']);
  });

  it('D=I=S=5, C=1 → multiple', () => {
    const { interpretation } = evaluate(answersByDimension({ D: 5, I: 5, S: 5, C: 1 }));
    expect(interpretation.status).toBe('multiple');
    expect(interpretation.candidates).toEqual(['D', 'I', 'S']);
  });

  it('n=6 mỗi nhóm → đủ dữ liệu (tổng 24, partial)', () => {
    const skip = ['D1', 'D2', 'I1', 'I2', 'S1', 'S2', 'C1', 'C2'];
    const { summary, interpretation } = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, skip));
    expect(summary.answered).toBe(24);
    expect(DIMENSIONS.map((d) => summary.dimensions[d].n)).toEqual([6, 6, 6, 6]);
    expect(interpretation.status).toBe('clearer');
    expect(interpretation.partial).toBe(true);
  });

  it('n=5 ở một nhóm → insufficient dù tổng ≥ 24', () => {
    const { summary, interpretation } = evaluate(answersByDimension({ D: 5, I: 2, S: 2, C: 2 }, ['D1', 'D2', 'D3']));
    expect(summary.answered).toBe(29);
    expect(interpretation.status).toBe('insufficient');
    expect(interpretation.missingDimensions).toEqual(['D']);
    expect(interpretation.candidates).toEqual([]);
  });

  it('n ≥ 6 mỗi nhóm nhưng tổng < 24 không thể xảy ra; tổng < 24 → insufficient', () => {
    const summary = summaryFromScores({ D: 80, I: 20, S: 20, C: 20 }, 5);
    expect(interpret(summary).status).toBe('insufficient');
  });

  it('0 câu → không NaN, điểm null, insufficient', () => {
    const { summary, interpretation } = evaluate({});
    for (const d of DIMENSIONS) {
      expect(summary.dimensions[d].n).toBe(0);
      expect(summary.dimensions[d].score).toBeNull();
      expect(summary.dimensions[d].mean).toBeNull();
    }
    expect(summary.unanswered).toBe(32);
    expect(interpretation.status).toBe('insufficient');
    expect(JSON.stringify(summary)).not.toContain('NaN');
    expect(formatScore(null)).toBe('—');
  });

  it('N/A không bị tính thành 3', () => {
    const answers = answersByDimension({ D: 5, I: 1, S: 1, C: 1 });
    answers.D1 = null;
    answers.D2 = null;
    const { summary } = evaluate(answers);
    expect(summary.dimensions.D.n).toBe(6);
    expect(summary.dimensions.D.total).toBe(30);
    expect(summary.dimensions.D.score).toBe(100);
    expect(summary.naCount).toBe(2);
    expect(summary.answered).toBe(30);
  });

  it('câu chưa trả lời không được tự điền', () => {
    const answers = answersByDimension({ D: 4, I: 4, S: 4, C: 4 }, ['C8']);
    const { summary } = evaluate(answers);
    expect(summary.unanswered).toBe(1);
    expect(summary.dimensions.C.n).toBe(7);
    expect(summary.dimensions.C.total).toBe(28);
  });

  it('từ chối giá trị không hợp lệ trong map đáp án thay vì bỏ qua', () => {
    expect(() => scoreAnswers({ D1: 3.5 as never })).toThrow();
    expect(() => scoreAnswers({ D1: '4' as never })).toThrow();
  });
});

describe('ranh giới diễn giải', () => {
  it('fixture D75, I65, S50, C25 giữ I trong candidates ở biên 10', () => {
    const r = interpret(summaryFromScores({ D: 75, I: 65, S: 50, C: 25 }));
    expect(r.status).toBe('close_pair');
    expect(r.candidates).toEqual(['D', 'I']);
    expect(r.topTied).toEqual(['D']);
  });

  it('ngoài biên 10 (I = 64,99) → I bị loại, clearer', () => {
    const r = interpret(summaryFromScores({ D: 75, I: 64.99, S: 50, C: 25 }));
    expect(r.status).toBe('clearer');
    expect(r.candidates).toEqual(['D']);
  });

  it('biên 10 chịu được sai số dấu phẩy động (0,1 + 0,2)', () => {
    const r = interpret(summaryFromScores({ D: 75 + (0.1 + 0.2 - 0.3), I: 65, S: 50, C: 25 }));
    expect(r.candidates).toEqual(['D', 'I']);
  });

  it('range = 10 → flat, không nhóm chính/phụ', () => {
    const r = interpret(summaryFromScores({ D: 60, I: 50, S: 55, C: 52 }));
    expect(r.status).toBe('flat');
    expect(r.range).toBe(10);
    expect(r.candidates).toEqual([]);
  });

  it('range > 10 một chút → không flat', () => {
    expect(interpret(summaryFromScores({ D: 60.01, I: 50, S: 55, C: 52 })).status).not.toBe('flat');
  });

  it('làm tròn hiển thị không tạo đồng hạng: 62,52 và 62,48 đều hiển thị 62,5 nhưng chỉ một nhóm là cao nhất', () => {
    const r = interpret(summaryFromScores({ D: 62.52, I: 62.48, S: 20, C: 20 }));
    expect(formatScore(62.52)).toBe(formatScore(62.48));
    expect(r.topTied).toEqual(['D']);
    expect(r.candidates).toEqual(['D', 'I']);
  });

  it('làm tròn hiển thị không loại ứng viên: khoảng cách 10,04 hiển thị như 10 nhưng vẫn bị loại; 10 đúng thì được giữ', () => {
    const out = interpret(summaryFromScores({ D: 75.04, I: 65, S: 20, C: 20 }));
    expect(formatScore(75.04)).toBe('75');
    expect(out.candidates).toEqual(['D']);
    const inside = interpret(summaryFromScores({ D: 74.96, I: 65, S: 20, C: 20 }));
    expect(formatScore(74.96)).toBe('75');
    expect(inside.candidates).toEqual(['D', 'I']);
  });

  it('điểm thật từ đáp án với n khác nhau: so sánh dùng độ chính xác đầy đủ', () => {
    // D: 7 câu, tổng 26 → 25·19/7 = 67,857…; I: 8 câu, tổng 26 → 56,25 → khoảng cách 11,6 > 10.
    const answers: AnswerMap = {};
    const dVals = [5, 4, 4, 4, 3, 3, 3];
    const iVals = [4, 4, 3, 3, 3, 3, 3, 3];
    QUESTIONS.filter((q) => q.dimension === 'D').forEach((q, i) => {
      if (i < 7) answers[q.id] = dVals[i] as 3 | 4 | 5;
    });
    QUESTIONS.filter((q) => q.dimension === 'I').forEach((q, i) => (answers[q.id] = iVals[i] as 3 | 4));
    QUESTIONS.filter((q) => q.dimension === 'S' || q.dimension === 'C').forEach((q) => (answers[q.id] = 1));
    const { summary, interpretation } = evaluate(answers);
    expect(summary.dimensions.D.score).toBeCloseTo(67.857142857, 8);
    expect(summary.dimensions.I.score).toBe(56.25);
    expect(interpretation.candidates).toEqual(['D']);
    expect(interpretation.partial).toBe(true);
  });

  it('định dạng hiển thị một chữ số thập phân kiểu Việt Nam', () => {
    expect(formatScore(67.857142857)).toBe('67,9');
    expect(formatScore(100)).toBe('100');
    expect(formatScore(0)).toBe('0');
  });
});

describe('gợi ý rà soát', () => {
  it('tất cả đáp án giống nhau → reviewSuggested', () => {
    expect(evaluate(allAnswers(4)).interpretation.reviewSuggested).toBe(true);
  });
  it('đáp án khác nhau → không gợi ý rà soát', () => {
    expect(evaluate(answersByDimension({ D: 4, I: 3, S: 4, C: 4 })).interpretation.reviewSuggested).toBe(false);
  });
  it('N/A không tính khi xét giống nhau', () => {
    const a = allAnswers(2);
    a.D1 = null;
    expect(evaluate(a).interpretation.reviewSuggested).toBe(true);
  });
});
