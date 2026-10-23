import { useCallback, useEffect, useState } from 'react';
import type { Level } from '../../shared/api';
import { loadProgress, newProfile, saveProgress, type LearnerProfile, type ProgressState } from '../domain/progress';

export function useProgress() {
  const [state, setState] = useState<ProgressState>(loadProgress);

  useEffect(() => saveProgress(state), [state]);

  const profile = state.activeLanguage ? state.profiles[state.activeLanguage] : undefined;

  const selectLanguage = useCallback((language: string | undefined) => {
    setState((s) => ({ ...s, activeLanguage: language }));
  }, []);

  const startProfile = useCallback((language: string, level: Level, placement?: LearnerProfile['placement']) => {
    setState((s) => {
      const existing = s.profiles[language] ?? newProfile(language, level);
      return { activeLanguage: language, profiles: { ...s.profiles, [language]: { ...existing, level, placement } } };
    });
  }, []);

  const updateProfile = useCallback((update: (p: LearnerProfile) => LearnerProfile) => {
    setState((s) => {
      const lang = s.activeLanguage;
      const current = lang ? s.profiles[lang] : undefined;
      if (!lang || !current) return s;
      return { ...s, profiles: { ...s.profiles, [lang]: update(current) } };
    });
  }, []);

  return { state, profile, selectLanguage, startProfile, updateProfile };
}
