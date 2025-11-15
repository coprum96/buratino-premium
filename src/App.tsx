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

function App() {
  const { phase } = useGameStore();
  
  useEffect(() => {
    // Set initial gradient background
    document.body.style.minHeight = '100vh';
  }, []);
  
  return (
    <>
      {/* Gradient Background */}
      <div className="gradient-bg" />
      
      {/* Stats Bar - показываем везде кроме landing и ending */}
      {phase !== 'landing' && phase !== 'ending' && <StatsBar />}
      
      {/* Materials Panel */}
      <MaterialsPanel />
      
      {/* Main Content */}
      <div className="relative z-10">
        {phase === 'landing' && <StartScreen />}
        {phase === 'chapterMap' && <ChapterMap />}
        {phase === 'dialogue' && <DialogueScene />}
        {phase === 'quiz' && <QuizScreen />}
        {phase === 'scenarioTest' && <ScenarioTest />}
        {phase === 'postTest' && <PostTest />}
        {phase === 'ending' && <EndingScreen />}
      </div>
    </>
  );
}

export default App;

