import { useEffect, useState } from 'react';

interface YieldCalcTaskProps {
  onReadyChange: (ready: boolean) => void;
}

type Step = 0 | 1 | 2 | 3;

const STEPS: Array<{
  prompt: string;
  answer: number;
  options: number[];
  unit?: string;
}> = [
  { prompt: 'Прибыль: 50 − 5', answer: 45, options: [5, 45, 55, 500] },
  { prompt: 'Рост: 45 ÷ 5', answer: 9, options: [4, 9, 40, 45] },
  { prompt: 'Доходность: 9 × 100', answer: 900, options: [90, 190, 450, 900], unit: '%' },
];

export function YieldCalcTask({ onReadyChange }: YieldCalcTaskProps) {
  const [step, setStep] = useState<Step>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    onReadyChange(step >= 3);
  }, [step, onReadyChange]);

  if (step >= 3) {
    return (
      <section className="comic-yield is-compact" data-testid="yield-calc" aria-label="Расчёт доходности">
        <p className="comic-yield-done">900% за месяц — экстремальный сигнал.</p>
      </section>
    );
  }

  const current = STEPS[step];

  return (
    <section className="comic-yield is-compact" data-testid="yield-calc" aria-label="Расчёт доходности">
      <p className="comic-yield-prompt">
        <span className="comic-yield-step">Шаг {step + 1}/3</span>
        {current.prompt} = ?
      </p>
      <div className="comic-yield-options" role="group" aria-label="Варианты ответа">
        {current.options.map((option) => (
          <button
            key={option}
            type="button"
            className="comic-yield-option"
            onClick={() => {
              if (option !== current.answer) {
                setError('Не то число. Посмотри формулу ещё раз.');
                return;
              }
              setError('');
              setStep((value) => (value + 1) as Step);
            }}
          >
            {option}{current.unit ?? ''}
          </button>
        ))}
      </div>
      {error && <p className="comic-yield-error" role="alert">{error}</p>}
    </section>
  );
}
