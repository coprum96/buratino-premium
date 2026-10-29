import { useMemo, useState } from 'react';
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import { researchConfig } from '../config/research';
import { getAssessmentItems } from '../data/assessmentBank';
import { recordResearchEvent } from '../lib/research/events';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { LiveRegion } from './ui/LiveRegion';

export function PostTest() {
  const { setPostTestScore, setPhase, completeChapter, currentLevel, participantId, noteAssessmentResult } = useGameStore();
  const items = useMemo(() => getAssessmentItems(researchConfig.defaultWave), []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [status, setStatus] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Array<{questionIndex: number; selectedAnswer: number; correctAnswer: number; isCorrect: boolean}>>([]);

  const question = items[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === question.correct;
    setAnswers((current) => [...current, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      correctAnswer: question.correct,
      isCorrect,
    }]);
    if (isCorrect) setScore((value) => value + 1);
    setStatus(isCorrect ? 'Ответ верный. Отметь уверенность и нажми «Далее».' : 'Ответ неверный. Отметь уверенность и нажми «Далее».');
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === question.correct;
    recordResearchEvent(participantId, 'assessment_answer', {
      chapterId: currentLevel,
      itemId: question.id,
      shownOptions: question.options,
      selectedAnswer,
      isCorrect,
      confidence,
      choseIndependentCheck: selectedAnswer === question.independentCheckOption,
      responseMs: Date.now() - startedAt,
      wave: researchConfig.defaultWave,
    });
    noteAssessmentResult({ kind: question.kind, isCorrect, confidence });

    if (currentQuestion < items.length - 1) {
      setCurrentQuestion((value) => value + 1);
      setSelectedAnswer(null);
      setConfidence(3);
      setStatus('');
      return;
    }
    setShowResult(true);
  };

  const handleComplete = () => {
    sessionAnalytics.trackTestResult('post', score, items.length, answers);
    setPostTestScore(score);
    completeChapter(7);
    setPhase('ending');
  };

  if (showResult) {
    return (
      <main className="min-h-screen pt-28 pb-10 flex items-center justify-center px-4">
        <div className="surface-card max-w-xl w-full text-center">
          <FaGraduationCap className="text-5xl mx-auto mb-4 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold mb-3">Независимая проверка</h1>
          <p className="text-xl mb-6">Верно: {score} из {items.length}</p>
          <button type="button" className="btn btn-primary inline-flex items-center gap-2" onClick={handleComplete}>
            <FaArrowRight aria-hidden="true" />
            К итогу
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-10 flex items-center justify-center px-4">
      <LiveRegion message={status} />
      <div className="surface-card max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-2">Независимая проверка</h1>
        <p className="mb-4 text-white/80">
          Ситуации не повторяют учебные формулировки. Вопрос {currentQuestion + 1} из {items.length}.
        </p>
        <h2 className="text-xl mb-6 leading-relaxed">{question.text}</h2>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              className="choice-card motion-choice"
              data-state={selectedAnswer === index ? 'selected' : 'default'}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-6">
            <p className="mb-3 leading-relaxed">{question.explanation}</p>
            <label className="block mb-4">
              <span className="block mb-2">Насколько ты уверен в ответе? 1 — совсем нет, 5 — очень.</span>
              <input
                type="range"
                min={1}
                max={5}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full"
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={confidence}
              />
              <span className="text-sm">Уверенность: {confidence} из 5</span>
            </label>
            <button type="button" className="btn btn-primary" onClick={handleNext}>Далее</button>
          </div>
        )}
      </div>
    </main>
  );
}
