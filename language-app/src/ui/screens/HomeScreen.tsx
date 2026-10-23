import { LANGUAGES } from '../../../shared/languages';
import type { Session } from '../useProgress';

export function HomeScreen({ session, onPick, onLogout }: { session: Session; onPick: (code: string) => void; onLogout: () => void }) {
  return (
    <section>
      <header className="hero">
        <h1>Chào {session.name} 👋</h1>
        <p>Chọn ngôn ngữ để học tiếp hoặc bắt đầu ngôn ngữ mới.</p>
      </header>
      <div className="grid">
        {LANGUAGES.map((lang) => {
          const profile = session.profiles[lang.code];
          return (
            <button key={lang.code} type="button" className="card tile" onClick={() => onPick(lang.code)}>
              <span className="flag">{lang.flag}</span>
              <strong>{lang.nameVi}</strong>
              <span className="muted small">
                {profile ? `Đang học ${profile.level} · ${profile.xp} XP` : lang.hasCourse ? 'Có giáo trình + AI' : 'Luyện với AI'}
              </span>
            </button>
          );
        })}
      </div>
      <p className="muted small">
        Mã truy cập: {session.code} ·{' '}
        <button type="button" className="link" onClick={onLogout}>
          Đăng xuất
        </button>
      </p>
    </section>
  );
}
