import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { answerAll, choose, clearerD, expectNoHorizontalOverflow, fakeSheetsServer, identify, sheetRows } from './helpers';

const sheetsSchema = JSON.parse(readFileSync('src/data/lamson-30.sheets-schema.json', 'utf8')) as {
  tabs: Record<string, string[]>;
};

test('luồng chính: thông tin bắt buộc → 30 câu → rà soát → gửi → ghi Sheet → kết quả sơ bộ', async ({ page }) => {
  const server = await fakeSheetsServer(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();

  // Họ tên, phòng ban và đồng ý là bắt buộc
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Hãy nhập họ tên');
  await expect(alert).toContainText('Hãy chọn phòng ban');
  await expect(alert).toContainText('Hãy chọn chức danh');
  await expect(alert).toContainText('đánh dấu đồng ý');
  await expect(alert).toBeFocused();
  await page.getByLabel(/Họ và tên/).fill('Nguyễn Văn Thử');
  await expect(page.getByLabel(/Phòng ban/).locator('option:not([disabled])')).toHaveText([
    'Phòng Thu Mua', 'Phòng Kế Toán', 'Phòng Nhân Sự', 'Phòng KSNB', 'Phòng Kinh Doanh', 'BGD',
  ]);
  await expect(page.getByLabel(/Chức danh/).locator('option:not([disabled])')).toHaveText([
    'Trưởng phòng', 'Trưởng nhóm', 'Nhân viên', 'BGD',
  ]);
  await page.getByLabel(/Phòng ban/).selectOption('Phòng Kinh Doanh');
  await page.getByLabel(/Chức danh/).selectOption('Trưởng nhóm');
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await expect(page.getByRole('alert')).toContainText('đánh dấu đồng ý');
  await page.getByRole('checkbox', { name: /Tôi đồng ý gửi câu trả lời/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();

  // Không preselect, không lộ nhóm/ID/scored
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/\b[DISCLT][1-8]\b|scored|Leadership/);
  await expect(page.getByTestId('count-missing')).toHaveText('30');

  await answerAll(page, clearerD);
  await expect(page.getByTestId('count-answered')).toHaveText('30');
  expect(server.requests, 'không gửi gì trước khi bấm Gửi').toBe(0);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();

  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'synced');
  await expect(page.getByTestId('sync-status')).toContainText('Đã ghi nhận vào Google Sheets');
  await expect(page.getByTestId('score-D')).toHaveText('100');
  await expect(page.getByTestId('score-I')).toHaveText('50');
  await expect(page.getByTestId('score-S')).toHaveText('25');
  await expect(page.getByTestId('score-C')).toHaveText('0');
  await expect(page.getByTestId('table-n-D')).toHaveText('8/8');
  await expect(page.getByTestId('headline')).toHaveText('Xu hướng được thể hiện rõ hơn: D');
  await expect(page.getByTestId('summary')).toContainText('Trong các câu trả lời này');
  await expect(page.getByTestId('evidence-item')).toHaveCount(2);
  await expect(page.getByTestId('context-table').locator('tbody tr')).toHaveCount(6);
  await expect(page.getByTestId('context-table')).toContainText('5 – Rất giống tôi');

  // Không còn phần coaching, câu mở hay kế hoạch hành động
  await expect(page.locator('textarea')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/kế hoạch|7 ngày|gợi ý coach/i);

  // Dữ liệu trên Sheet
  expect(server.requests).toBe(1);
  const kq = sheetRows(server, 'KET_QUA');
  expect(kq).toHaveLength(1);
  const row = Object.fromEntries(sheetsSchema.tabs.KET_QUA.map((h, i) => [h, kq[0]![i]]));
  expect(row.Ho_ten).toBe('Nguyễn Văn Thử');
  expect(row.Phong_ban).toBe('Phòng Kinh Doanh');
  expect(row.Chuc_danh).toBe('Trưởng nhóm');
  expect(row.Score_D).toBe(100);
  expect(sheetRows(server, 'TRA_LOI')).toHaveLength(1);

  // Không lưu gì vào localStorage
  expect(await page.evaluate(() => localStorage.length)).toBe(0);

  await page.getByRole('button', { name: 'Hoàn tất và xóa khỏi trang này' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Khảo sát xu hướng hành vi');
});

test('quay lại giữ lựa chọn; trang cuối có 2 câu', async ({ page }) => {
  await fakeSheetsServer(page);
  await identify(page);
  await choose(page, 1, 4);
  await choose(page, 2, 'na');
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await page.getByRole('button', { name: /^Bỏ qua, sang/ }).click();
  await page.getByRole('button', { name: 'Trang trước' }).click();
  await expect(page.locator('#question-1').getByRole('radio', { name: '4 – Khá giống tôi' })).toBeChecked();
  await expect(page.locator('#question-2').getByRole('radio', { name: /Chưa có trải nghiệm/ })).toBeChecked();
  await expect(page.getByTestId('count-na')).toHaveText('1');
  await page.getByRole('button', { name: 'Đến bước rà soát' }).click();
  await page.getByRole('button', { name: 'Về trang khảo sát cuối' }).click();
  await expect(page.locator('fieldset.question')).toHaveCount(2);
  await expect(page.locator('#question-30')).toBeVisible();
});

test('rà soát: chưa đủ 30 câu thì không gửi; sửa câu đưa focus tới đúng câu', async ({ page }) => {
  const server = await fakeSheetsServer(page);
  await identify(page);
  await answerAll(page, (i) => (i === 3 || i === 29 ? 'skip' : i === 5 ? 'na' : clearerD(i)));
  await expect(page.getByTestId('review-missing')).toHaveCount(2);
  await expect(page.getByTestId('review-na')).toHaveCount(1);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await expect(page.getByRole('alert')).toContainText('Còn 2 câu chưa có lựa chọn');
  expect(server.requests).toBe(0);
  await page.getByRole('button', { name: 'Sửa câu 4' }).click();
  await expect(page.locator('#question-4 input').first()).toBeFocused();
  await choose(page, 4, 1);
  await page.getByRole('button', { name: 'Đến bước rà soát' }).click();
  await page.getByRole('button', { name: 'Sửa câu 30' }).click();
  await choose(page, 30, 'na');
  await page.getByRole('button', { name: 'Rà soát và gửi' }).click();
  await expect(page.getByTestId('review-missing')).toHaveCount(0);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'synced');
  const tl = sheetRows(server, 'TRA_LOI')[0]!;
  expect(tl[sheetsSchema.tabs.TRA_LOI.indexOf('T3')]).toBe('N/A');
});

test('lỗi mạng: không báo đã ghi; gửi lại không tạo dòng trùng', async ({ page }) => {
  const server = await fakeSheetsServer(page);
  server.failNext = 1;
  await identify(page);
  await answerAll(page, clearerD);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  const status = page.getByTestId('sync-status');
  await expect(status).toHaveAttribute('data-status', 'error');
  await expect(status).toContainText('Chưa gửi được');
  await expect(page.locator('main')).not.toContainText('Đã ghi nhận');
  await expect(page.getByText('chưa được máy chủ xác nhận')).toBeVisible();
  expect(sheetRows(server, 'KET_QUA')).toHaveLength(0);

  await page.getByRole('button', { name: 'Gửi lại' }).click();
  await expect(status).toHaveAttribute('data-status', 'synced');
  expect(sheetRows(server, 'KET_QUA')).toHaveLength(1);
  expect(server.requests).toBe(2);
});

test('Google lỗi khi ghi một tab: máy chủ báo lỗi, gửi lại thì bổ sung đủ, không trùng', async ({ page }) => {
  const server = await fakeSheetsServer(page);
  server.gas.ss.tab('KET_QUA').failBeforeWrite = new Error('429');
  await identify(page);
  await answerAll(page, clearerD);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'error');
  expect(sheetRows(server, 'TRA_LOI')).toHaveLength(1);
  expect(sheetRows(server, 'KET_QUA')).toHaveLength(0);
  await page.getByRole('button', { name: 'Gửi lại' }).click();
  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'synced');
  expect(sheetRows(server, 'TRA_LOI')).toHaveLength(1);
  expect(sheetRows(server, 'KET_QUA')).toHaveLength(1);
});

