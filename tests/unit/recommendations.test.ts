import { describe, expect, it } from 'vitest';
import { getQuestion } from '../../src/domain/questionnaire';
import { scoreAnswers } from '../../src/domain/scoring';
import { interpret } from '../../src/domain/interpretation';
import { buildSuggestions, selectEvidence } from '../../src/domain/recommendations';
import type { AnswerMap } from '../../src/domain/types';
import { allAnswers, answersByDimension } from './helpers';

const suggest = (answers: AnswerMap) => buildSuggestions(answers, interpret(scoreAnswers(answers)));

describe('bằng chứng từ đáp án', () => {
  it('không có câu 4–5 → không có bằng chứng, không bịa', () => {
    const answers = answersByDimension({ D: 3, I: 2, S: 1, C: 3 });
    expect(selectEvidence(answers)).toEqual([]);
    expect(suggest(answers).evidence).toEqual([]);
  });

  it('đủ 3: sắp điểm giảm dần rồi ID theo bảng chữ cái', () => {
    const answers = answersByDimension({ D: 3, I: 3, S: 3, C: 3 });
    Object.assign(answers, { S5: 5, D4: 5, C2: 4, I1: 4, D7: 4 });
    const ev = selectEvidence(answers);
    expect(ev.map((e) => e.questionId)).toEqual(['D4', 'S5', 'C2']);
    expect(ev.map((e) => e.value)).toEqual([5, 5, 4]);
  });

  it('ít hơn 3 câu ≥ 4 → chỉ trả về số câu có thật', () => {
    const answers = answersByDimension({ D: 2, I: 2, S: 2, C: 2 });
    answers.I6 = 4;
    const ev = selectEvidence(answers);
    expect(ev).toHaveLength(1);
    expect(ev[0]?.questionId).toBe('I6');
  });

  it('mỗi gợi ý có evidenceIds, giá trị, phát biểu và action đúng nguồn JSON', () => {
    const answers = answersByDimension({ D: 5, I: 1, S: 1, C: 1 });
    const { evidence } = suggest(answers);
    expect(evidence).toHaveLength(3);
    for (const e of evidence) {
      const q = getQuestion(e.questionId)!;
      expect(e.evidenceIds).toEqual([q.id]);
      expect(e.text).toBe(q.text);
      expect(e.action).toBe(q.action);
      expect(answers[q.id]).toBe(e.value);
      expect(e.value).toBeGreaterThanOrEqual(4);
    }
    expect(evidence.map((e) => e.questionId)).toEqual(['D1', 'D2', 'D3']);
  });

  it('N/A không bao giờ thành bằng chứng', () => {
    const answers = answersByDimension({ D: null, I: 2, S: 2, C: 2 });
    expect(selectEvidence(answers)).toEqual([]);
  });

  it('insufficient → không có gợi ý, giả thuyết hay mục tiêu', () => {
    const s = suggest({ D1: 5, I1: 5 });
    expect(s).toEqual({ evidence: [], hypotheses: [], pairExercise: null, practiceItems: [], goalOptions: [] });
  });
});

describe('giả thuyết theo nhóm', () => {
  it('clearer → một giả thuyết, sourceIds là các câu đã chấm của nhóm', () => {
    const answers = answersByDimension({ D: 5, I: 1, S: 1, C: 1 });
    answers.D8 = null;
    const s = suggest(answers);
    expect(s.hypotheses.map((h) => h.dimension)).toEqual(['D']);
    expect(s.hypotheses[0]?.sourceIds).toEqual(['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']);
    expect(s.hypotheses[0]?.strength).toMatch(/^Có thể/);
    expect(s.hypotheses[0]?.risk).toMatch(/^Nếu/);
    expect(s.pairExercise).toBeNull();
  });

  it('close_pair → bài tập cặp theo thứ tự D/I/S/C và sourceIds từ hai nhóm', () => {
    const s = suggest(answersByDimension({ D: 1, I: 5, S: 1, C: 5 }));
    expect(s.pairExercise?.pair).toEqual(['I', 'C']);
    expect(s.pairExercise?.text).toContain('phát ý tưởng');
    expect(s.pairExercise?.sourceIds).toHaveLength(16);
    expect(s.hypotheses.map((h) => h.dimension)).toEqual(['I', 'C']);
  });

  it('multiple và flat → không giả thuyết nhóm, ưu tiên câu trả lời', () => {
    const multi = suggest(answersByDimension({ D: 5, I: 5, S: 5, C: 1 }));
    expect(multi.hypotheses).toEqual([]);
    expect(multi.evidence).toHaveLength(3);
    const flat = suggest(allAnswers(4));
    expect(flat.hypotheses).toEqual([]);
    expect(flat.pairExercise).toBeNull();
    expect(flat.evidence.map((e) => e.questionId)).toEqual(['C1', 'C2', 'C3']);
  });

  it('mục tiêu: mỗi lựa chọn có sourceIds không rỗng', () => {
    const s = suggest(answersByDimension({ D: 5, I: 5, S: 1, C: 2 }));
    expect(s.goalOptions.length).toBeGreaterThan(0);
    for (const g of s.goalOptions) expect(g.sourceIds.length).toBeGreaterThan(0);
    expect(s.goalOptions.some((g) => g.kind === 'practice')).toBe(true);
  });
});
