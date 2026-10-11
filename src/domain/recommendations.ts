import { PROFILES, QUESTIONS } from './questionnaire';
import { hasAnswer } from './scoring';
import { DIMENSIONS, type AnswerMap, type Dimension, type Interpretation, type Question, type ScoredValue } from './types';

export const MAX_EVIDENCE = 3;

export interface EvidenceItem {
  evidenceIds: [string];
  questionId: string;
  dimension: Dimension;
  text: string;
  value: ScoredValue;
  action: string;
}

/** Giả thuyết theo nhóm, nguồn là các câu đã chấm của nhóm đó. */
export interface ProfileHypothesis {
  dimension: Dimension;
  name: string;
  strength: string;
  risk: string;
  need: string;
  question: string;
  action: string;
  sourceIds: string[];
}

export interface PairExercise {
  pair: [Dimension, Dimension];
  text: string;
  sourceIds: string[];
}

export interface GoalOption {
  id: string;
  label: string;
  action: string;
  sourceIds: string[];
  kind: 'evidence' | 'profile' | 'pair' | 'practice';
}

export interface CoachingSuggestions {
  evidence: EvidenceItem[];
  hypotheses: ProfileHypothesis[];
  pairExercise: PairExercise | null;
  /** câu đã chấm 1–2: chỉ để học viên tự chọn nếu muốn thử, không phải khuyết điểm */
  practiceItems: EvidenceItem[];
  goalOptions: GoalOption[];
}

/** Bài tập tự biên soạn cho hai xu hướng gần nhau (không phải kiểu chuẩn hóa). */
export const PAIR_EXERCISES: Record<string, string> = {
  DI: 'Sau khi thuyết phục, chốt cam kết bằng văn bản: ai làm gì, khi nào.',
  DS: 'Thống nhất thời hạn và hình thức hỗ trợ trước khi bắt đầu.',
  DC: 'Đặt giới hạn thời gian cho phần phân tích rồi ra quyết định.',
  IS: 'Nói rõ một nhu cầu cá nhân của bạn trong cuộc trao đổi.',
  IC: 'Tách riêng giai đoạn phát ý tưởng và giai đoạn kiểm tra.',
  SC: 'Thử một thay đổi nhỏ với tiêu chí đánh giá rõ ràng.',
};

function byValueDescThenId(a: { value: number; questionId: string }, b: { value: number; questionId: string }) {
  if (b.value !== a.value) return b.value - a.value;
  return a.questionId < b.questionId ? -1 : a.questionId > b.questionId ? 1 : 0;
}

function toItem(q: Question, value: ScoredValue): EvidenceItem {
  return { evidenceIds: [q.id], questionId: q.id, dimension: q.dimension, text: q.text, value, action: q.action };
}

/** Tối đa 3 câu đã chấm ≥ 4, sắp điểm giảm dần rồi ID theo bảng chữ cái. Không bịa bằng chứng. */
export function selectEvidence(answers: AnswerMap, questions: readonly Question[] = QUESTIONS): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  for (const q of questions) {
    if (!hasAnswer(answers, q.id)) continue;
    const v = answers[q.id];
    if (typeof v === 'number' && v >= 4) items.push(toItem(q, v));
  }
  return items.sort(byValueDescThenId).slice(0, MAX_EVIDENCE);
}

/** Câu đã chấm 1–2 để mời thử nghiệm nếu học viên muốn, sắp điểm tăng dần rồi ID. */
export function selectPracticeItems(answers: AnswerMap, questions: readonly Question[] = QUESTIONS): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  for (const q of questions) {
    if (!hasAnswer(answers, q.id)) continue;
    const v = answers[q.id];
    if (typeof v === 'number' && v <= 2) items.push(toItem(q, v));
  }
  return items
    .sort((a, b) => (a.value !== b.value ? a.value - b.value : a.questionId < b.questionId ? -1 : 1))
    .slice(0, MAX_EVIDENCE);
}

function scoredIdsOf(dimension: Dimension, answers: AnswerMap, questions: readonly Question[]): string[] {
  return questions
    .filter((q) => q.dimension === dimension && hasAnswer(answers, q.id) && typeof answers[q.id] === 'number')
    .map((q) => q.id);
}

export function buildSuggestions(
  answers: AnswerMap,
  interpretation: Interpretation,
  questions: readonly Question[] = QUESTIONS,
): CoachingSuggestions {
  if (interpretation.status === 'insufficient') {
    return { evidence: [], hypotheses: [], pairExercise: null, practiceItems: [], goalOptions: [] };
  }
  const evidence = selectEvidence(answers, questions);
  const practiceItems = selectPracticeItems(answers, questions);

  // Hồ sơ nhóm chỉ là giả thuyết, và chỉ đưa khi có một hoặc hai xu hướng nổi hơn.
  // Với multiple/flat: ưu tiên câu trả lời từng câu và mục tiêu của học viên.
  const showProfiles = interpretation.status === 'clearer' || interpretation.status === 'close_pair';
  const hypotheses: ProfileHypothesis[] = showProfiles
    ? DIMENSIONS.filter((d) => interpretation.candidates.includes(d)).map((d) => ({
        dimension: d,
        ...PROFILES[d],
        sourceIds: scoredIdsOf(d, answers, questions),
      }))
    : [];

  let pairExercise: PairExercise | null = null;
  if (interpretation.status === 'close_pair') {
    const pair = DIMENSIONS.filter((d) => interpretation.candidates.includes(d)) as [Dimension, Dimension];
    const text = PAIR_EXERCISES[pair.join('')];
    if (text) {
      pairExercise = {
        pair,
        text,
        sourceIds: [...scoredIdsOf(pair[0], answers, questions), ...scoredIdsOf(pair[1], answers, questions)],
      };
    }
  }

  const goalOptions: GoalOption[] = [
    ...evidence.map((e) => ({
      id: `evidence:${e.questionId}`,
      label: `Từ câu ${e.questionId}`,
      action: e.action,
      sourceIds: [e.questionId],
      kind: 'evidence' as const,
    })),
    ...hypotheses.map((h) => ({
      id: `profile:${h.dimension}`,
      label: `Gợi ý chung nhóm ${h.dimension}`,
      action: h.action,
      sourceIds: h.sourceIds,
      kind: 'profile' as const,
    })),
    ...(pairExercise
      ? [
          {
            id: `pair:${pairExercise.pair.join('')}`,
            label: `Bài tập ${pairExercise.pair.join('/')}`,
            action: pairExercise.text,
            sourceIds: pairExercise.sourceIds,
            kind: 'pair' as const,
          },
        ]
      : []),
    ...practiceItems.map((p) => ({
      id: `practice:${p.questionId}`,
      label: `Thử hành vi ở câu ${p.questionId}`,
      action: p.action,
      sourceIds: [p.questionId],
      kind: 'practice' as const,
    })),
  ];

  return { evidence, hypotheses, pairExercise, practiceItems, goalOptions };
}

/**
 * Gợi ý cho báo cáo nhập không kèm đáp án: chỉ dùng bằng chứng có trong file (đã kiểm tra ID),
 * không suy giả thuyết nhóm vì không đối chiếu được nguồn.
 */
export function suggestionsFromEvidence(evidence: EvidenceItem[]): CoachingSuggestions {
  return {
    evidence,
    hypotheses: [],
    pairExercise: null,
    practiceItems: [],
    goalOptions: evidence.map((e) => ({
      id: `evidence:${e.questionId}`,
      label: `Từ câu ${e.questionId}`,
      action: e.action,
      sourceIds: [e.questionId],
      kind: 'evidence' as const,
    })),
  };
}
