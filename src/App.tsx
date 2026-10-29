import { useEffect, useState } from 'react';
import { AchievementGallery } from './components/achievements/AchievementGallery';
import { AchievementUnlock } from './components/achievements/AchievementUnlock';
import { CaseBoard } from './components/CaseBoard';
import { ChapterMap } from './components/ChapterMap';
import { DataExportPanel } from './components/DataExportPanel';
import { DialogueScene } from './components/DialogueScene';
import { EndingScreen } from './components/EndingScreen';
import { MaterialsPanel } from './components/MaterialsPanel';
import { Onboarding } from './components/Onboarding';
import { Paywall } from './components/Paywall';
import { PostTest } from './components/PostTest';
import { QuizScreen } from './components/QuizScreen';
import { ScenarioTest } from './components/ScenarioTest';
import { StartScreen } from './components/StartScreen';
import { StatsBar } from './components/StatsBar';
import { setSoundMuted } from './lib/sound';
import { useGameStore } from './store/gameStore';
import type { AccessStatus } from './utils/accessControl';

function App() {
  const {
    phase,
    setAccessStatus,
    continueFromPaywall,
    pendingAchievementQueue,
    dismissAchievement,
    showAchievementGallery,
    toggleAchievementGallery,
    achievementUnlocks,
  } = useGameStore();
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated());
  const isDev = import.meta.env.DEV;
  const showDevPanel = import.meta.env.VITE_SHOW_DEV_PANEL === 'true';
  const canShowDataPanel = isDev || showDevPanel;
  const demoBadge = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('demo') === 'badge';
  const unlockId = demoBadge ? 'cool-head' : pendingAchievementQueue[0];

  useEffect(() => {
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    if (useGameStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated) setSoundMuted(useGameStore.getState().soundMuted);
  }, [hydrated]);

  useEffect(() => {
    if (!canShowDataPanel) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDataPanel((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canShowDataPanel]);

  if (!hydrated) {
    return <div className="min-h-screen flex items-center justify-center">Восстанавливаем прогресс...</div>;
  }

  return (
    <>
      <div className="gradient-bg" />
      {phase !== 'landing' && phase !== 'ending' && phase !== 'paywall' && <StatsBar />}
      {phase !== 'paywall' && <MaterialsPanel />}
      {showDataPanel && canShowDataPanel && <DataExportPanel onClose={() => setShowDataPanel(false)} />}

      <div className="relative z-10">
        {phase === 'landing' && <StartScreen />}
        {phase === 'onboarding' && <Onboarding />}
        {phase === 'chapterMap' && <ChapterMap />}
        {phase === 'caseBoard' && <CaseBoard />}
        {phase === 'dialogue' && <DialogueScene />}
        {phase === 'quiz' && <QuizScreen />}
        {phase === 'scenarioTest' && <ScenarioTest />}
        {phase === 'postTest' && <PostTest />}
        {phase === 'ending' && <EndingScreen />}
        {phase === 'paywall' && (
          <Paywall
            onAccessGranted={(status: AccessStatus) => {
              setAccessStatus(status);
              continueFromPaywall();
            }}
            onClose={() => useGameStore.setState({ phase: 'chapterMap', pendingLevel: null })}
          />
        )}
      </div>

      {unlockId && (
        <AchievementUnlock
          achievementId={unlockId}
          replay={demoBadge}
          onClose={() => {
            if (demoBadge) {
              const url = new URL(window.location.href);
              url.searchParams.delete('demo');
              window.history.replaceState({}, '', url);
            }
            dismissAchievement();
          }}
        />
      )}
      {showAchievementGallery && (
        <AchievementGallery unlocks={achievementUnlocks} onClose={toggleAchievementGallery} />
      )}
    </>
  );
}

export default App;
