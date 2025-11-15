import { useState } from 'react';
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
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        setShowResult(true);
      }
    }, 3000);
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
    <div className="min-h-screen pt-28 pb-10">
      <div className="container max-w-3xl mx-auto px-5">
        <div className="glass-card animate-scale-in">
          <h2 className="text-3xl font-bold mb-5">Проверка знаний</h2>
          <p className="text-lg mb-6 opacity-80">
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>
          
          <h3 className="text-2xl mb-8 leading-relaxed">
            {question.text}
          </h3>
          
          <div className="space-y-4">
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
                  key={index}
                  className={`w-full p-5 text-lg text-left flex items-center gap-3 backdrop-blur-lg border-2 border-white/30 rounded-xl transition-all ${bgColor} ${
                    selectedAnswer === null ? 'hover:bg-white/25 hover:scale-105 cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showStatus && isCorrect && <span className="text-3xl">✅</span>}
                  {showStatus && isSelected && !isCorrect && <span className="text-3xl">❌</span>}
                </button>
              );
            })}
          </div>
          
          {showExplanation && question.explanation && (
            <div className="mt-6 p-5 bg-primary/20 border-2 border-primary/40 rounded-xl animate-slide-in-bottom">
              <div className="text-xl font-bold mb-2">💡 Объяснение:</div>
              <p className="text-lg">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

