import { useGameStore } from '../store/gameStore';
import { levels } from '../data/gameData';

export function ChapterMap() {
  const { currentLevel, setPhase, completedLevels } = useGameStore();
  
  const handleChapterClick = (levelIndex: number) => {
    if (levelIndex <= currentLevel) {
      useGameStore.setState({ currentLevel: levelIndex, currentDialogue: 0 });
      setPhase('dialogue');
    }
  };
  
  return (
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-6xl mx-auto px-5">
        <h1 className="text-5xl font-bold mb-12 text-center text-shadow-glow animate-scale-in">
          📚 Карта приключений
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            const isAvailable = index <= currentLevel;
            const isCompleted = completedLevels.includes(level.id);
            const isCurrent = index === currentLevel;
            
            return (
              <div
                key={level.id}
                className={`glass-card cursor-pointer relative overflow-hidden ${
                  !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                } ${isCurrent ? 'ring-4 ring-secondary' : ''}`}
                style={{ 
                  background: isAvailable ? level.gradient : 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={() => handleChapterClick(index)}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-4xl animate-scale-in">
                    ✅
                  </div>
                )}
                
                {isCurrent && !isCompleted && (
                  <div className="absolute top-4 right-4 text-4xl animate-float">
                    ⭐
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">
                    {['🪙', '🎭', '🧮', '🧺', '📊', '🎯', '📋', '🏆'][index]}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">
                    Глава {index + 1}
                  </h3>
                  
                  <h4 className="text-xl mb-2 opacity-90">
                    {level.title}
                  </h4>
                  
                  <p className="text-base opacity-80">
                    {level.subtitle}
                  </p>
                  
                  {!isAvailable && (
                    <div className="mt-4 text-sm opacity-70">
                      🔒 Заблокировано
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="mt-4">
                      <button className="btn btn-primary text-sm">
                        Начать главу
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-xl opacity-90">
            Пройдено глав: {completedLevels.length} из {levels.length}
          </p>
        </div>
      </div>
    </div>
  );
}

