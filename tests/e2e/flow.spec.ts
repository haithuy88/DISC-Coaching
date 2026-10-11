import { expect, test } from '@playwright/test';
import { STORAGE_KEY, answerAll, choose, clearerD, startSurvey, toResults } from './helpers';

test('luồng chính: consent → bối cảnh → 32 câu → kết quả → coaching → kế hoạch → in', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Bắt đầu', exact: true });
  await expect(start).toBeDisabled();
  await page.getByRole('checkbox', { name: /Tôi hiểu đây là công cụ tự phản tư/ }).check();
  await expect(start).toBeEnabled();
  await start.click();

  // Bối cảnh bắt buộc, có lỗi rõ ràng khi bỏ trống
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await expect(page.getByRole('alert')).toContainText('Hãy chọn một bối cảnh');
  await page.getByRole('radio', { name: /Làm việc nhóm/ }).check();
  await page.getByLabel('Tên hiển thị (tùy chọn)').fill('Minh Anh');
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();

  // Không có đáp án mặc định, không lộ nhóm/ID
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/\b[DISC][1-8]\b/);
  await expect(page.getByTestId('count-scored')).toHaveText('0');

  await answerAll(page, clearerD);
  await expect(page.getByTestId('count-scored')).toHaveText('32');
  await expect(page.getByTestId('count-na')).toHaveText('0');
  await page.getByRole('button', { name: 'Xem kết quả' }).click();

  // Kết quả
  await expect(page.getByTestId('score-D')).toHaveText('100');
  await expect(page.getByTestId('score-I')).toHaveText('50');
  await expect(page.getByTestId('score-S')).toHaveText('25');
  await expect(page.getByTestId('score-C')).toHaveText('0');
  await expect(page.getByTestId('table-n-D')).toHaveText('8/8');
  await expect(page.getByTestId('headline')).toHaveText('Xu hướng được thể hiện rõ hơn: D');
  await expect(page.getByTestId('meta-setting')).toHaveText('Làm việc nhóm');
  await expect(page.getByText('disc-reflection-vi-1.0.0').first()).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText(/không phải phần trăm tính cách/)).toBeVisible();

  // Coaching
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  const evidence = page.getByTestId('evidence-item');
  await expect(evidence).toHaveCount(3);
  await expect(evidence.nth(0)).toHaveAttribute('data-evidence-id', 'D1');
  await expect(evidence.nth(0)).toContainText('Hãy đưa hai phương án');
  await expect(page.getByTestId('hypothesis')).toHaveCount(1);
  await expect(page.getByTestId('hypothesis')).toContainText('Có thể giúp nhóm');
  await evidence.nth(0).getByRole('radio', { name: 'Phù hợp', exact: true }).check();
  await page.getByLabel('Phần nào không giống bạn hoặc cần điều chỉnh?').fill('Câu D3 chỉ đúng khi có hỗ trợ.');

  // Phải chọn mục tiêu
  await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();
  await expect(page.getByRole('alert')).toContainText('Hãy chọn hoặc viết một mục tiêu');
  await page.getByRole('radio', { name: /Từ câu D2/ }).check();
  await expect(page.getByLabel('Mục tiêu của tôi')).toHaveValue(/mở cuộc họp bằng một kết quả cụ thể/);
  await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();

  // Kế hoạch
  await expect(page.getByTestId('plan-goal')).toContainText('mở cuộc họp');
  await page.getByLabel('Tình huống sẽ áp dụng').fill('Họp nhóm sáng thứ Hai');
  await page.getByLabel('Hành vi cụ thể sẽ thử').fill('Nêu kết quả cần đạt trong câu đầu tiên');
  await page.getByLabel('Số lần sẽ thực hiện trong 7 ngày').fill('3');
  await page.getByLabel('Dấu hiệu cho thấy thử nghiệm hữu ích').fill('Nhóm chốt việc nhanh hơn');
  await expect(page.getByLabel('Ngày xem lại')).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
  await page.getByLabel('Ghi chú tự do').fill('Xin phản hồi từ trưởng nhóm');
  await page.getByRole('button', { name: 'Xem báo cáo & lưu' }).click();

  // Báo cáo + in
  const report = page.getByRole('article', { name: 'Báo cáo in được' });
  await expect(report).toContainText('Minh Anh');
  await expect(report).toContainText('Nêu kết quả cần đạt trong câu đầu tiên');
  await expect(report).toContainText('Đánh giá của bạn: Phù hợp');
  await page.evaluate(() => {
    (window as unknown as { __printed: number }).__printed = 0;
    window.print = () => {
      (window as unknown as { __printed: number }).__printed += 1;
    };
  });
  await page.getByRole('button', { name: 'In / Lưu PDF' }).click();
  expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);

  await page.emulateMedia({ media: 'print' });
  await expect(report).toBeVisible();
  await expect(report).toContainText('Xu hướng được thể hiện rõ hơn');
  await expect(report).toContainText('Họp nhóm sáng thứ Hai');
  const visibleButtons = await page.locator('button, input').evaluateAll((els) => els.filter((el) => el.getClientRects().length > 0).length);
  expect(visibleButtons).toBe(0);
  await expect(page.locator('header.app-header')).toBeHidden();
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
  await page.emulateMedia({ media: 'screen' });
});

