// Khai báo tối thiểu cho các dịch vụ Google Apps Script mà backend dùng.

declare namespace GoogleAppsScript {
  interface Range {
    getValues(): unknown[][];
    setValues(values: unknown[][]): Range;
  }
  interface Sheet {
    getName(): string;
    getLastRow(): number;
    getRange(row: number, column: number, numRows: number, numColumns: number): Range;
    setFrozenRows(rows: number): void;
  }
  interface Spreadsheet {
    getSheetByName(name: string): Sheet | null;
    insertSheet(name: string): Sheet;
  }
  interface HttpResponse {
    getResponseCode(): number;
    getContentText(): string;
  }
  interface Properties {
    getProperty(key: string): string | null;
    setProperty(key: string, value: string): void;
    deleteProperty(key: string): void;
    getKeys(): string[];
  }
  interface Lock {
    waitLock(timeoutInMillis: number): void;
    releaseLock(): void;
  }
  interface TextOutput {
    setMimeType(mimeType: string): TextOutput;
  }
  interface Menu {
    addItem(caption: string, functionName: string): Menu;
    addToUi(): void;
  }
}

declare const SpreadsheetApp: {
  getActiveSpreadsheet(): GoogleAppsScript.Spreadsheet;
  getUi(): { createMenu(name: string): GoogleAppsScript.Menu; alert(message: string): void };
};
declare const UrlFetchApp: {
  fetch(
    url: string,
    params: { method: 'post'; contentType: string; headers: Record<string, string>; payload: string; muteHttpExceptions: boolean },
  ): GoogleAppsScript.HttpResponse;
};
declare const PropertiesService: { getScriptProperties(): GoogleAppsScript.Properties };
declare const LockService: { getScriptLock(): GoogleAppsScript.Lock };
declare const ContentService: {
  MimeType: { JSON: string };
  createTextOutput(content: string): GoogleAppsScript.TextOutput;
};
declare const Utilities: {
  formatDate(date: Date, timeZone: string, format: string): string;
  getUuid(): string;
};
