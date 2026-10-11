import { useId, useRef, useState } from 'react';
import { MAX_IMPORT_BYTES, parseReport } from '../../domain/report';
import type { AppApi } from '../useAppState';

/** Nhập báo cáo chỉ khi người dùng tự chọn file. Nội dung được kiểm tra; text luôn hiển thị dạng thuần. */
export function ImportReport({ api }: { api: AppApi }) {
  const inputId = useId();
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErrors([]);
    try {
      if (file.size > MAX_IMPORT_BYTES) {
        setErrors(['File vượt quá giới hạn 1 MB.']);
        return;
      }
      const text = await file.text();
      const result = parseReport(text, file.size);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      api.applyImport(result.session, result.info, text);
    } catch {
      setErrors(['Không đọc được file.']);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  return (
    <div className="import">
      <label htmlFor={inputId} className="field-label">
        Mở báo cáo JSON đã xuất (tối đa 1 MB)
      </label>
      <input
        id={inputId}
        type="file"
        accept="application/json,.json"
        className="file-input"
        disabled={busy}
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {errors.length > 0 && (
        <div className="notice notice-error" role="alert" tabIndex={-1} ref={errorRef}>
          <p>
            <strong>Không nhập được báo cáo.</strong>
          </p>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
