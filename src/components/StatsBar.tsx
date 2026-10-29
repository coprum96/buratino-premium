import { useEffect, useState } from 'react';
import { EVIDENCE_CATALOG } from '../data/evidence';
import { reputationRank } from '../lib/evidence';
import { describeScoreEvent } from '../lib/scoring';
import { useGameStore } from '../store/gameStore';
import { LiveRegion } from './ui/LiveRegion';

export function StatsBar() {
  const {
    coins,
    wisdom,
    wisdomOverflow,
    lastScoreEvent,
    toggleAchievementGallery,
    achievementUnlocks,
    evidenceFound,
    soundMuted,
    toggleSoundMuted,
    setPhase,
    phase,
  } = useGameStore();
  const unlocked = Object.keys(achievementUnlocks).length;
  const [prevCoins, setPrevCoins] = useState(coins);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const rank = reputationRank(wisdom);
  const clues = evidenceFound.length;

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
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-purple-400/20 flex items-center gap-2 min-h-11 min-w-[8.5rem]"
        title="Репутация следователя — те же баллы, что копятся за осторожные решения. Повтор главы их не удваивает."
      >
        <span aria-hidden="true">💡</span>
        <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400" style={{ width: `${wisdom}%` }} />
        </div>
        <span className="text-sm font-semibold">{rank}</span>
        {wisdomOverflow > 0 && <span className="text-xs text-white/75">+{wisdomOverflow}</span>}
        <span className="sr-only">Репутация: {rank}, {wisdom} процентов{wisdomOverflow > 0 ? `, опыт сверх шкалы: ${wisdomOverflow}` : ''}</span>
      </div>

      <div
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-amber-400/30 flex items-center gap-2 min-h-11"
        title={`Улики на доске дела: ${clues} из ${EVIDENCE_CATALOG.length}.`}
      >
        <span aria-hidden="true">🧷</span>
        <span className="text-sm font-semibold">{clues}/{EVIDENCE_CATALOG.length}</span>
        <span className="sr-only">Улик собрано: {clues} из {EVIDENCE_CATALOG.length}</span>
      </div>

      {phase !== 'caseBoard' && (
        <button
          type="button"
          className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-amber-200/40 flex items-center gap-2 min-h-11"
          onClick={() => setPhase('caseBoard')}
          title="Открыть доску дела"
        >
          <span aria-hidden="true">🗂️</span>
          <span className="text-sm font-semibold">Дело</span>
          <span className="sr-only">Открыть доску дела Карабаса</span>
        </button>
      )}

      <button
        type="button"
        className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 flex items-center gap-2 min-h-11"
        onClick={toggleSoundMuted}
        title={soundMuted ? 'Включить звук' : 'Выключить звук'}
        aria-pressed={soundMuted}
      >
        <span aria-hidden="true">{soundMuted ? '🔇' : '🔊'}</span>
        <span className="sr-only">{soundMuted ? 'Звук выключен, включить' : 'Звук включён, выключить'}</span>
      </button>

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
    </div>
  );
}
