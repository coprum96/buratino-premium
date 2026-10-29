import { useState } from 'react';
import { FaBook, FaCheckCircle, FaCrown, FaLock, FaRedo, FaStar } from 'react-icons/fa';
import { CHAPTER_META, TOTAL_GAME_DURATION_MIN } from '../data/learningStages';
import { levels } from '../data/gameData';
import { completedChapterCount } from '../lib/progress';
import { TOTAL_CHAPTERS } from '../lib/versions';
import { useGameStore } from '../store/gameStore';
import { ConfirmDialog } from './ui/ConfirmDialog';

const ICONS = ['🪙', '🎭', '🧮', '🧺', '🫀', '🎯', '📋', '🏆'];

export function ChapterMap() {
  const {
    currentLevel,
    completedChapters,
    checkLevelAccess,
    setPendingLevel,
    setPhase,
    enterChapter,
    resetGame,
    accessStatus,
  } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const completed = completedChapterCount(completedChapters);
  const fullAccess = accessStatus === 'promo' || accessStatus === 'paid';

  const handleChapterClick = (levelIndex: number) => {
    const isAvailable = levelIndex <= currentLevel || completedChapters.includes(levelIndex);
    if (!isAvailable) return;

    if (!checkLevelAccess(levelIndex)) {
      setPendingLevel(levelIndex);
      setPhase('paywall');
      return;
    }

    enterChapter(levelIndex);
  };

  return (
    <main className="min-h-screen pt-28 pb-10">
      <div className="container max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <FaBook aria-hidden="true" className="text-primary" />
            Карта приключений
          </h1>
          <p className="text-white/80">
            Ориентир по времени всей игры: около {TOTAL_GAME_DURATION_MIN} минут.
          </p>
          {fullAccess && (
            <p className="mt-2 text-sm text-white/75">
              Полный контент доступен. Главы открываются последовательно.
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 motion-stagger">
          {levels.map((level, index) => {
            const meta = CHAPTER_META[index];
            const isCompleted = completedChapters.includes(level.id);
            const isAvailable = index <= currentLevel || isCompleted;
            const isCurrent = index === currentLevel && !isCompleted;
            const isPremium = index > 2;
            const hasAccess = checkLevelAccess(index);

            return (
              <article
                key={level.id}
                className={`surface-card motion-chapter ${!isAvailable ? 'opacity-60' : ''}`}
                style={{ background: isAvailable ? level.gradient : 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-4xl" aria-hidden="true">{ICONS[index]}</span>
                  {isCompleted && <FaCheckCircle className="text-success text-2xl" aria-label="Глава завершена" />}
                  {isCurrent && <FaStar className="text-yellow-300 text-2xl" aria-label="Текущая глава" />}
                  {!isAvailable && <FaLock aria-label="Глава ещё закрыта" />}
                </div>
                <h2 className="text-2xl font-bold mb-1">Глава {index + 1}</h2>
                <h3 className="text-lg mb-2">{level.title}</h3>
                <p className="text-sm text-white/80 mb-3">{meta?.goal}</p>
                <p className="text-sm mb-4">Около {meta?.durationMin ?? 8} минут</p>

                {isPremium && !hasAccess && (
                  <p className="text-sm mb-3 flex items-center gap-2">
                    <FaCrown className="text-yellow-300" aria-hidden="true" />
                    Нужен полный доступ
                  </p>
                )}

                {isAvailable && hasAccess && (
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={() => handleChapterClick(index)}
                  >
                    {isCompleted ? 'Пройти ещё раз' : isCurrent ? 'Продолжить главу' : 'Начать главу'}
                  </button>
                )}

                {isAvailable && isPremium && !hasAccess && (
                  <button type="button" className="btn w-full" onClick={() => handleChapterClick(index)}>
                    Открыть доступ
                  </button>
                )}

                {!isAvailable && (
                  <p className="text-sm text-white/70">Сначала заверши предыдущую главу.</p>
                )}
              </article>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-4">
          <p className="text-lg" title="Считаются только уникальные завершённые главы, максимум 8.">
            Пройдено глав: {completed} из {TOTAL_CHAPTERS}
          </p>
          <button type="button" className="btn inline-flex items-center gap-2" onClick={() => setConfirmReset(true)}>
            <FaRedo aria-hidden="true" />
            Начать заново
          </button>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Сбросить прогресс?"
          message="Главы, монеты, мудрость, промокод и результаты будут удалены."
          onConfirm={() => {
            resetGame();
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </main>
  );
}
