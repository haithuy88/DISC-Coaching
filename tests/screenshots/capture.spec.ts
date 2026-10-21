import { test } from '@playwright/test';
import { answerAll, clearerD, fakeSheetsServer, identify } from '../e2e/helpers';

// Chụp màn hình chính bằng fixture tổng hợp và máy chủ giả (không phải dữ liệu người dùng). Chạy: npm run screenshots
const dir = 'docs/screenshots';

test('chụp màn hình chính', async ({ page }) => {
  await fakeSheetsServer(page);
  await page.setViewportSize({ width: 375, height: 812 });
  const shot = (name: string) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  await page.goto('/');
  await shot('01-mo-dau');
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await shot('02-thong-tin-bat-buoc');
  await identify(page, 'Người Mẫu', 'Phòng Kinh Doanh', 'Trưởng nhóm');
  await page.locator('#question-1').getByRole('radio', { name: '4 – Khá giống tôi' }).check();
  await shot('03-khao-sat');
  await answerAll(page, (i) => (i === 9 ? 'skip' : i === 26 ? 'na' : clearerD(i)));
  await shot('04-ra-soat-thieu-cau');
  await page.getByRole('button', { name: 'Sửa câu 10' }).click();
  await page.locator('#question-10').getByRole('radio', { name: '3 – Đúng một phần / tùy tình huống' }).check();
  await page.getByRole('button', { name: 'Đến bước rà soát' }).click();
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await page.getByTestId('sync-status').and(page.locator('[data-status="synced"]')).waitFor();
  await shot('05-ket-qua');
});
