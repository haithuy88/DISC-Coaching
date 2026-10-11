import { expect, test } from '@playwright/test';
import { answerAll, clearerD, expectNoHorizontalOverflow } from './helpers';

for (const width of [320, 375]) {
  test(`không tràn ngang ở ${width}px trên mọi màn hình chính`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
    await page.getByRole('checkbox', { name: /Tôi hiểu/ }).check();
    await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
    await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('radio', { name: /Học tập/ }).check();
    await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
    await expectNoHorizontalOverflow(page);
    await answerAll(page, (i) => (i === 5 ? 'skip' : i === 6 ? 'na' : clearerD(i)));
    await expectNoHorizontalOverflow(page);
    await page.getByText(/Xem toàn bộ 32 câu/).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Xem kết quả' }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Sang phần coaching' }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('radio', { name: /Mục tiêu do tôi tự viết/ }).check();
    await page.getByLabel('Mục tiêu của tôi').fill('Hỏi thêm một góc nhìn trước khi quyết định');
    await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Xem báo cáo & lưu' }).click();
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('article', { name: 'Báo cáo in được' })).toBeVisible();
  });
}
