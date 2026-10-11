import { expect, type Page } from '@playwright/test';

export const STORAGE_KEY = 'disc-coaching-lab:v1';
const DIMS = ['D', 'I', 'S', 'C'] as const;
export type Choice = 1 | 2 | 3 | 4 | 5 | 'na' | 'skip';

/** Fixture tổng hợp chỉ dùng cho test: D=5, I=3, S=2, C=1 → D100, I50, S25, C0. */
export const clearerD = (index: number): Choice => ({ D: 5, I: 3, S: 2, C: 1 } as const)[DIMS[index % 4]!];

const SCALE_NAME: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '1 – Hầu như không giống tôi',
  2: '2 – Ít giống tôi',
  3: '3 – Đúng một phần / tùy tình huống',
  4: '4 – Khá giống tôi',
  5: '5 – Rất giống tôi',
};

export async function startSurvey(page: Page) {
  await page.goto('/');
  await page.getByRole('checkbox', { name: /Tôi hiểu đây là công cụ tự phản tư/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.getByRole('radio', { name: /Làm việc nhóm/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mức độ giống bạn' })).toBeVisible();
}

export async function choose(page: Page, number: number, choice: Choice) {
  if (choice === 'skip') return;
  const q = page.locator(`#question-${number}`);
  const name = choice === 'na' ? 'Chưa có trải nghiệm / chưa thể trả lời' : SCALE_NAME[choice];
  await q.getByRole('radio', { name, exact: true }).check();
}

/** Trả lời toàn bộ 32 câu theo hàm chọn, rồi tới màn hình rà soát. */
export async function answerAll(page: Page, pick: (index: number) => Choice) {
  for (let p = 0; p < 8; p++) {
    for (let i = 0; i < 4; i++) {
      const index = p * 4 + i;
      await choose(page, index + 1, pick(index));
    }
    await page.getByRole('button', { name: p === 7 ? 'Rà soát câu trả lời' : 'Trang sau' }).click();
    const skip = page.getByRole('button', { name: /^Bỏ qua, sang/ });
    if (await skip.isVisible()) await skip.click();
  }
  await expect(page.getByRole('heading', { level: 1, name: 'Rà soát câu trả lời' })).toBeVisible();
}

export async function toResults(page: Page, pick: (index: number) => Choice = clearerD) {
  await startSurvey(page);
  await answerAll(page, pick);
  await page.getByRole('button', { name: 'Xem kết quả' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Bốn điểm xu hướng của bạn' })).toBeVisible();
}

export async function toExport(page: Page) {
  await toResults(page);
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await page.getByRole('radio', { name: /Từ câu D1/ }).check();
  await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();
  await page.getByLabel('Tình huống sẽ áp dụng').fill('Họp nhóm sáng thứ Hai');
  await page.getByRole('button', { name: 'Xem báo cáo & lưu' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Báo cáo của bạn' })).toBeVisible();
}

export async function downloadReport(page: Page): Promise<Record<string, unknown>> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Tải báo cáo JSON' }).click(),
  ]);
  const path = await download.path();
  const fs = await import('node:fs/promises');
  return JSON.parse(await fs.readFile(path, 'utf8')) as Record<string, unknown>;
}

export async function importText(page: Page, name: string, text: string | Buffer) {
  await page.getByLabel(/Mở báo cáo JSON đã xuất/).setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: typeof text === 'string' ? Buffer.from(text, 'utf8') : text,
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'trang không được tràn ngang').toBeLessThanOrEqual(0);
}
