import { useGameStore } from '../store/gameStore';
import { FaSearch, FaExclamationTriangle, FaPlay } from 'react-icons/fa';

export function StartScreen() {
  const { setPhase, incrementCitizensCount, victimCount } = useGameStore();
  
  const handleStart = () => {
    incrementCitizensCount();
    setPhase('chapterMap');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="container max-w-5xl mx-auto text-center">
        {/* Character Image */}
        <div className="mb-6 sm:mb-8">
          <img 
            src="/img/character_buratino_happy.png" 
            alt="Buratino" 
            className="w-32 h-auto sm:w-40 md:w-48 mx-auto rounded-2xl shadow-2xl animate-float"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 text-shadow-glow animate-float px-2 flex items-center justify-center gap-3 sm:gap-4">
          <FaSearch className="text-yellow-400" />
          Золотой Детектор
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12 opacity-90 px-4">
          Защита от финансового мошенничества
        </p>
        
        {/* Victim Counter */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 md:p-6 bg-danger/20 backdrop-blur-lg rounded-2xl border-2 border-danger/50 animate-pulse max-w-3xl mx-auto">
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 px-2 flex items-center justify-center gap-2">
            <FaExclamationTriangle className="text-danger animate-pulse" />
            ЖЕРТВ ФИНАНСОВОГО МОШЕННИЧЕСТВА В РФ:
          </div>
          <div 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-danger" 
            style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.8)' }}
          >
            {victimCount.toLocaleString('ru-RU')}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4 leading-relaxed">
          Присоединяйся к приключению Буратино! Научись распознавать финансовое мошенничество 
          и защищать свои деньги от хитрых мошенников.
        </p>
        
        {/* Start Button */}
        <button 
          className="btn btn-primary text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 mx-auto"
          onClick={handleStart}
        >
          <FaPlay />
          Начать приключение
        </button>
      </div>
    </div>
  );
}

