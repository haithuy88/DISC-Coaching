import { test } from '@playwright/test';
import { answerAll, clearerD, startSurvey } from '../e2e/helpers';

// Chụp màn hình chính bằng fixture tổng hợp (không phải dữ liệu người dùng). Chạy: npm run screenshots
const dir = 'docs/screenshots';

test('chụp màn hình chính', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const shot = (name: string) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  await page.goto('/');
  await shot('01-mo-dau');
  await page.getByRole('checkbox', { name: /Tôi hiểu/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.getByRole('radio', { name: /Làm việc nhóm/ }).check();
  await shot('02-boi-canh');
  await page.goto('/');
  await startSurvey(page);
  await page.locator('#question-1').getByRole('radio', { name: '4 – Khá giống tôi' }).check();
  await page.locator('#question-2').getByRole('radio', { name: /Chưa có trải nghiệm/ }).check();
  await shot('03-khao-sat');
  await page.goto('/');
  await startSurvey(page);
  await answerAll(page, (i) => (i === 9 ? 'skip' : i === 14 ? 'na' : clearerD(i)));
  await shot('04-ra-soat');
  await page.getByRole('button', { name: 'Xem kết quả' }).click();
  await shot('05-ket-qua');
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await page.getByTestId('evidence-item').first().getByRole('radio', { name: 'Phù hợp', exact: true }).check();
  await page.getByRole('radio', { name: /Từ câu D2/ }).check();
  await shot('06-coaching');
  await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();
  await page.getByLabel('Tình huống sẽ áp dụng').fill('Họp nhóm sáng thứ Hai');
  await page.getByLabel('Hành vi cụ thể sẽ thử').fill('Nêu kết quả cần đạt trong câu đầu tiên');
  await page.getByLabel('Số lần sẽ thực hiện trong 7 ngày').fill('3');
  await page.getByLabel('Dấu hiệu cho thấy thử nghiệm hữu ích').fill('Nhóm chốt việc nhanh hơn');
  await shot('07-ke-hoach');
  await page.getByRole('button', { name: 'Xem báo cáo & lưu' }).click();
  await shot('08-bao-cao-export');
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: 794, height: 1123 });
  await shot('09-ban-in');
  await page.pdf({ path: `${dir}/bao-cao-mau.pdf`, format: 'A4', printBackground: true });
});
