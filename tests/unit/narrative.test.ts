import { describe, expect, it } from 'vitest';
import { conclusion, headline } from '../../src/domain/narrative';
import { interpret } from '../../src/domain/interpretation';
import { summaryFromScores } from './helpers';

describe('câu diễn giải', () => {
  it('close_pair bằng điểm: liệt kê theo thứ tự hiển thị, ghi rõ bằng nhau, không xếp hạng', () => {
    const s = summaryFromScores({ D: 30, I: 80, S: 20, C: 80 });
    const r = interpret(s);
    expect(headline(r)).toBe('Hai xu hướng gần nhau: I và C');
    const text = conclusion('Làm việc nhóm', s, r);
    expect(text).toContain('Trong bối cảnh làm việc nhóm');
    expect(text).toContain('với điểm bằng nhau');
    expect(text).toContain('chưa phải đánh giá đã chuẩn hóa');
    expect(text).not.toMatch(/%|percentile|chắc chắn|tin cậy/i);
  });
  it('flat không gán nhóm chính/phụ', () => {
    const s = summaryFromScores({ D: 50, I: 55, S: 52, C: 58 });
    expect(conclusion('', s, interpret(s))).toContain('không có nhóm chính hay nhóm phụ');
  });
});
