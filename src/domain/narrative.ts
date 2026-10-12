import { formatScore } from './interpretation';
import { DIMENSION_NAME, DISC_QUESTIONS } from './questionnaire';
import { hasAnswer } from './scoring';
import { DIMENSIONS, type AnswerMap, type Dimension, type Interpretation, type ScoreSummary, type ScoredValue } from './types';

const named = (d: Dimension) => `${d} (${DIMENSION_NAME[d].toLowerCase()})`;

function joinVi(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} và ${items[items.length - 1]}`;
}

export function headline(interpretation: Interpretation): string {
  switch (interpretation.pattern) {
    case 'insufficient':
      return 'Chưa đủ dữ liệu để nhận xét xu hướng';
    case 'flat':
      return 'Các xu hướng tương đối gần nhau';
    case 'clearer':
      return `Xu hướng được thể hiện rõ hơn: ${interpretation.candidates[0]}`;
    case 'close_pair':
      return `Hai xu hướng gần nhau: ${interpretation.candidates.join(' và ')}`;
    case 'multiple':
      return `Nhiều xu hướng gần nhau: ${interpretation.candidates.join(', ')}`;
  }
}

function describe(interpretation: Interpretation): string {
  switch (interpretation.pattern) {
    case 'insufficient':
      return 'chưa đủ câu có điểm để nhận xét xu hướng';
    case 'flat':
      return 'các xu hướng tương đối gần nhau, nên không có nhóm chính hay nhóm phụ';
    case 'clearer':
      return `xu hướng được thể hiện rõ hơn là ${named(interpretation.candidates[0]!)}`;
    case 'close_pair':
      return `có hai xu hướng gần nhau: ${joinVi(interpretation.candidates.map(named))}${
        interpretation.topTied.length === 2 ? ', với điểm bằng nhau' : ''
      }`;
    case 'multiple':
      return `có nhiều xu hướng gần nhau: ${joinVi(interpretation.candidates.map(named))}`;
  }
}

/** Nhận xét sơ bộ ngắn. Không gợi ý coach, cải thiện, nghề nghiệp hay đánh giá leadership. */
export function preliminarySummary(summary: ScoreSummary, interpretation: Interpretation): string {
  const scores = DIMENSIONS.map((d) => `${d} ${formatScore(summary.dimensions[d].score)}`).join(', ');
  if (interpretation.pattern === 'insufficient') {
    return `Trong các câu trả lời này, ${describe(interpretation)} (cần ít nhất 5/6 câu mỗi nhóm và 20/24 câu DISC có điểm).`;
  }
  const partial = interpretation.dataStatus === 'partial' ? ' Đây là kết quả tạm thời từ các câu đã có điểm.' : '';
  return (
    `Trong các câu trả lời này, ${describe(interpretation)}. Điểm ${scores} thể hiện mức đồng tình với các phát biểu ` +
    `của bộ khảo sát, chưa phải đánh giá đã chuẩn hóa.${partial}`
  );
}

export interface Evidence {
  id: string;
  text: string;
  value: ScoredValue;
}

/** Tối đa 2 câu DISC được chấm 4–5, sắp điểm giảm dần rồi ID. Không có thì trả về rỗng, không bịa. */
export function selectEvidence(answers: AnswerMap, max = 2): Evidence[] {
  const items: Evidence[] = [];
  for (const q of DISC_QUESTIONS) {
    if (!hasAnswer(answers, q.id)) continue;
    const v = answers[q.id];
    if (typeof v === 'number' && v >= 4) items.push({ id: q.id, text: q.text, value: v });
  }
  return items
    .sort((a, b) => (b.value !== a.value ? b.value - a.value : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, max);
}
