import { useState } from 'react';
import { FaArrowRight, FaBook, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { levels } from '../data/gameData';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { LiveRegion } from './ui/LiveRegion';

export function QuizScreen() {
  const { currentLevel, addWisdom, completeQuiz, checkLevelAccess, setPendingLevel, setPhase } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [status, setStatus] = useState('');

  const level = levels[currentLevel];
  const questions = level?.quiz || [];
  const question = questions[currentQuestion];

  if (!level || questions.length === 0) {
    completeQuiz(currentLevel, 0, 0);
    useGameStore.getState().nextLevel();
    return null;
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correct;
    sessionAnalytics.trackQuizAnswer(
      currentLevel,
      currentQuestion,
      question.text,
      question.options[answerIndex],
      isCorrect
    );
    if (isCorrect) {
      setScore((value) => value + 1);
      if (question.reward) addWisdom(question.reward, question.explanation || 'Верный ответ в проверке главы');
      setStatus('Ответ верный. Прочитай объяснение и нажми «Далее».');
    } else {
      setStatus('Ответ неверный. Прочитай объяснение и нажми «Далее».');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1);
      setSelectedAnswer(null);
      setStatus('');
      return;
    }
    setShowResult(true);
  };

  const handleComplete = () => {
    completeQuiz(currentLevel, score, questions.length);
    const nextLevelId = currentLevel + 1;
    if (!checkLevelAccess(nextLevelId)) {
      setPendingLevel(nextLevelId);
      setPhase('paywall');
      return;
    }
    useGameStore.getState().nextLevel();
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <main className="min-h-screen pt-28 pb-10 flex items-center justify-center px-4">
        <div className="surface-card max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Результаты проверки главы</h1>
          <p className="text-2xl mb-2">Верно: {score} из {questions.length}</p>
          <p className="mb-6">{percentage}%</p>
          <button type="button" className="btn btn-primary inline-flex items-center gap-2" onClick={handleComplete}>
            <FaArrowRight aria-hidden="true" />
            Продолжить
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-10 flex items-center justify-center px-4">
      <LiveRegion message={status} />
      <div className="surface-card max-w-3xl w-full">
        <button type="button" className="btn mb-4" onClick={() => setPhase('chapterMap')}>На карту</button>
        <h1 className="text-2xl font-bold mb-2">Проверка главы</h1>
        <p className="mb-5 text-white/80">Вопрос {currentQuestion + 1} из {questions.length}</p>
        <h2 className="text-xl mb-6 leading-relaxed">{question.text}</h2>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const state = selectedAnswer === null
              ? 'default'
              : isCorrect ? 'correct' : isSelected ? 'incorrect' : 'disabled';
            return (
              <button
                key={`${currentQuestion}-${index}`}
                type="button"
                className="choice-card motion-choice"
                data-state={state}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">{String.fromCharCode(65 + index)}</span>
                <span className="flex-1">{option}</span>
                {selectedAnswer !== null && isCorrect && <FaCheckCircle className="text-success" aria-label="Верно" />}
                {selectedAnswer !== null && isSelected && !isCorrect && <FaTimesCircle className="text-danger" aria-label="Неверно" />}
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-6 p-4 bg-primary/20 rounded-xl">
            <p className="font-bold mb-2 flex items-center gap-2"><FaBook aria-hidden="true" /> Объяснение</p>
            <p className="leading-relaxed mb-4">{question.explanation || (selectedAnswer === question.correct ? 'Так и есть.' : 'Этот вариант слабее защищает деньги.')}</p>
            <button type="button" className="btn btn-primary" onClick={handleNext}>Далее</button>
          </div>
        )}
      </div>
    </main>
  );
}
