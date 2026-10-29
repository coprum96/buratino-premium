import { useState } from 'react';
import { FaPlay, FaUniversity } from 'react-icons/fa';
import { hasRestorableProgress, readSavedState } from '../lib/storage';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { ConfirmDialog } from './ui/ConfirmDialog';

export function StartScreen() {
  const { setPhase, incrementCitizensCount, hasSeenOnboarding, resetGame, completedChapters } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const saved = hasRestorableProgress(readSavedState()) || completedChapters.length > 0;

  const handleStart = (fresh: boolean) => {
    if (fresh && saved) {
      setConfirmReset(true);
      return;
    }
    sessionAnalytics.startSession();
    incrementCitizensCount();
    setPhase(hasSeenOnboarding ? 'chapterMap' : 'onboarding');
  };

  const handleReset = () => {
    resetGame();
    sessionAnalytics.startSession();
    incrementCitizensCount();
    setConfirmReset(false);
    useGameStore.getState().setPhase('onboarding');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="container max-w-5xl mx-auto text-center">
        <div className="mb-6 p-3 bg-blue-500/20 rounded-2xl border border-blue-400/40 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
            <FaUniversity className="text-blue-300" aria-hidden="true" />
            <span>Игра разработана при поддержке СПбГУ</span>
          </div>
        </div>

        <img
          src="/img/character_buratino_happy.png"
          alt=""
          className="w-48 sm:w-64 mx-auto rounded-3xl mb-8 motion-enter"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />

        <h1 className="text-4xl sm:text-6xl font-bold mb-3 motion-enter">Золотой Детектор</h1>
        <p className="text-lg sm:text-2xl mb-6 text-white/85">Защита от финансового мошенничества</p>
        <p className="prose-narrow mb-8 text-white/80">
          Учебная игра для подростков 14–17 лет. Прогресс сохраняется в этом браузере.
          Монеты и мудрость меняются от твоих решений, а не от красивого финала.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {saved && (
            <button type="button" className="btn btn-primary inline-flex items-center justify-center gap-3" onClick={() => handleStart(false)}>
              <FaPlay aria-hidden="true" />
              Продолжить
            </button>
          )}
          <button
            type="button"
            className="btn inline-flex items-center justify-center gap-3"
            onClick={() => handleStart(true)}
          >
            <FaPlay aria-hidden="true" />
            {saved ? 'Начать заново' : 'Начать приключение'}
          </button>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Начать заново?"
          message="Прогресс, монеты, мудрость, промокод и результаты будут удалены. Это нельзя отменить."
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </main>
  );
}
