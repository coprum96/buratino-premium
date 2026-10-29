import { useEffect, useMemo, useState } from 'react';
import {
  CALCULATOR_LIMITS,
  CALCULATOR_SCENARIOS,
  calculateScenario,
  validateCalculatorInput,
  type CalculatorScenario,
} from '../lib/calculator';

interface LossCalculatorProps {
  scenario?: CalculatorScenario;
  onValidityChange?: (ok: boolean) => void;
}

export function LossCalculator({ scenario, onValidityChange }: LossCalculatorProps) {
  const [amount, setAmount] = useState('10000');
  const [months, setMonths] = useState('12');
  const [selectedScenario, setSelectedScenario] = useState<CalculatorScenario>(scenario || CALCULATOR_SCENARIOS[0]);
  const validation = validateCalculatorInput(amount, months);
  const result = useMemo(() => {
    if (!validation.ok || validation.amount === null || validation.months === null) return null;
    return calculateScenario(selectedScenario, validation.amount, validation.months);
  }, [selectedScenario, validation]);

  useEffect(() => {
    onValidityChange?.(validation.ok);
  }, [validation.ok, onValidityChange]);

  return (
    <section className="surface-card max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-2">Калькулятор условий</h3>
      <p className="mb-4 text-white/80">
        Учебная модель. Она не считает ПСК, налог и инфляцию и не является финансовой рекомендацией.
      </p>

      {!scenario && (
        <fieldset className="mb-5">
          <legend className="font-semibold mb-2">Сценарий</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CALCULATOR_SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="choice-card"
                data-state={selectedScenario.id === item.id ? 'selected' : 'default'}
                onClick={() => setSelectedScenario(item)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="text-sm mt-2 text-white/75">{selectedScenario.description}</p>
        </fieldset>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="calc-amount" className="block font-semibold mb-2">Сумма, ₽</label>
          <input
            id="calc-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={Boolean(validation.errors.amount)}
            aria-describedby={validation.errors.amount ? 'calc-amount-hint calc-amount-error' : 'calc-amount-hint'}
            className="w-full min-h-11 px-4 rounded-xl bg-white/10 border-2 border-white/30"
          />
          <p id="calc-amount-hint" className="text-sm mt-1 text-white/70">
            От {CALCULATOR_LIMITS.minAmount} до {CALCULATOR_LIMITS.maxAmount.toLocaleString('ru-RU')}
          </p>
          {validation.errors.amount && <p id="calc-amount-error" className="text-sm text-danger mt-1">{validation.errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="calc-months" className="block font-semibold mb-2">Срок, месяцы</label>
          <input
            id="calc-months"
            type="text"
            inputMode="numeric"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            aria-invalid={Boolean(validation.errors.months)}
            aria-describedby={validation.errors.months ? 'calc-months-hint calc-months-error' : 'calc-months-hint'}
            className="w-full min-h-11 px-4 rounded-xl bg-white/10 border-2 border-white/30"
          />
          <p id="calc-months-hint" className="text-sm mt-1 text-white/70">
            Целое число от {CALCULATOR_LIMITS.minMonths} до {CALCULATOR_LIMITS.maxMonths}
          </p>
          {validation.errors.months && <p id="calc-months-error" className="text-sm text-danger mt-1">{validation.errors.months}</p>}
        </div>
      </div>

      {result && (
        <div className="bg-white/5 rounded-xl p-4 sm:p-6">
          {result.kind === 'loan' ? (
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <Metric label="Получено в долг" value={`${result.invested.toLocaleString('ru-RU')} ₽`} />
              <Metric label="Сумма долга" value={`${result.debt?.toLocaleString('ru-RU')} ₽`} />
              <Metric label="Переплата" value={`${result.overpayment?.toLocaleString('ru-RU')} ₽`} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <Metric label="Вложено и взносы" value={`${(result.invested + (result.kind === 'mlm' ? result.fees : 0)).toLocaleString('ru-RU')} ₽`} />
              <Metric label="Можно получить" value={`${result.received.toLocaleString('ru-RU')} ₽`} />
              <Metric label="Потери" value={`${result.loss.toLocaleString('ru-RU')} ₽`} />
            </div>
          )}
          <p className="mb-3"><strong>Формула:</strong> {result.formula}</p>
          <h4 className="font-bold mb-2">Пошаговый расчёт</h4>
          <ol className="space-y-2 list-decimal pl-5 mb-4">
            {result.steps.map((step) => (
              <li key={step.label}>
                <strong>{step.label}:</strong> {step.detail}. Значение: {step.value.toLocaleString('ru-RU')}
              </li>
            ))}
          </ol>
          <h4 className="font-bold mb-2">Допущения</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {result.assumptions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-lg p-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
