import { z } from 'zod';
import { QUESTION_IDS } from './questionnaire';
import type { AnswerMap } from './types';

export const SETTINGS = ['work', 'study', 'team'] as const;
export type Setting = (typeof SETTINGS)[number];

export const SETTING_LABEL: Record<Setting, string> = {
  work: 'Công việc',
  study: 'Học tập',
  team: 'Làm việc nhóm',
};

export const PERIOD = 'last-3-months' as const;
export const PERIOD_LABEL = '3 tháng gần đây';

export const FITS = ['fit', 'not_fit', 'unsure'] as const;
export type Fit = (typeof FITS)[number];
export const FIT_LABEL: Record<Fit, string> = {
  fit: 'Phù hợp',
  not_fit: 'Không phù hợp',
  unsure: 'Chưa chắc',
};

export const MAX_NAME = 60;
export const MAX_TEXT = 2000;

export interface Plan {
  situation: string;
  behavior: string;
  count: number | null;
  usefulSignal: string;
  feedbackPerson: string;
  reviewDate: string;
  notes: string;
}

export interface Session {
  consentAcknowledged: boolean;
  setting: Setting | null;
  displayName: string;
  answers: AnswerMap;
  startedAt: string | null;
  completedAt: string | null;
  reflections: Partial<Record<string, Fit>>;
  fitNote: string;
  notFitNote: string;
  goalOptionId: string | null;
  goalText: string;
  plan: Plan;
}

export const emptyPlan = (): Plan => ({
  situation: '',
  behavior: '',
  count: null,
  usefulSignal: '',
  feedbackPerson: '',
  reviewDate: '',
  notes: '',
});

export const emptySession = (): Session => ({
  consentAcknowledged: false,
  setting: null,
  displayName: '',
  answers: {},
  startedAt: null,
  completedAt: null,
  reflections: {},
  fitNote: '',
  notFitNote: '',
  goalOptionId: null,
  goalText: '',
  plan: emptyPlan(),
});

const text = (max = MAX_TEXT) => z.string().max(max);
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có dạng YYYY-MM-DD');
const questionId = z.enum(QUESTION_IDS as [string, ...string[]]);

export const planSchema = z.strictObject({
  situation: text(),
  behavior: text(),
  count: z.number().int().min(1).max(50).nullable(),
  usefulSignal: text(),
  feedbackPerson: text(MAX_NAME * 2),
  reviewDate: z.union([z.literal(''), isoDate]),
  notes: text(),
});

export const reflectionsSchema = z.partialRecord(questionId, z.enum(FITS));

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d + days);
  return todayIso(date);
}

export function formatDateVi(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
