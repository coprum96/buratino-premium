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
          «Золотой Детектор» — учебная история о проверке денежных предложений.
          Здесь нет настоящих платежей. Цель — научиться останавливаться, считать и проверять факты.
        </p>
        <ul className="space-y-3 mb-6">
          <li><strong>Монеты</strong> — учебный ресурс. Если отдать их мошеннику, финал это учтёт.</li>
          <li><strong>Мудрость</strong> — прозрачные баллы за осторожные решения и верные ответы. Повтор главы их не удваивает.</li>
          <li><strong>Главы:</strong> {TOTAL_CHAPTERS}. На карте считается только число завершённых глав.</li>
          <li><strong>Учебные этапы:</strong> {TOTAL_LEARNING_STAGES}. Это сюжет и проверка глав 1–7, не главы.</li>
          <li><strong>Сохранение:</strong> прогресс пишется в браузер после каждого важного действия и восстанавливается после перезагрузки.</li>
          <li><strong>Время:</strong> примерно {TOTAL_GAME_DURATION_MIN} минут. Главы длятся от {Math.min(...CHAPTER_META.map((item) => item.durationMin))} до {Math.max(...CHAPTER_META.map((item) => item.durationMin))} минут.</li>
        </ul>
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={handleContinue}>
          Понятно, к карте
        </button>
      </div>
    </main>
  );
}
