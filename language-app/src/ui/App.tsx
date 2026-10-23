import { useState } from 'react';
import type { Scenario } from '../../shared/api';
import { findLanguage } from '../../shared/languages';
import { getCourse } from '../content';
import { addLessonToReview, answerReview, levelUpReady, recordConversation, recordResult } from '../domain/progress';
import { ChatScreen } from './screens/ChatScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LessonScreen } from './screens/LessonScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PlacementScreen } from './screens/PlacementScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { useProgress, type SyncState } from './useProgress';

type Route =
  | { name: 'home' }
  | { name: 'placement' }
  | { name: 'dashboard' }
  | { name: 'review' }
  | { name: 'lesson'; unitId: string; lessonId: string }
  | { name: 'chat'; scenario: Scenario; back: Route };

const SYNC_LABEL: Record<SyncState, string> = {
  idle: '',
  saving: 'Đang lưu…',
  saved: '✓ Đã lưu',
  error: '⚠ Chưa lưu được — bấm để thử lại',
};

export function App() {
  const { session, profile, sync, login, logout, selectLanguage, startProfile, updateProfile, retrySync } = useProgress();
  const [route, setRoute] = useState<Route>(() => (profile ? { name: 'dashboard' } : { name: 'home' }));
  const language = session?.activeLanguage ? findLanguage(session.activeLanguage) : undefined;

  function goHome() {
    selectLanguage(undefined);
    setRoute({ name: 'home' });
  }

  let screen;
  if (!session) {
    screen = <LoginScreen onLogin={login} />;
  } else if (route.name === 'home' || !language) {
    screen = (
      <HomeScreen
        session={session}
        onLogout={logout}
        onPick={(code) => {
          selectLanguage(code);
          setRoute(session.profiles[code] ? { name: 'dashboard' } : { name: 'placement' });
        }}
      />
    );
  } else if (route.name === 'placement' || !profile) {
    screen = (
      <PlacementScreen
        language={language}
        code={session.code}
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
          code={session.code}
          lesson={lesson}
          profile={profile}
          onOpen={() => updateProfile((p) => addLessonToReview(p, lesson))}
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
        code={session.code}
        scenario={route.scenario}
        onFinished={(score) => updateProfile((p) => recordConversation(p, score))}
        onBack={() => setRoute(route.back)}
      />
    );
  } else if (route.name === 'review') {
    screen = (
      <ReviewScreen
        language={language}
        profile={profile}
        onAnswer={(key, ok) => updateProfile((p) => answerReview(p, key, ok))}
        onBack={() => setRoute({ name: 'dashboard' })}
      />
    );
  } else {
    screen = (
      <DashboardScreen
        language={language}
        profile={profile}
        onOpenLesson={(unitId, lessonId) => setRoute({ name: 'lesson', unitId, lessonId })}
        onChat={(scenario) => setRoute({ name: 'chat', scenario, back: { name: 'dashboard' } })}
        onReview={() => setRoute({ name: 'review' })}
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
        {session && sync !== 'idle' && (
          <button type="button" className={`sync ${sync}`} onClick={() => sync === 'error' && void retrySync()}>
            {SYNC_LABEL[sync]}
          </button>
        )}
      </div>
      <main>{screen}</main>
    </div>
  );
}
