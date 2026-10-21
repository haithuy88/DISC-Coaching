/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL /exec của Google Apps Script web app; để trống = chế độ chạy thử */
  readonly VITE_SUBMIT_URL?: string;
}
