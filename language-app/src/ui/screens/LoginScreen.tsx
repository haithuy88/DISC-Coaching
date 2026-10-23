import { useState } from 'react';

export function LoginScreen({ onLogin }: { onLogin: (code: string) => Promise<void> }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onLogin(code.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <header className="hero">
        <h1>Học ngoại ngữ thực chiến</h1>
        <p>Học theo level và chuyên ngành, luyện đủ Nghe – Nói – Đọc – Viết, rồi hội thoại với AI trong tình huống thật.</p>
      </header>
      <form className="card" onSubmit={submit}>
        <h3>Nhập mã truy cập</h3>
        <p className="muted small">Mã do quản trị cấp, dạng LS-XXXXXX. Chỉ cần nhập một lần trên mỗi máy.</p>
        <input
          className="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="LS-XXXXXX"
          autoCapitalize="characters"
          autoComplete="off"
          aria-label="Mã truy cập"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={busy || code.trim().length < 4}>
          {busy ? 'Đang kiểm tra…' : 'Vào học'}
        </button>
      </form>
    </section>
  );
}
