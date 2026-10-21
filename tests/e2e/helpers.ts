import { expect, type Page } from '@playwright/test';
import { loadGas, type Gas } from '../unit/gas-harness';
import { TEST_SUBMIT_URL } from './constants';

const DIMS = ['D', 'I', 'S', 'C'] as const;
export type Choice = 1 | 2 | 3 | 4 | 5 | 'na' | 'skip';

/** Câu 25–30 (L1, L2, L3, T1, T2, T3) đã gộp vào D, S, C, D, S, C. */
const LT_DIMS = ['D', 'S', 'C', 'D', 'S', 'C'] as const;
const CLEARER_D = { D: 5, I: 3, S: 2, C: 1 } as const;

/** Fixture tổng hợp chỉ dùng cho test: mọi câu theo nhóm → D5, I3, S2, C1. */
export const clearerD = (index: number): Choice =>
  CLEARER_D[index < 24 ? DIMS[index % 4]! : LT_DIMS[index - 24]!];

const SCALE_NAME: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '1 – Hầu như không giống tôi',
  2: '2 – Ít giống tôi',
  3: '3 – Đúng một phần / tùy tình huống',
  4: '4 – Khá giống tôi',
  5: '5 – Rất giống tôi',
};

export interface FakeServer {
  gas: Gas;
  requests: number;
  /** lần gọi kế tiếp sẽ lỗi mạng (request không tới máy chủ) */
  failNext: number;
}

/** Chặn request tới Apps Script và xử lý bằng chính Code.gs trên bảng tính giả trong bộ nhớ. */
export async function fakeSheetsServer(page: Page): Promise<FakeServer> {
  const gas = loadGas();
  gas.setup();
  const server: FakeServer = { gas, requests: 0, failNext: 0 };
  await page.route(`${TEST_SUBMIT_URL}*`, async (route) => {
    server.requests += 1;
    if (server.failNext > 0) {
      server.failNext -= 1;
      await route.abort('failed');
      return;
    }
    const out = gas.doPost({ postData: { contents: route.request().postData() ?? '' } });
    await route.fulfill({ status: 200, contentType: 'application/json', body: out.content });
  });
  return server;
}

export const sheetRows = (server: FakeServer, tab: string) => server.gas.ss.tab(tab).rows.slice(1);

export async function identify(page: Page, name = 'Người thử E2E', dept = 'Phòng Nhân Sự', title = 'Nhân viên') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.getByLabel(/Họ và tên/).fill(name);
  await page.getByLabel(/Phòng ban/).selectOption(dept);
  await page.getByLabel(/Chức danh/).selectOption(title);
  await page.getByRole('checkbox', { name: /Tôi đồng ý gửi câu trả lời/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mức độ giống bạn' })).toBeVisible();
}

export async function choose(page: Page, number: number, choice: Choice) {
  if (choice === 'skip') return;
  const q = page.locator(`#question-${number}`);
  const name = choice === 'na' ? 'Chưa có trải nghiệm / chưa thể trả lời' : SCALE_NAME[choice];
  await q.getByRole('radio', { name, exact: true }).check();
}

/** Trả lời 30 câu (8 trang, trang cuối 2 câu) rồi tới màn hình rà soát. */
export async function answerAll(page: Page, pick: (index: number) => Choice) {
  for (let p = 0; p < 8; p++) {
    const count = p === 7 ? 2 : 4;
    await expect(page.locator('fieldset.question')).toHaveCount(count);
    for (let i = 0; i < count; i++) await choose(page, p * 4 + i + 1, pick(p * 4 + i));
    await page.getByRole('button', { name: p === 7 ? 'Rà soát và gửi' : 'Trang sau' }).click();
    const skip = page.getByRole('button', { name: /^Bỏ qua, sang/ });
    if (await skip.isVisible()) await skip.click();
  }
  await expect(page.getByRole('heading', { level: 1, name: 'Rà soát câu trả lời' })).toBeVisible();
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'trang không được tràn ngang').toBeLessThanOrEqual(0);
}
