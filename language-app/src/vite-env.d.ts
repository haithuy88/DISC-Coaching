/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL /exec của Apps Script web app. Để trống khi dev (dùng /api của tools/dev-api.ts). */
  readonly VITE_API_URL?: string;
}