test('quay lại giữ lựa chọn; thứ tự câu không đổi', async ({ page }) => {
  await startSurvey(page);
  const firstText = await page.locator('#question-1 legend').innerText();
  await choose(page, 1, 4);
  await choose(page, 2, 'na');
  await choose(page, 3, 2);
  await choose(page, 4, 5);
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await choose(page, 5, 1);
  await page.getByRole('button', { name: 'Trang trước' }).click();
  expect(await page.locator('#question-1 legend').innerText()).toBe(firstText);
  await expect(page.locator('#question-1').getByRole('radio', { name: '4 – Khá giống tôi' })).toBeChecked();
  await expect(page.locator('#question-2').getByRole('radio', { name: /Chưa có trải nghiệm/ })).toBeChecked();
  await expect(page.getByTestId('count-scored')).toHaveText('4');
  await expect(page.getByTestId('count-na')).toHaveText('1');
});

test('trang chưa trả lời đủ: báo lỗi rõ, cho phép bỏ qua; rà soát chỉ rõ câu thiếu và N/A', async ({ page }) => {
  await startSurvey(page);
  await choose(page, 1, 3);
  await choose(page, 2, 'na');
  await page.getByRole('button', { name: 'Trang sau' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Còn 2 câu');
  await expect(alert).toContainText('câu 3, câu 4');
  await expect(alert).toBeFocused();
  await expect(page.locator('#question-3')).toHaveClass(/invalid/);
  await page.getByRole('button', { name: 'Đến bước rà soát' }).click();
  await expect(page.getByTestId('review-missing')).toHaveCount(30);
  await expect(page.getByTestId('review-na')).toHaveCount(1);
  await expect(page.getByTestId('insufficient')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sửa câu 4' }).click();
  await expect(page.locator('#question-4 input').first()).toBeFocused();
  await choose(page, 4, 5);
  await page.getByRole('button', { name: 'Đến bước rà soát' }).click();
  await expect(page.getByTestId('review-missing')).toHaveCount(29);
  // Chưa đủ điều kiện: chỉ xem tình trạng dữ liệu, không có kết luận
  await page.getByRole('button', { name: 'Xem tình trạng dữ liệu' }).click();
  await expect(page.getByTestId('insufficient')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sang phần coaching' })).toHaveCount(0);
  await expect(page.getByTestId('headline')).toHaveCount(0);
});

test('kết quả tạm thời khi 24–31 câu có điểm; N/A không thành 3', async ({ page }) => {
  // Câu 1–8 (D1, I1, S1, C1, D2, I2, S2, C2) chọn N/A → mỗi nhóm 6/8
  await toResults(page, (i) => (i < 8 ? 'na' : clearerD(i)));
  await expect(page.getByTestId('partial-notice')).toContainText('Kết quả tạm thời');
  await expect(page.getByTestId('table-n-I')).toHaveText('6/8');
  await expect(page.getByTestId('score-I')).toHaveText('50');
});

test('mọi đáp án giống nhau → mời rà soát thân thiện, flat', async ({ page }) => {
  await toResults(page, () => 4);
  await expect(page.getByTestId('review-suggested')).toContainText('hoàn toàn có thể xảy ra');
  await expect(page.getByTestId('headline')).toHaveText('Các xu hướng tương đối gần nhau');
  await expect(page.getByTestId('score-D')).toHaveText('75');
});

test('không opt-in: tải lại trang mất dữ liệu, không ghi localStorage', async ({ page }) => {
  await startSurvey(page);
  await choose(page, 1, 5);
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBeNull();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu cách bạn thường hành động');
  await expect(page.getByRole('checkbox', { name: /Tôi hiểu/ })).not.toBeChecked();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('opt-in: tải lại giữ tiến độ; xóa toàn bộ dữ liệu xóa localStorage', async ({ page }) => {
  await startSurvey(page);
  await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
  await expect(page.getByText(/máy dùng chung/)).toBeVisible();
  await page.getByRole('checkbox', { name: 'Lưu trên thiết bị này' }).check();
  await choose(page, 1, 5);
  await choose(page, 2, 'na');
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).not.toBeNull();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Mức độ giống bạn' })).toBeVisible();
  await expect(page.locator('#question-1').getByRole('radio', { name: '5 – Rất giống tôi' })).toBeChecked();
  await expect(page.locator('#question-2').getByRole('radio', { name: /Chưa có trải nghiệm/ })).toBeChecked();

  await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
  await page.getByRole('button', { name: 'Xóa toàn bộ dữ liệu' }).click();
  await page.getByRole('button', { name: 'Xác nhận xóa' }).click();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBeNull();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu cách bạn thường hành động');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: /Tôi hiểu/ })).not.toBeChecked();
});

test('tắt opt-in xóa bản lưu', async ({ page }) => {
  await startSurvey(page);
  await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
  const box = page.getByRole('checkbox', { name: 'Lưu trên thiết bị này' });
  await box.check();
  await choose(page, 1, 5);
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).not.toBeNull();
  await box.uncheck();
  expect(await page.evaluate((k) => localStorage.getItem(k), STORAGE_KEY)).toBeNull();
});

test('bàn phím: xác nhận, chọn bối cảnh và đáp án không cần chuột', async ({ page }) => {
  await page.goto('/');
  const consent = page.getByRole('checkbox', { name: /Tôi hiểu/ });
  await consent.focus();
  await page.keyboard.press('Space');
  await expect(consent).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Bắt đầu', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');

  await page.getByRole('radio', { name: /Công việc/ }).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Học tập/ })).toBeChecked();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).focus();
  await page.keyboard.press('Enter');

  // Tab từ tiêu đề tới nhóm lựa chọn đầu tiên
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name === 'q-1')) break;
  }
  await page.keyboard.press('Space');
  await expect(page.locator('#question-1').getByRole('radio', { name: '1 – Hầu như không giống tôi' })).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#question-1').getByRole('radio', { name: '3 – Đúng một phần / tùy tình huống' })).toBeChecked();
  // Focus hiển thị rõ (box-shadow trên lựa chọn đang focus)
  const shadow = await page.locator('#question-1 .scale-option:has(input:focus-visible)').evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).not.toBe('none');
});

