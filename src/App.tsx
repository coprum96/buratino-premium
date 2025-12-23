import { useEffect } from 'react';
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
import type { AccessStatus } from './utils/accessControl';

function App() {
  const { phase, setAccessStatus, continueFromPaywall } = useGameStore();
  
  useEffect(() => {
    // Set initial gradient background
    document.body.style.minHeight = '100vh';
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

