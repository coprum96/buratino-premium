import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { StartScreen } from './components/StartScreen';
import { ChapterMap } from './components/ChapterMap';
import { DialogueScene } from './components/DialogueScene';
import { QuizScreen } from './components/QuizScreen';
import { ScenarioTest } from './components/ScenarioTest';
import { PostTest } from './components/PostTest';
import { EndingScreen } from './components/EndingScreen';
import { StatsBar } from './components/StatsBar';
import { MaterialsPanel } from './components/MaterialsPanel';
import { Paywall } from './components/Paywall';
import { DataExportPanel } from './components/DataExportPanel';
import type { AccessStatus } from './utils/accessControl';

function App() {
  const { phase, setAccessStatus, continueFromPaywall } = useGameStore();
  const [showDataPanel, setShowDataPanel] = useState(false);
  
  useEffect(() => {
    // Set initial gradient background
    document.body.style.minHeight = '100vh';
  }, []);
  
  // Keyboard shortcut for data export panel (Ctrl+Shift+D or Cmd+Shift+D)
  // Доступна только в development режиме
  useEffect(() => {
    // Показываем панель только в DEV режиме или если явно указано в .env
    const isDev = import.meta.env.DEV;
    const showDevPanel = import.meta.env.VITE_SHOW_DEV_PANEL === 'true';
    
    if (!isDev && !showDevPanel) {
      return; // В продакшене панель недоступна
    }
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDataPanel(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Global victim counter - always running
  useEffect(() => {
    const timer = setInterval(() => {
      useGameStore.setState((state) => ({
        victimCount: state.victimCount + 1
      }));
    }, 2500); // Every 2.5 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  const handleAccessGranted = (status: AccessStatus) => {
    setAccessStatus(status);
    continueFromPaywall();
  };

  const handlePaywallClose = () => {
    // Вернуться к карте глав без продолжения игры
    useGameStore.setState({ phase: 'chapterMap', pendingLevel: null });
  };

  return (
    <>
      {/* Gradient Background */}
      <div className="gradient-bg" />
      
      {/* Stats Bar - показываем везде кроме landing, ending и paywall */}
      {phase !== 'landing' && phase !== 'ending' && phase !== 'paywall' && <StatsBar />}
      
      {/* Materials Panel - скрываем на paywall */}
      {phase !== 'paywall' && <MaterialsPanel />}
      
      {/* Data Export Panel (только в DEV режиме) */}
      {showDataPanel && import.meta.env.DEV && (
        <DataExportPanel onClose={() => setShowDataPanel(false)} />
      )}
      
      {/* Main Content */}
      <div className="relative z-10">
        {phase === 'landing' && <StartScreen />}
        {phase === 'chapterMap' && <ChapterMap />}
        {phase === 'dialogue' && <DialogueScene />}
        {phase === 'quiz' && <QuizScreen />}
        {phase === 'scenarioTest' && <ScenarioTest />}
        {phase === 'postTest' && <PostTest />}
        {phase === 'ending' && <EndingScreen />}
        {phase === 'paywall' && (
          <Paywall 
            onAccessGranted={handleAccessGranted}
            onClose={handlePaywallClose}
          />
        )}
      </div>
    </>
  );
}

export default App;

