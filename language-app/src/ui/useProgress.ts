// Trạng thái người học: lưu tạm trên máy (học tiếp được khi mạng chập chờn) và đồng bộ lên Sheets.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Level } from '../../shared/api';
import { mergeProfiles, newProfile, type LearnerProfile } from '../domain/progress';
import { login as apiLogin, saveProgress } from '../lib/api';

export interface Session {
  code: string;
  name: string;
  group: string;
  /** AI (chấm Nói/Viết, hội thoại) có đang bật không — máy chủ báo khi đăng nhập. */
  aiEnabled: boolean;
  activeLanguage?: string;
  profiles: Record<string, LearnerProfile>;
}

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';

const STORAGE_KEY = 'polyglot-session-v1';
const SYNC_DELAY_MS = 2000;

function loadSession(): Session | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : undefined;
  } catch {
    return undefined;
  }
}

function storeSession(session: Session | undefined): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Không lưu được trên máy thì vẫn dùng tiếp trong phiên hiện tại.
  }
}

export function useProgress() {
  const [session, setSession] = useState<Session | undefined>(loadSession);
  const [sync, setSync] = useState<SyncState>('idle');
  /** Ngôn ngữ có thay đổi chưa đẩy lên Sheets. */
  const dirty = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => storeSession(session), [session]);

  const flush = useCallback(async (s: Session) => {
    const langs = [...dirty.current];
    dirty.current.clear();
    if (langs.length === 0) return;
    setSync('saving');
    try {
      for (const lang of langs) {
        const p = s.profiles[lang];
        if (p) await saveProgress(s.code, p);
      }
      setSync('saved');
    } catch {
      langs.forEach((l) => dirty.current.add(l));
      setSync('error');
    }
  }, []);

  useEffect(() => {
    if (!session || dirty.current.size === 0) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(session), SYNC_DELAY_MS);
    return () => clearTimeout(timer.current);
  }, [session, flush]);

  const login = useCallback(async (code: string) => {
    const result = await apiLogin(code);
    const previous = loadSession();
    const local = previous?.code === code.toUpperCase() ? previous.profiles : {};
    const profiles = mergeProfiles(local, result.profiles);
    // Bản trên máy mới hơn thì đẩy lại lên Sheets.
    for (const [lang, p] of Object.entries(profiles)) if (p !== result.profiles[lang]) dirty.current.add(lang);
    setSession({
      code: code.toUpperCase(),
      name: result.name,
      group: result.group,
      aiEnabled: result.aiEnabled,
      activeLanguage: previous?.activeLanguage,
      profiles,
    });
  }, []);

  // Mỗi lần mở app, hỏi lại máy chủ: cập nhật trạng thái AI (quản trị có thể vừa bật) và tiến độ từ máy khác.
  // Mất mạng thì vẫn học tiếp bằng dữ liệu trên máy.
  useEffect(() => {
    const saved = loadSession();
    if (saved) login(saved.code).catch(() => undefined);
  }, [login]);

  const logout = useCallback(() => {
    setSession(undefined);
    dirty.current.clear();
  }, []);

  const selectLanguage = useCallback((language: string | undefined) => {
    setSession((s) => s && { ...s, activeLanguage: language });
  }, []);

  const startProfile = useCallback((language: string, level: Level, placement?: LearnerProfile['placement']) => {
    setSession((s) => {
      if (!s) return s;
      const existing = s.profiles[language] ?? newProfile(language, level);
      dirty.current.add(language);
      return { ...s, activeLanguage: language, profiles: { ...s.profiles, [language]: { ...existing, level, placement } } };
    });
  }, []);

  const updateProfile = useCallback((update: (p: LearnerProfile) => LearnerProfile) => {
    setSession((s) => {
      const lang = s?.activeLanguage;
      const current = lang ? s.profiles[lang] : undefined;
      if (!s || !lang || !current) return s;
      const next = update(current);
      if (next === current) return s;
      dirty.current.add(lang);
      return { ...s, profiles: { ...s.profiles, [lang]: next } };
    });
  }, []);

  const profile = session?.activeLanguage ? session.profiles[session.activeLanguage] : undefined;
  return { session, profile, sync, login, logout, selectLanguage, startProfile, updateProfile, retrySync: () => session && flush(session) };
}
