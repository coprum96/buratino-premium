import { CHAPTER_META, TOTAL_GAME_DURATION_MIN } from '../data/learningStages';
import { TOTAL_CHAPTERS, TOTAL_LEARNING_STAGES } from '../lib/versions';
import { useGameStore } from '../store/gameStore';

export function Onboarding() {
  const { markOnboardingSeen, setPhase } = useGameStore();

  const handleContinue = () => {
    markOnboardingSeen();
    setPhase('chapterMap');
  };

  return (
    <main className="min-h-screen pt-24 pb-10 px-4">
      <div className="surface-card prose-narrow motion-enter">
        <h1 className="text-3xl font-bold mb-4">Как устроена игра</h1>
        <p className="mb-4 text-white/85">
          «Золотой Детектор» — расследование финансовой схемы. Восемь глав остаются на месте,
          но решения оставляют улики на доске «Дело Карабаса». Здесь нет настоящих платежей.
        </p>
        <ul className="space-y-3 mb-6">
          <li><strong>Монеты</strong> — учебный ресурс. Потерянная монета меняет запас и может сменить финал.</li>
          <li><strong>Репутация</strong> — ранг следователя за осторожные решения. Повтор главы баллы не удваивает.</li>
          <li><strong>Улики</strong> — появляются только после действия: сверка сайта, расчёт, договор, выбор.</li>
          <li><strong>Доска дела</strong> — связи между людьми, фирмами и документами. Серое ещё не найдено.</li>
          <li><strong>Главы:</strong> {TOTAL_CHAPTERS}. На карте считается только число завершённых глав.</li>
          <li><strong>Учебные этапы:</strong> {TOTAL_LEARNING_STAGES}. Это сюжет и проверка глав 1–7, не главы.</li>
          <li><strong>Сохранение:</strong> прогресс, улики и флаги пишутся в браузер после каждого важного действия.</li>
          <li><strong>Время:</strong> примерно {TOTAL_GAME_DURATION_MIN} минут. Главы длятся от {Math.min(...CHAPTER_META.map((item) => item.durationMin))} до {Math.max(...CHAPTER_META.map((item) => item.durationMin))} минут.</li>
        </ul>
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={handleContinue}>
          Понятно, к карте
        </button>
      </div>
    </main>
  );
}
