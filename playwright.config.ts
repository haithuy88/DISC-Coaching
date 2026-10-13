import { defineConfig, devices } from '@playwright/test';
import { TEST_SUBMIT_URL } from './tests/e2e/constants';

// E2E chạy trên bản build (vite preview) để giống môi trường thật.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'vi-VN',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 740 }, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    env: { VITE_SUBMIT_URL: TEST_SUBMIT_URL },
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
