import { useState } from 'react';
import type { Scenario } from '../../shared/api';
import { findLanguage } from '../../shared/languages';
import { getCourse } from '../content';
import { recordConversation, recordResult, levelUpReady } from '../domain/progress';
import { ChatScreen } from './screens/ChatScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LessonScreen } from './screens/LessonScreen';
import { PlacementScreen } from './screens/PlacementScreen';
import { useProgress } from './useProgress';

type Route =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'dashboard' }
  | { name: 'lesson'; unitId: string; lessonId: string }
  | { name: 'chat'; scenario: Scenario; back: Route };

export function App() {
  const { state, profile, selectLanguage, startProfile, updateProfile } = useProgress();
  const [route, setRoute] = useState<Route>(() => (profile ? { name: 'dashboard' } : { name: 'home' }));
  const language = state.activeLanguage ? findLanguage(state.activeLanguage) : undefined;

  function goHome() {
    selectLanguage(undefined);
    setRoute({ name: 'home' });
  }

  let screen;
  if (route.name === 'home' || !language) {
    screen = (
      <HomeScreen
        state={state}
        onPick={(code) => {
          selectLanguage(code);
          setRoute(state.profiles[code] ? { name: 'dashboard' } : { name: 'placement' });
        }}
      />
    );
  } else if (route.name === 'placement' || !profile) {
    screen = (
      <PlacementScreen
        language={language}
        onBack={profile ? () => setRoute({ name: 'dashboard' }) : goHome}
        onDone={(level, placement) => {
          startProfile(language.code, level, placement && { at: new Date().toISOString(), ...placement });
          setRoute({ name: 'dashboard' });
        }}
      />
    );
  } else if (route.name === 'lesson') {
    const unit = getCourse(language.code)?.units.find((u) => u.id === route.unitId);
    const lesson = unit?.lessons.find((l) => l.id === route.lessonId);
    screen =
      unit && lesson ? (
        <LessonScreen
          language={language}
          level={unit.level}
          lesson={lesson}
          profile={profile}
          onResult={(id, skill, score) => updateProfile((p) => recordResult(p, id, skill, score))}
          onRoleplay={(scenario) => setRoute({ name: 'chat', scenario, back: route })}
          onBack={() => setRoute({ name: 'dashboard' })}
        />
      ) : null;
  } else if (route.name === 'chat') {
    screen = (
      <ChatScreen
        language={language}
        level={profile.level}
        scenario={route.scenario}
        onFinished={(score) => updateProfile((p) => recordConversation(p, score))}
        onBack={() => setRoute(route.back)}
      />
    );
  } else {
    screen = (
      <DashboardScreen
        language={language}
        profile={profile}
        onOpenLesson={(unitId, lessonId) => setRoute({ name: 'lesson', unitId, lessonId })}
        onChat={(scenario) => setRoute({ name: 'chat', scenario, back: { name: 'dashboard' } })}
        onRetest={() => setRoute({ name: 'placement' })}
        onLevelUp={() =>
          updateProfile((p) => {
            const next = levelUpReady(p, getCourse(language.code));
            return next ? { ...p, level: next } : p;
          })
        }
        onBack={goHome}
      />
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <button type="button" className="brand" onClick={goHome}>
          Polyglot<span>Practice</span>
        </button>
      </div>
      <main>{screen}</main>
    </div>
  );
}
