import { expect, test } from '@playwright/test';
import { downloadReport, importText, toExport } from './helpers';

test('export mặc định không có answers; opt-in thì có', async ({ page }) => {
  await toExport(page);
  await expect(page.getByRole('checkbox', { name: 'Kèm câu trả lời từng câu' })).not.toBeChecked();
  const plain = await downloadReport(page);
  expect(plain.schema).toBe('disc-coaching-lab/report');
  expect(plain.schemaVersion).toBe(1);
  expect(typeof plain.createdAt).toBe('string');
  expect(plain.answersIncluded).toBe(false);
  expect('answers' in plain).toBe(false);
  expect((plain.scores as Record<string, { score: number }>).D.score).toBe(100);
  expect((plain.plan as { situation: string }).situation).toBe('Họp nhóm sáng thứ Hai');
  await expect(page.getByRole('status').filter({ hasText: 'không kèm câu trả lời' })).toBeVisible();

  await page.getByRole('checkbox', { name: 'Kèm câu trả lời từng câu' }).check();
  const full = await downloadReport(page);
  expect(full.answersIncluded).toBe(true);
  expect(full.answers).toHaveLength(32);
});

test('import file bị sửa điểm nhưng có answers → điểm được tính lại', async ({ page }) => {
  await toExport(page);
  await page.getByRole('checkbox', { name: 'Kèm câu trả lời từng câu' }).check();
  const report = await downloadReport(page);
  const scores = report.scores as Record<string, { score: number }>;
  scores.C.score = 100;
  scores.D.score = 0;
  (report.interpretation as { candidates: string[] }).candidates = ['C'];

  await page.getByText('Mở báo cáo khác').click();
  await importText(page, 'sua-diem.json', JSON.stringify(report));
  await expect(page.getByTestId('import-recomputed')).toContainText('đã tính lại');
  await expect(page.getByTestId('import-recomputed')).toContainText('không khớp');
  await expect(page.getByTestId('score-D')).toHaveText('100');
  await expect(page.getByTestId('score-C')).toHaveText('0');
  await expect(page.getByTestId('headline')).toHaveText('Xu hướng được thể hiện rõ hơn: D');
});

test('import không có answers → "chưa đối chiếu đáp án"; text XSS hiển thị như văn bản thuần', async ({ page }) => {
  await toExport(page);
  const report = await downloadReport(page);
  const xss = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
  report.notFitNote = xss;
  (report.context as { displayName: string }).displayName = '<b>Tên</b>';

  await page.getByRole('button', { name: /Quyền riêng tư/ }).click();
  await page.getByRole('button', { name: 'Xóa toàn bộ dữ liệu' }).first().click();
  await page.getByRole('button', { name: 'Xác nhận xóa' }).click();
  await page.getByRole('checkbox', { name: /Tôi hiểu/ }).check();
  await page.getByText('Đã có báo cáo được xuất trước đó?').click();
  await importText(page, 'khong-dap-an.json', JSON.stringify(report));

  await expect(page.getByTestId('import-unverified')).toContainText('Báo cáo được nhập, chưa đối chiếu đáp án');
  await expect(page.getByTestId('score-D')).toHaveText('100');
  await page.getByRole('button', { name: 'Sang phần coaching' }).click();
  await expect(page.getByTestId('evidence-item')).toHaveCount(3);
  await page.getByRole('button', { name: 'Lập kế hoạch 7 ngày' }).click();
  await page.getByRole('button', { name: 'Xem báo cáo & lưu' }).click();
  await expect(page.getByTestId('report-notfit')).toContainText(xss);
  await expect(page.getByText('<b>Tên</b>')).toBeVisible();
  await expect(page.locator('main img')).toHaveCount(0);
  await expect(page.locator('main script')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  await expect(page.getByRole('checkbox', { name: 'Kèm câu trả lời từng câu' })).toHaveCount(0);
});

test('import từ chối version lạ, file hỏng và file quá 1 MB với lỗi rõ', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: /Tôi hiểu/ }).check();
  await page.getByText('Đã có báo cáo được xuất trước đó?').click();

  await importText(page, 'v2.json', JSON.stringify({ schema: 'disc-coaching-lab/report', schemaVersion: 2 }));
  await expect(page.getByRole('alert')).toContainText('chưa được hỗ trợ');

  await importText(page, 'hong.json', '{ không phải json');
  await expect(page.getByRole('alert')).toContainText('không phải JSON hợp lệ');

  await importText(page, 'lon.json', Buffer.alloc(1024 * 1024 + 10, 0x20));
  await expect(page.getByRole('alert')).toContainText('1 MB');

  await importText(
    page,
    'proto.json',
    '{"schema":"disc-coaching-lab/report","schemaVersion":1,"__proto__":{"polluted":true}}',
  );
  await expect(page.getByRole('alert')).toContainText('không được phép');
  expect(await page.evaluate(() => ({} as Record<string, unknown>).polluted)).toBeUndefined();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hiểu cách bạn thường hành động');
});
