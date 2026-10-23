// Đảo thứ tự đáp án cố định theo id câu hỏi: không lộ quy luật “đáp án luôn ở đầu”,
// mà mỗi lần mở lại vẫn giữ nguyên thứ tự để người học không bị rối.
export function shuffledOrder(seed: string, length: number): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}
