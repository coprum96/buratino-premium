import { useGameStore } from '../store/gameStore';

export function SaveMigrationScreen() {
  const acceptMigratedProgress = useGameStore((state) => state.acceptMigratedProgress);
  const startNewInvestigation = useGameStore((state) => state.startNewInvestigation);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <section className="surface-card max-w-xl w-full" aria-labelledby="migration-title">
        <h1 id="migration-title" className="text-3xl font-bold mb-4">Игра обновилась</h1>
        <p className="text-lg leading-relaxed mb-4">
          Основной прогресс сохранён, но новое расследование нужно начать заново.
        </p>
        <p className="text-white/80 mb-6">
          Данные не удалены. Можно перенести доступные главы, монеты, репутацию и достижения или открыть чистое расследование.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" className="btn btn-primary min-h-11" onClick={acceptMigratedProgress}>
            Перенести доступный прогресс
          </button>
          <button type="button" className="btn min-h-11" onClick={startNewInvestigation}>
            Начать новое расследование
          </button>
        </div>
      </section>
    </main>
  );
}
