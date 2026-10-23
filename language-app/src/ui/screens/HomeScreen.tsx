import { LANGUAGES } from '../../../shared/languages';
import type { ProgressState } from '../../domain/progress';

export function HomeScreen({ state, onPick }: { state: ProgressState; onPick: (code: string) => void }) {
  return (
    <section>
      <header className="hero">
        <h1>Học ngoại ngữ thực chiến</h1>
        <p>Học theo level và chuyên ngành, luyện đủ Nghe – Nói – Đọc – Viết, rồi hội thoại với AI trong tình huống thật.</p>
      </header>
      <h2>Chọn ngôn ngữ</h2>
      <div className="grid">
        {LANGUAGES.map((lang) => {
          const profile = state.profiles[lang.code];
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
    </section>
  );
}
