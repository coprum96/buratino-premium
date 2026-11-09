import { useEffect, useState } from 'react';

interface PrologueTableProps {
  onReadyChange: (ready: boolean) => void;
}

const STEPS = [
  {
    id: 'letter',
    label: 'Письмо бабушки',
    idle: 'Открыть',
    done: 'Открыто',
    className: 'is-letter',
  },
  {
    id: 'pouch',
    label: 'Мешочек',
    idle: 'Высыпать',
    done: 'Монеты на столе',
    className: 'is-pouch',
  },
  {
    id: 'coins',
    label: 'Пять монет',
    idle: 'Пересчитать',
    done: 'Пять золотых',
    className: 'is-coins',
  },
] as const;

export function PrologueTable({ onReadyChange }: PrologueTableProps) {
  const [done, setDone] = useState({ letter: false, pouch: false, coins: false });
  const ready = done.letter && done.pouch && done.coins;

  useEffect(() => {
    onReadyChange(ready);
  }, [ready, onReadyChange]);

  const unlock = (id: 'letter' | 'pouch' | 'coins') => {
    if (id === 'pouch' && !done.letter) return;
    if (id === 'coins' && !done.pouch) return;
    setDone((current) => ({ ...current, [id]: true }));
  };

  const status = !done.letter
    ? 'Нажми на письмо.'
    : !done.pouch
      ? 'Высыпь монеты из мешочка.'
      : !done.coins
        ? 'Пересчитай пять монет.'
        : 'Готово — можно слушать Сверчка.';

  return (
    <section className="comic-hotspots" aria-label="Стол с письмом и монетами" data-testid="prologue-table">
      <p className="comic-hotspots-status" role="status">{status}</p>
      <div className="comic-hotspot-row">
        {STEPS.map((step) => {
          const isDone = done[step.id];
          const blocked =
            (step.id === 'pouch' && !done.letter) || (step.id === 'coins' && !done.pouch);
          return (
            <button
              key={step.id}
              type="button"
              className={`comic-hotspot ${step.className}`}
              data-state={isDone ? 'done' : blocked ? 'locked' : 'ready'}
              disabled={blocked || isDone}
              aria-pressed={isDone}
              onClick={() => unlock(step.id)}
            >
              <span className="comic-hotspot-glow" aria-hidden="true" />
              <strong>{step.label}</strong>
              <span>{isDone ? step.done : step.idle}</span>
            </button>
          );
        })}
      </div>
      {done.pouch && (
        <div className={`comic-coin-row ${done.coins ? 'is-counted' : ''}`} aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="comic-coin-chip" style={{ animationDelay: `${index * 60}ms` }} />
          ))}
        </div>
      )}
    </section>
  );
}
