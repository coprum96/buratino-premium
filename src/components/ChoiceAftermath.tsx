import { useEffect, useRef } from 'react';
import type { Choice } from '../data/gameData';
import {
  buildChoiceAftermath,
  formatCoinDelta,
  formatReputationDelta,
  type AppliedAftermath,
} from '../lib/choiceAftermath';

interface ChoiceAftermathProps {
  choice: Choice;
  characterId: string;
  replay: boolean;
  applied: AppliedAftermath;
  nextDisabled?: boolean;
  onContinue: () => void;
  onOpenBoard?: () => void;
}

export function ChoiceAftermath({
  choice,
  characterId,
  replay,
  applied,
  nextDisabled,
  onContinue,
  onOpenBoard,
}: ChoiceAftermathProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const aftermath = buildChoiceAftermath(choice, characterId, applied);
  const coinLine = formatCoinDelta(applied.coinsDelta);
  const reputationLine = formatReputationDelta(applied.reputationDelta, applied.overflowDelta);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="surface-card mt-4" aria-labelledby="aftermath-happened">
      <h3 id="aftermath-happened" ref={headingRef} tabIndex={-1} className="font-bold mb-2 outline-none">
        Что произошло
      </h3>
      <p className="mb-4 leading-relaxed whitespace-pre-line">{aftermath.happened}</p>

      <ul className="mb-4 space-y-1 text-sm text-white/90">
        {coinLine && <li>{coinLine}</li>}
        {reputationLine && <li>{reputationLine}</li>}
        {aftermath.evidenceTitles.map((title) => (
          <li key={title}>Новая улика: {title}</li>
        ))}
        {aftermath.relation && <li>Отношения: {aftermath.relation}</li>}
        {replay && <li>Повтор: репутация, монеты и улики не начисляются снова.</li>}
      </ul>

      <h3 className="font-bold mb-2">Что это значит</h3>
      <ol className="mb-4 space-y-2 leading-relaxed">
        <li><span className="font-semibold">1. Что произошло.</span> {aftermath.happened}</li>
        <li><span className="font-semibold">2. Сигнал.</span> {aftermath.signal}</li>
        <li><span className="font-semibold">3. Подтверждает.</span> {aftermath.confirms}</li>
        <li><span className="font-semibold">4. Пока не доказывает.</span> {aftermath.doesNotProve}</li>
        <li><span className="font-semibold">5. В реальности.</span> {aftermath.nextStep}</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={nextDisabled}
          onClick={onContinue}
        >
          Далее
        </button>
        {onOpenBoard && (
          <button type="button" className="btn" onClick={onOpenBoard}>
            К доске дела
          </button>
        )}
      </div>
    </section>
  );
}
