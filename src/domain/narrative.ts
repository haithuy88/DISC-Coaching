import { formatScore } from './interpretation';
import { PROFILES } from './questionnaire';
import { DIMENSIONS, type Dimension, type Interpretation, type ScoreSummary } from './types';

const named = (d: Dimension) => `${d} (${PROFILES[d].name.toLowerCase()})`;

function joinVi(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} và ${items[items.length - 1]}`;
}

/** Diễn giải tập ứng viên theo mẫu trong tài liệu hướng dẫn. Không xếp hạng khi bằng điểm. */
export function describeCandidates(interpretation: Interpretation): string {
  const { status, candidates, topTied } = interpretation;
  switch (status) {
    case 'insufficient':
      return 'chưa đủ dữ liệu để diễn giải xu hướng';
    case 'flat':
      return 'các xu hướng tương đối gần nhau trong bộ câu trả lời này, nên không có nhóm chính hay nhóm phụ';
    case 'clearer':
      return `xu hướng được thể hiện rõ hơn là ${named(candidates[0]!)}`;
    case 'close_pair':
      return `có hai xu hướng gần nhau: ${joinVi(candidates.map(named))}${
        topTied.length === 2 ? ', với điểm bằng nhau' : ''
      }`;
    case 'multiple':
      return `có nhiều xu hướng gần nhau: ${joinVi(candidates.map(named))}`;
  }
}

export function scoresSentence(summary: ScoreSummary): string {
  return DIMENSIONS.map((d) => `${d} ${formatScore(summary.dimensions[d].score)}`).join(', ');
}

export function headline(interpretation: Interpretation): string {
  switch (interpretation.status) {
    case 'insufficient':
      return 'Chưa đủ dữ liệu';
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

export function conclusion(settingLabel: string, summary: ScoreSummary, interpretation: Interpretation): string {
  const where = settingLabel ? `Trong bối cảnh ${settingLabel.toLowerCase()} và các câu bạn đã trả lời` : 'Với các câu bạn đã trả lời';
  return (
    `${where}, ${describeCandidates(interpretation)}. ` +
    `Các điểm ${scoresSentence(summary)} thể hiện mức đồng tình với các phát biểu của bộ khảo sát này. ` +
    'Đây là gợi ý để trao đổi, chưa phải đánh giá đã chuẩn hóa.'
  );
}