test('máy chủ từ chối (ví dụ phiên bản khác) → báo lỗi rõ, không ghi', async ({ page }) => {
  const server = await fakeSheetsServer(page);
  await page.route('https://script.google.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Phiên bản bộ câu hỏi không được hỗ trợ.' }) }),
  );
  await identify(page);
  await answerAll(page, clearerD);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'rejected');
  await expect(page.getByTestId('sync-status')).toContainText('Phiên bản bộ câu hỏi không được hỗ trợ');
  expect(sheetRows(server, 'KET_QUA')).toHaveLength(0);
});

test('bàn phím: điền thông tin và chọn đáp án không cần chuột', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByLabel(/Họ và tên/).focus();
  await page.keyboard.type('Bàn Phím');
  await page.keyboard.press('Tab');
  await page.keyboard.type('BGD');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Nhân');
  await page.getByRole('checkbox', { name: /Tôi đồng ý/ }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name === 'q-1')) break;
  }
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#question-1').getByRole('radio', { name: '2 – Ít giống tôi' })).toBeChecked();
});

for (const width of [320, 375]) {
  test(`không tràn ngang ở ${width}px`, async ({ page }) => {
    await fakeSheetsServer(page);
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
    await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByLabel(/Họ và tên/).fill('Người Rất Dài Tên Để Kiểm Tra Xuống Dòng Trên Màn Hình Hẹp');
    await page.getByLabel(/Phòng ban/).selectOption('Phòng Kinh Doanh');
    await page.getByLabel(/Chức danh/).selectOption('Trưởng phòng');
    await page.getByRole('checkbox', { name: /Tôi đồng ý/ }).check();
    await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
    await expectNoHorizontalOverflow(page);
    await answerAll(page, (i) => (i === 7 ? 'na' : clearerD(i)));
    await page.getByText(/Xem toàn bộ 30 câu/).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
    await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'synced');
    await expectNoHorizontalOverflow(page);
  });
}
