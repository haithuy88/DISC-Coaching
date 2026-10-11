import { useId, useState } from 'react';
import type { AppApi } from '../useAppState';

export function PrivacyPanel({ api }: { api: AppApi }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="privacy">
      <button
        type="button"
        className="btn btn-ghost btn-small"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Quyền riêng tư{api.state.saveOnDevice ? ' · đang lưu' : ''}
      </button>
      {open && (
        <div id={panelId} className="privacy-panel card" role="region" aria-label="Cài đặt quyền riêng tư">
          <PrivacyControls api={api} />
        </div>
      )}
    </div>
  );
}

export function PrivacyControls({ api }: { api: AppApi }) {
  const [confirming, setConfirming] = useState(false);
  const warnId = useId();
  return (
    <div className="privacy-controls">
      <p className="muted">
        Mặc định, dữ liệu chỉ nằm trong bộ nhớ của tab này và sẽ mất khi bạn tải lại hoặc đóng trang. Ứng dụng không
        gửi câu trả lời qua mạng và không dùng analytics.
      </p>
      <label className="check">
        <input
          type="checkbox"
          checked={api.state.saveOnDevice}
          aria-describedby={warnId}
          onChange={(e) => api.setSaveOnDevice(e.target.checked)}
        />
        <span>Lưu trên thiết bị này</span>
      </label>
      <p id={warnId} className="notice notice-warn">
        Chỉ bật trên thiết bị cá nhân. Trên máy dùng chung, người khác có thể mở lại trình duyệt và xem câu trả lời của
        bạn. Tắt tùy chọn này sẽ xóa bản lưu trên thiết bị.
      </p>
      {api.saveError && api.state.saveOnDevice && (
        <p className="notice notice-error" role="alert">
          Trình duyệt không cho phép lưu (có thể do chế độ riêng tư). Dữ liệu vẫn chỉ nằm trong bộ nhớ tab.
        </p>
      )}
      {!confirming ? (
        <button type="button" className="btn btn-danger btn-small" onClick={() => setConfirming(true)}>
          Xóa toàn bộ dữ liệu
        </button>
      ) : (
        <div className="confirm" role="group" aria-label="Xác nhận xóa dữ liệu">
          <p>Xóa mọi câu trả lời, ghi chú, kế hoạch và bản lưu trên thiết bị? Không thể hoàn tác.</p>
          <div className="actions">
            <button
              type="button"
              className="btn btn-danger btn-small"
              onClick={() => {
                setConfirming(false);
                api.clearAll();
              }}
            >
              Xác nhận xóa
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirming(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
