import { useEffect, useState } from 'react';
import { completedChapterCount, completedStageCount } from '../lib/progress';
import { describeScoreEvent } from '../lib/scoring';
import { TOTAL_CHAPTERS, TOTAL_LEARNING_STAGES } from '../lib/versions';
import { useGameStore } from '../store/gameStore';
import { LiveRegion } from './ui/LiveRegion';

export function StatsBar() {
  const { coins, wisdom, completedChapters, completedActivities, lastScoreEvent, toggleAchievementGallery, achievementUnlocks } = useGameStore();
  const unlocked = Object.keys(achievementUnlocks).length;
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const chapters = completedChapterCount(completedChapters);
  const stages = completedStageCount(completedActivities);

  useEffect(() => {
    if (coins !== prevCoins) {
      setCoinAnimation(true);
      const timer = window.setTimeout(() => setCoinAnimation(false), 600);
      setPrevCoins(coins);
      return () => window.clearTimeout(timer);
    }
  }, [coins, prevCoins]);

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-wrap items-center justify-end gap-2 max-w-[calc(100vw-4.5rem)]">
      <LiveRegion message={lastScoreEvent ? describeScoreEvent(lastScoreEvent) : ''} />

      <div
        className={`bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-yellow-400/20 flex items-center gap-2 min-h-11 ${coinAnimation ? 'motion-score-up' : ''}`}
        title="Учебные монеты. Их можно потерять сюжетным решением."
      >
        <span aria-hidden="true">🪙</span>
        <span className="font-bold">{coins}</span>
        <span className="sr-only">Монет: {coins}</span>
      </div>

      <div
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-purple-400/20 flex items-center gap-2 min-h-11 min-w-[7.5rem]"
        title="Мудрость — баллы за осторожные решения и верные ответы, максимум 100."
      >
        <span aria-hidden="true">💡</span>
        <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400" style={{ width: `${wisdom}%` }} />
        </div>
        <span className="text-sm font-semibold">{wisdom}%</span>
        <span className="sr-only">Мудрость: {wisdom} процентов</span>
      </div>

      <div
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-blue-400/20 flex items-center gap-2 min-h-11"
        title={`Завершённые главы: ${chapters} из ${TOTAL_CHAPTERS}. На карте считаются только главы, не тесты.`}
      >
        <span aria-hidden="true">📘</span>
        <span className="text-sm font-semibold">{chapters}/{TOTAL_CHAPTERS}</span>
        <span className="sr-only">Завершено глав: {chapters} из {TOTAL_CHAPTERS}</span>
      </div>

      <button
        type="button"
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-amber-400/30 flex items-center gap-2 min-h-11"
        onClick={toggleAchievementGallery}
        title="Галерея достижений"
      >
        <img src="/img/item_detector_mirror_golden.png" alt="" className="w-5 h-5 object-contain" />
        <span className="text-sm font-semibold">{unlocked}/8</span>
        <span className="sr-only">Открыть галерею достижений, открыто {unlocked} из 8</span>
      </button>

      <div
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-teal-400/20 flex items-center gap-2 min-h-11"
        title={`Учебные этапы: сюжет и проверка глав 1–7, всего ${TOTAL_LEARNING_STAGES}. Это не число глав.`}
      >
        <span aria-hidden="true">🧩</span>
        <span className="text-sm font-semibold">{stages}/{TOTAL_LEARNING_STAGES}</span>
        <span className="sr-only">Завершено учебных этапов: {stages} из {TOTAL_LEARNING_STAGES}</span>
      </div>
    </div>
  );
}
