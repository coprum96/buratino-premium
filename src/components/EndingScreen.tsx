import { useEffect, useState } from 'react';
import { FaBook, FaLightbulb } from 'react-icons/fa';
import { EVIDENCE_CATALOG } from '../data/evidence';
import { getEndingContent } from '../lib/endings';
import { reputationRank } from '../lib/evidence';
import { playCue } from '../lib/sound';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { EmailForm } from './EmailForm';
import { ConfirmDialog } from './ui/ConfirmDialog';

const TONE_LABEL = {
  success: 'Дело закрыто',
  caution: 'Дело не дособрано',
  danger: 'Деньги ушли',
} as const;

export function EndingScreen() {
  const {
    coins,
    wisdom,
    postTestScore,
    resetGame,
    getEndingId,
    getFinalScore,
    toggleMaterialsPanel,
    toggleAchievementGallery,
    achievementUnlocks,
    evidenceFound,
    setPhase,
    soundMuted,
  } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const ending = getEndingContent(getEndingId(), coins);
  const finalScore = getFinalScore();
  const rank = reputationRank(wisdom);

  useEffect(() => {
    sessionAnalytics.updateFinalStats(coins, wisdom, Object.keys(achievementUnlocks));
    sessionAnalytics.endSession();
    if (!soundMuted) playCue('ending');
  }, [achievementUnlocks, coins, wisdom, soundMuted]);

  return (
    <main className="min-h-screen pt-24 pb-10 px-4">
      <div className="surface-card max-w-3xl mx-auto motion-scene">
        <p className="text-sm uppercase tracking-wide mb-2">{TONE_LABEL[ending.tone]}</p>
        <h1 className="text-4xl font-bold mb-4">{ending.title}</h1>
        <p className="text-lg leading-relaxed mb-4">{ending.summary}</p>
        <p className="mb-6">{ending.coinsNote}</p>

        <section className="grid sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{coins}</p>
            <p>Монет сейчас</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{rank}</p>
            <p>Репутация</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{evidenceFound.length}/{EVIDENCE_CATALOG.length}</p>
            <p>Улик в деле</p>
          </div>
        </section>

        <section className="mb-8 p-4 rounded-xl bg-white/10">
          <h2 className="text-2xl font-bold mb-3">Личный отчёт по делу</h2>
          <ul className="space-y-2">
            <li><strong>Что получилось:</strong> {ending.report.good}</li>
            <li><strong>Где почти сдался:</strong> {ending.report.almost}</li>
            <li><strong>Что упустил:</strong> {ending.report.missed}</li>
            <li><strong>Поворотный момент:</strong> {ending.report.turningPoint}</li>
            <li><strong>Что проверить завтра:</strong> {ending.report.checkNext}</li>
            <li><strong>Навык:</strong> {ending.report.skill}</li>
          </ul>
          <p className="text-sm mt-3 text-white/70">Независимая проверка: {postTestScore}/10</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Что делать дальше</h2>
          <ol className="space-y-2 list-decimal pl-5">
            {ending.actions.map((action) => <li key={action}>{action}</li>)}
          </ol>
        </section>

        <section className="mb-8 p-4 rounded-xl bg-white/10">
          <h2 className="text-2xl font-bold mb-2">Итоговая оценка: {finalScore.total}/100</h2>
          <p className="mb-2 text-sm text-white/80">
            Тесты {finalScore.parts.tests}, сюжет {finalScore.parts.story}, монеты {finalScore.parts.coins}, независимая проверка {finalScore.parts.checks}.
          </p>
          {finalScore.earnsCertificate ? (
            <p>Критерии сертификата выполнены: осторожный финал, сохранённые монеты и достаточный результат проверки.</p>
          ) : (
            <div>
              <p className="mb-2">Сертификат пока не выдаём: исход или баллы ниже прозрачного порога.</p>
              <p className="font-semibold">Имеет смысл повторить:</p>
              <ul className="list-disc pl-5">
                {finalScore.reviewTopics.map((topic) => <li key={topic}>{topic}</li>)}
              </ul>
            </div>
          )}
        </section>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <FaLightbulb aria-hidden="true" />
            Короткие правила
          </h2>
          <ul className="space-y-2">
            <li>Дискомфорт — повод остановиться и перепроверить, не доказательство обмана.</li>
            <li>Регистрация, печать или лицензия не равны добросовестности.</li>
            <li>Сложные условия сами по себе не делают продукт мошенническим.</li>
          </ul>
        </div>

        <EmailForm />

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => setConfirmReset(true)}>
            Начать заново
          </button>
          <button type="button" className="btn" onClick={() => setPhase('caseBoard')}>
            Доска дела
          </button>
          <button type="button" className="btn" onClick={toggleAchievementGallery}>
            Достижения
          </button>
          <button type="button" className="btn" onClick={toggleMaterialsPanel}>
            <FaBook className="inline mr-2" aria-hidden="true" />
            Открыть справочник
          </button>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Начать заново?"
          message="Текущий прогресс и результаты будут удалены."
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
