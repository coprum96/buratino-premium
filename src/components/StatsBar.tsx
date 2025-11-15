import { useGameStore } from '../store/gameStore';

export function StatsBar() {
  const { coins, wisdom } = useGameStore();
  
  return (
    <div className="fixed top-5 right-5 flex flex-col md:flex-row gap-4 z-50">
      <div id="coinStat" className="bg-white/15 backdrop-blur-lg px-5 py-3 rounded-xl border border-white/20 flex items-center gap-2 text-lg font-semibold shadow-lg hover:scale-105 transition-transform cursor-pointer">
        <img 
          src="/img/item_gold_coins_5.png" 
          alt="coins" 
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const emoji = document.createElement('span');
            emoji.textContent = '🪙';
            emoji.className = 'text-2xl';
            e.currentTarget.parentElement?.insertBefore(emoji, e.currentTarget);
          }}
        />
        <span>{coins}</span>
      </div>
      
      <div className="bg-white/15 backdrop-blur-lg px-5 py-3 rounded-xl border border-white/20 shadow-lg">
        <div className="flex items-center gap-2 text-lg font-semibold mb-2">
          <span>💡</span>
          <span>{wisdom}%</span>
        </div>
        <div className="w-24 h-2 bg-black/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-success to-green-400 rounded-full transition-all duration-1000"
            style={{ 
              width: `${wisdom}%`,
              boxShadow: '0 0 10px #10B981'
            }}
          />
        </div>
      </div>
    </div>
  );
}

