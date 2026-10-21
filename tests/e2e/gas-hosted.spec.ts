import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { loadGas } from '../unit/gas-harness';
import { answerAll, clearerD } from './helpers';

// Mô phỏng trang do Apps Script phục vụ: nạp apps-script/Index.html và nối google.script.run tới Code.gs trên bảng tính giả.
test('Index.html chạy như trong Apps Script: gửi qua google.script.run và ghi vào Sheet', async ({ page }) => {
  const gas = loadGas();
  gas.setup();
  await page.exposeFunction('__gasSubmit', (text: string) => gas.submitSurvey(text));
  await page.addInitScript(() => {
    const w = window as unknown as { __gasSubmit: (t: string) => Promise<unknown>; google: unknown };
    const make = () => {
      let ok: (v: unknown) => void = () => undefined;
      let fail: (e: unknown) => void = () => undefined;
      const run = {
        withSuccessHandler(fn: (v: unknown) => void) { ok = fn; return run; },
        withFailureHandler(fn: (e: unknown) => void) { fail = fn; return run; },
        submitSurvey(text: string) { w.__gasSubmit(text).then(ok, fail); },
      };
      return run;
    };
    w.google = { script: { get run() { return make(); } } };
  });
  const html = readFileSync('apps-script/Index.html', 'utf8');
  await page.route('https://gas.test/exec', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.goto('https://gas.test/exec');

  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await page.getByLabel(/Họ và tên/).fill('Trưởng Phòng Thử');
  await page.getByLabel(/Phòng ban/).selectOption('Phòng Thu Mua');
  await page.getByLabel(/Chức danh/).selectOption('Trưởng phòng');
  await page.getByRole('checkbox', { name: /Tôi đồng ý/ }).check();
  await page.getByRole('button', { name: 'Bắt đầu khảo sát' }).click();
  await answerAll(page, clearerD);
  await expect(page.getByTestId('demo-mode')).toHaveCount(0);
  await page.getByRole('button', { name: 'Gửi cho coach và xem kết quả' }).click();
  await expect(page.getByTestId('sync-status')).toHaveAttribute('data-status', 'synced');
  await expect(page.getByTestId('score-D')).toHaveText('100');
  const rows = gas.ss.tab('KET_QUA').rows.slice(1);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toContain('Trưởng Phòng Thử');
});
