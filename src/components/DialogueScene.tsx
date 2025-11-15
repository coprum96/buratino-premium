import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { levels, characters } from '../data/gameData';
import { createParticleBurst } from '../utils/particles';

export function DialogueScene() {
  const { currentLevel, currentDialogue, addWisdom, addCoins, setCurrentDialogue, setPhase, completeLevel } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  
  const level = levels[currentLevel];
  const dialogue = level?.dialogues[currentDialogue];
  
  useEffect(() => {
    if (!dialogue) return;
    
    // Typewriter effect
    setIsTyping(true);
    setShowChoices(false);
    setDisplayedText('');
    
    let currentIndex = 0;
    const text = dialogue.text;
    const speed = 30;
    
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowChoices(true);
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [dialogue]);
  
  if (!level || !dialogue) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl">Загрузка...</p>
    </div>;
  }
  
  const character = characters[dialogue.character];
  
  const handleChoice = (choice: any) => {
    if (choice.wisdom) {
      addWisdom(choice.wisdom);
      if (choice.wisdom > 0) {
        createParticleBurst('✨', 5);
      }
    }
    
    if (choice.coins) {
      addCoins(choice.coins);
      if (choice.coins < 0) {
        createParticleBurst('💔', 5);
      }
    }
    
    setTimeout(() => {
      if (choice.nextLevel) {
        completeLevel(currentLevel);
        setPhase('quiz');
      } else if (choice.nextPhase === 'posttest') {
        setPhase('postTest');
      } else if (choice.next !== undefined) {
        setCurrentDialogue(choice.next);
      } else {
        const nextDialogueIndex = currentDialogue + 1;
        if (nextDialogueIndex < level.dialogues.length) {
          setCurrentDialogue(nextDialogueIndex);
        } else {
          if (level.quiz.length > 0) {
            setPhase('quiz');
          } else {
            completeLevel(currentLevel);
            useGameStore.getState().nextLevel();
          }
        }
      }
    }, 500);
  };
  
  return (
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-4xl mx-auto px-5">
        {/* Character Display */}
        <div className="text-center mb-6 animate-slide-in-top">
          {character.image ? (
            <img 
              src={`/img/${character.image}`}
              alt={character.name}
              className="w-full max-w-xs mx-auto rounded-xl shadow-2xl mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const emoji = document.createElement('div');
                emoji.textContent = character.emoji;
                emoji.className = 'text-8xl animate-float';
                e.currentTarget.parentElement?.insertBefore(emoji, e.currentTarget);
              }}
            />
          ) : (
            <div className="text-8xl mb-4 animate-float filter drop-shadow-lg">
              {character.emoji}
            </div>
          )}
          <div className="text-3xl font-bold text-shadow">
            {character.name}
          </div>
        </div>
        
        {/* Dialogue Box */}
        <div className="glass-card mb-8 animate-slide-in-bottom">
          <div className="text-xl leading-relaxed min-h-[100px] whitespace-pre-line">
            {displayedText}
            {isTyping && <span className="animate-pulse">▋</span>}
          </div>
          
          {/* Red Flags */}
          {dialogue.redFlags && !isTyping && (
            <div className="mt-6 p-5 bg-danger/20 border-2 border-danger/40 rounded-xl">
              <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                🚩 Красные флажки:
              </div>
              <div className="space-y-2">
                {dialogue.redFlags.map((flag, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    🚩 {flag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Choices */}
        {showChoices && (
          <div className="space-y-4 animate-slide-in-bottom">
            {dialogue.choices.map((choice, index) => (
              <button
                key={index}
                className="w-full p-5 text-lg text-left flex items-center gap-3 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-xl hover:bg-white/25 hover:translate-x-2 hover:scale-105 transition-all shadow-lg"
                onClick={() => handleChoice(choice)}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span className="text-3xl flex-shrink-0">{choice.icon}</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

