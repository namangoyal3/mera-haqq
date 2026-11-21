import { useState } from 'react';
import type { Profile } from './types';
import { UI, type Lang } from './i18n';
import Intake from './components/Intake';
import LangToggle from './components/LangToggle';
import Results from './components/Results';
import Tracker, { addToTracker } from './components/Tracker';

type Screen = 'intake' | 'results' | 'tracker';

export default function App() {
  const [lang, setLang] = useState<Lang>('hi');
  const [screen, setScreen] = useState<Screen>('intake');
  // Profile is held in memory only (not persisted).
  const [profile, setProfile] = useState<Profile>({});

  const t = UI[lang];

  function handleIntakeDone(p: Profile) {
    setProfile(p);
    setScreen('results');
  }

  function startOver() {
    setProfile({});
    setScreen('intake');
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#fdf6ec] text-[#2b2118]">
      <header className="flex items-center justify-between gap-3 border-b border-amber-200 bg-white/70 px-4 py-3">
        <h1 className="text-2xl font-bold text-teal-800">{t.appTitle}</h1>
        <div className="flex items-center gap-2">
          {screen !== 'intake' && (
            <button
              type="button"
              onClick={() => setScreen('tracker')}
              className="tap rounded-2xl border border-teal-700 px-3 text-sm font-semibold text-teal-800"
            >
              {lang === 'hi' ? 'मेरे आवेदन' : 'My applications'}
            </button>
          )}
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {screen === 'intake' && (
          <Intake lang={lang} onDone={handleIntakeDone} onLangChange={setLang} />
        )}

        {screen === 'results' && (
          <Results
            profile={profile}
            lang={lang}
            onTrack={(id) => {
              addToTracker(id);
              setScreen('tracker');
            }}
            onStartOver={startOver}
          />
        )}

        {screen === 'tracker' && (
          <Tracker lang={lang} onBack={() => setScreen('results')} />
        )}
      </main>

      <footer className="px-4 py-3 text-center text-sm text-stone-600">
        {t.notOnDeviceNote}
      </footer>
    </div>
  );
}
