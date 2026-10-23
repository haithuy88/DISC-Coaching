// Chấm “nói theo câu mẫu” ngay trên máy: so bản ghi giọng nói với câu mẫu, không tốn lượt AI.

const EN_NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const ZH_DIGITS: Record<string, string> = { 零: '0', 〇: '0', 一: '1', 二: '2', 两: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9' };

/** Chuẩn hoá về dãy đơn vị so sánh: chữ (Hoa/Nhật) hoặc từ (ngôn ngữ khác). */
export function tokenize(text: string, byCharacter: boolean): string[] {
  const clean = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[\p{P}\p{S}]/gu, ' ');
  if (byCharacter) {
    // Bộ nhận giọng nói hay trả số dạng 7 thay cho 七; quy cả hai về chữ số.
    return [...clean.replace(/\s+/g, '')].map((c) => ZH_DIGITS[c] ?? c);
  }
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const n = EN_NUMBERS.indexOf(w);
      return n >= 0 ? String(n) : w;
    });
}

function editDistance(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** Điểm 0–100: mức giống nhau giữa câu mẫu và bản ghi. */
export function shadowingScore(target: string, transcript: string, byCharacter: boolean): number {
  const a = tokenize(target, byCharacter);
  const b = tokenize(transcript, byCharacter);
  if (a.length === 0) return 0;
  const distance = editDistance(a, b);
  return Math.max(0, Math.round(100 * (1 - distance / Math.max(a.length, b.length))));
}

/** Đếm độ dài bài viết: số chữ Hán/kana, hoặc số từ. */
export function countLength(text: string, byCharacter: boolean): number {
  if (byCharacter) return (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) ?? []).length;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