test('multiple: không gán kiểu, không giả thuyết nhóm', async ({ page }) => {
  await toResults(page, (i) => (['D', 'I', 'S'].includes('DISC'[i % 4]!) ? 5 : 1));
  await expect(page.getByTestId('headline')).toHaveText('Nhiều xu hướng gần nhau: D, I, S');
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await expect(page.getByTestId('hypothesis')).toHaveCount(0);
  await expect(page.getByTestId('evidence-item')).toHaveCount(3);
});

test('close_pair: hai nhóm đồng hạng và bài tập cặp', async ({ page }) => {
  await toResults(page, (i) => ('DISC'[i % 4] === 'I' || 'DISC'[i % 4] === 'C' ? 5 : 1));
  await expect(page.getByTestId('headline')).toHaveText('Hai xu hướng gần nhau: I và C');
  await expect(page.getByTestId('conclusion')).toContainText('với điểm bằng nhau');
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await expect(page.getByTestId('pair-exercise')).toContainText('phát ý tưởng');
});

test('không có câu 4–5: không bịa bằng chứng', async ({ page }) => {
  await toResults(page, (i) => ((['D', 'I', 'S', 'C'] as const)[i % 4] === 'D' ? 3 : 1));
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await expect(page.getByTestId('no-evidence')).toBeVisible();
  await expect(page.getByTestId('evidence-item')).toHaveCount(0);
});
