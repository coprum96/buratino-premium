import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function StartScreen() {
  const { setPhase, incrementCitizensCount } = useGameStore();
  const [victimCount, setVictimCount] = useState(13495302);
  
  useEffect(() => {
    // Increment victim counter every 2.5 seconds
    const timer = setInterval(() => {
      setVictimCount(prev => prev + 1);
    }, 2500);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleStart = () => {
    incrementCitizensCount();
    setPhase('chapterMap');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-5">
        <div className="text-center mb-6">
          <img 
            src="/img/character_buratino_happy.png" 
            alt="Buratino" 
            className="w-48 h-auto mx-auto rounded-2xl shadow-2xl animate-float"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-shadow-glow animate-float">
          🔍 Золотой Детектор
        </h1>
        
        <p className="text-2xl mb-12 opacity-90">
          Защита от финансового мошенничества
        </p>
        
        <div className="mb-8 p-6 bg-danger/20 backdrop-blur-lg rounded-2xl border-2 border-danger/50 animate-pulse">
          <div className="text-2xl font-bold mb-3">⚠️ ЖЕРТВ ФИНАНСОВОГО МОШЕННИЧЕСТВА:</div>
          <div className="text-6xl font-bold text-danger" style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.8)' }}>
            {victimCount.toLocaleString('ru-RU')}
          </div>
          <div className="text-sm mt-3 opacity-80">
            +1 каждые 2.5 секунды
          </div>
        </div>
        
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
          Присоединяйся к приключению Буратино! Научись распознавать финансовое мошенничество 
          и защищать свои деньги от хитрых мошенников.
        </p>
        
        <button 
          className="btn btn-primary text-xl"
          onClick={handleStart}
        >
          ✨ Начать приключение
        </button>
      </div>
    </div>
  );
}

