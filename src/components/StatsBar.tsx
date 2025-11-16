import { useGameStore } from '../store/gameStore';
import { useEffect, useState } from 'react';

export function StatsBar() {
  const { coins, wisdom, completedLevels } = useGameStore();
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinAnimation, setCoinAnimation] = useState(false);
  
  // Coin change animation
  useEffect(() => {
    if (coins !== prevCoins) {
      setCoinAnimation(true);
      setTimeout(() => setCoinAnimation(false), 600);
      setPrevCoins(coins);
    }
  }, [coins, prevCoins]);
  
  const totalLevels = 8;
  const progressPercent = Math.round((completedLevels.length / totalLevels) * 100);
  
  return (
    <div className="fixed top-3 right-3 sm:top-5 sm:right-5 flex flex-col gap-3 sm:gap-4 z-50 max-w-[200px] sm:max-w-none">
      {/* Coins */}
      <div 
        id="coinStat" 
        className={`bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg px-3 sm:px-5 py-2 sm:py-3 rounded-xl border-2 border-yellow-400/30 flex items-center gap-2 text-base sm:text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer ${coinAnimation ? 'animate-bounce' : ''}`}
      >
        {/* Animated SVG Coin */}
        <svg 
          className={`w-7 h-7 sm:w-9 sm:h-9 ${coinAnimation ? 'animate-spin' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#F59E0B" strokeWidth="2"/>
          <circle cx="12" cy="12" r="7" fill="#FBBF24" opacity="0.6"/>
          <path d="M12 6v12M8 9l4-3 4 3M8 15l4 3 4-3" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D"/>
              <stop offset="50%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#D97706"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="text-yellow-100">{coins}</span>
      </div>
      
      {/* Wisdom Progress */}
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg px-3 sm:px-5 py-2 sm:py-3 rounded-xl border-2 border-purple-400/30 shadow-2xl">
        <div className="flex items-center justify-between gap-2 text-base sm:text-lg font-bold mb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl">💡</span>
            <span className="text-purple-100 text-sm sm:text-base">Мудрость</span>
          </div>
          <span className="text-purple-200 text-sm sm:text-lg">{wisdom}%</span>
        </div>
        <div className="w-full h-2 sm:h-3 bg-black/40 rounded-full overflow-hidden border border-purple-500/20">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out relative"
            style={{ 
              width: `${wisdom}%`,
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.8)'
            }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Chapter Progress */}
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg px-3 sm:px-5 py-2 sm:py-3 rounded-xl border-2 border-blue-400/30 shadow-2xl">
        <div className="flex items-center justify-between gap-2 text-base sm:text-lg font-bold mb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl">📚</span>
            <span className="text-blue-100 text-sm sm:text-base">Прогресс</span>
          </div>
          <span className="text-blue-200 text-sm sm:text-lg">{completedLevels.length}/{totalLevels}</span>
        </div>
        <div className="w-full h-2 sm:h-3 bg-black/40 rounded-full overflow-hidden border border-blue-500/20">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
            style={{ 
              width: `${progressPercent}%`,
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)'
            }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

