import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { levels } from '../data/gameData';
import { createParticleBurst } from '../utils/particles';

export function QuizScreen() {
  const { currentLevel, addWisdom, completeLevel } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const level = levels[currentLevel];
  const questions = level?.quiz || [];
  const question = questions[currentQuestion];
  
  // ПОЛНЫЙ СБРОС состояния при смене вопроса
  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [currentQuestion]);
  
  if (!level || questions.length === 0) {
    handleComplete();
    return null;
  }
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      if (question.reward) {
        addWisdom(question.reward);
      }
      createParticleBurst('✨', 5);
    }
    
    setShowExplanation(true);
    
    // Увеличено время с 3000 до 5000ms (5 секунд)
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    }, 5000);
  };
  
  function handleComplete() {
    completeLevel(currentLevel);
    useGameStore.getState().nextLevel();
  }
  
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen pt-28 pb-10 flex items-center justify-center">
        <div className="container max-w-2xl mx-auto px-5">
          <div className="glass-card text-center animate-scale-in">
            <h2 className="text-4xl font-bold mb-6">Результаты теста</h2>
            <div className="text-7xl mb-6">📊</div>
            <p className="text-3xl mb-4">
              Правильных ответов: {score} из {questions.length}
            </p>
            <p className="text-2xl mb-6">{percentage}%</p>
            
            <div className="text-2xl p-4 bg-primary/30 rounded-xl mb-8">
              {percentage >= 80 ? '🏆 Отлично!' : percentage >= 60 ? '🎯 Хорошо!' : '📚 Продолжай учиться!'}
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-10 flex items-center justify-center">
      <div className="container max-w-3xl mx-auto px-4 sm:px-5">
        <div key={currentQuestion} className="glass-card animate-scale-in">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 break-words">Проверка знаний</h2>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-80">
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>
          
          <h3 className="text-lg sm:text-2xl mb-6 sm:mb-8 leading-relaxed break-words word-wrap">
            {question.text}
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
              const showStatus = selectedAnswer !== null;
              
              let bgColor = 'bg-white/15';
              if (showStatus) {
                if (isSelected && isCorrect) {
                  bgColor = 'bg-success/30 border-success';
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-danger/30 border-danger';
                } else if (isCorrect) {
                  bgColor = 'bg-success/20 border-success';
                }
              }
              
              return (
                <button
                  key={`${currentQuestion}-${index}`}
                  className={`w-full p-4 sm:p-5 text-base sm:text-lg text-left flex items-center gap-2 sm:gap-3 backdrop-blur-lg border-2 border-white/30 rounded-xl transition-all ${bgColor} ${
                    selectedAnswer === null ? 'hover:bg-white/25 hover:scale-105 cursor-pointer' : 'cursor-default'
                  } break-words word-wrap`}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/20 rounded-lg">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 break-words word-wrap leading-relaxed">{option}</span>
                  {showStatus && isCorrect && <span className="text-2xl sm:text-3xl flex-shrink-0">✅</span>}
                  {showStatus && isSelected && !isCorrect && <span className="text-2xl sm:text-3xl flex-shrink-0">❌</span>}
                </button>
              );
            })}
          </div>
          
          {showExplanation && question.explanation && (
            <div className="mt-6 p-4 sm:p-5 bg-primary/20 border-2 border-primary/40 rounded-xl animate-slide-in-bottom">
              <div className="text-lg sm:text-xl font-bold mb-2 break-words">💡 Объяснение:</div>
              <p className="text-base sm:text-lg break-words word-wrap leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

