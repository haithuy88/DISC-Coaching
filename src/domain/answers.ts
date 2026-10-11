import { isKnownQuestionId } from './questionnaire';
import type { AnswerMap, AnswerValue } from './types';

export interface AnswerEntry {
  id: string;
  value: AnswerValue;
}

export type AnswerValidation = { ok: true; answers: AnswerMap } | { ok: false; errors: string[] };

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Có khóa nguy hiểm (prototype pollution) ở bất kỳ độ sâu nào. */
export function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 20) return true;
  if (Array.isArray(value)) return value.some((v) => hasDangerousKeys(v, depth + 1));
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true;
      if (hasDangerousKeys((value as Record<string, unknown>)[key], depth + 1)) return true;
    }
  }
  return false;
}

export function isAnswerValue(v: unknown): v is AnswerValue {
  return v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5);
}

/**
 * Kiểm tra danh sách đáp án dạng [{id, value}].
 * Từ chối: ID lạ, ID trùng, giá trị không phải số nguyên 1–5 hoặc null
 * (string, số thực, NaN, Infinity, boolean, undefined), trường thừa hoặc khóa nguy hiểm.
 * Không tự ép kiểu.
 */
export function validateAnswerEntries(input: unknown): AnswerValidation {
  const errors: string[] = [];
  if (!Array.isArray(input)) return { ok: false, errors: ['Đáp án phải là danh sách.'] };
  if (hasDangerousKeys(input)) return { ok: false, errors: ['Dữ liệu chứa trường không được phép.'] };
  const answers: AnswerMap = Object.create(null) as AnswerMap;
  const seen = new Set<string>();
  input.forEach((entry: unknown, index) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`Mục ${index + 1}: không đúng định dạng.`);
      return;
    }
    const keys = Object.keys(entry);
    if (keys.length !== 2 || !keys.includes('id') || !keys.includes('value')) {
      errors.push(`Mục ${index + 1}: chỉ chấp nhận hai trường id và value.`);
      return;
    }
    const { id, value } = entry as { id: unknown; value: unknown };
    if (typeof id !== 'string' || !isKnownQuestionId(id)) {
      errors.push(`Mục ${index + 1}: ID câu hỏi không hợp lệ.`);
      return;
    }
    if (seen.has(id)) {
      errors.push(`ID ${id} bị trùng.`);
      return;
    }
    seen.add(id);
    if (!isAnswerValue(value)) {
      errors.push(`ID ${id}: giá trị phải là số nguyên 1–5 hoặc null (N/A).`);
      return;
    }
    answers[id] = value;
  });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, answers };
}

/** Kiểm tra map đáp án trong bộ nhớ (ví dụ khôi phục từ localStorage). */
export function validateAnswerMap(input: unknown): AnswerValidation {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['Đáp án phải là đối tượng.'] };
  }
  if (hasDangerousKeys(input)) return { ok: false, errors: ['Dữ liệu chứa trường không được phép.'] };
  return validateAnswerEntries(
    Object.entries(input as Record<string, unknown>).map(([id, value]) => ({ id, value })),
  );
}

export function toAnswerEntries(answers: AnswerMap, order: readonly string[]): AnswerEntry[] {
  return order.filter((id) => id in answers).map((id) => ({ id, value: answers[id] as AnswerValue }));
}
