export const CALCULATOR_LIMITS = {
  minAmount: 1,
  maxAmount: 10_000_000,
  minMonths: 1,
  maxMonths: 60,
} as const;

export type CalculatorKind = 'loan' | 'investment' | 'mlm';

export interface CalculatorScenario {
  id: string;
  name: string;
  kind: CalculatorKind;
  description: string;
  initialFee?: number;
  monthlyFeePercent?: number;
  yearlyInterest?: number;
  withdrawalFeePercent?: number;
  earlyWithdrawalPenalty?: number;
  lockPeriodMonths?: number;
  assumptions: string[];
}

export interface CalculatorFieldErrors {
  amount?: string;
  months?: string;
}

export interface CalculatorValidation {
  ok: boolean;
  amount: number | null;
  months: number | null;
  errors: CalculatorFieldErrors;
}

export interface CalculatorStep {
  label: string;
  detail: string;
  value: number;
}

export interface CalculatorResult {
  kind: CalculatorKind;
  invested: number;
  received: number;
  fees: number;
  debt?: number;
  overpayment?: number;
  loss: number;
  gain: number;
  locked: boolean;
  steps: CalculatorStep[];
  assumptions: string[];
  formula: string;
}

export const CALCULATOR_SCENARIOS: CalculatorScenario[] = [
  {
    id: 'payday-loan',
    name: 'Быстрый займ (300% годовых)',
    kind: 'loan',
    yearlyInterest: 300,
    lockPeriodMonths: 0,
    description: 'Учебная модель простого процента: долг растёт от ставки и срока. Это не ПСК и не банковский расчёт.',
    assumptions: [
      'Простой процент на исходную сумму, без капитализации.',
      'Дополнительных комиссий в этом сценарии нет.',
      'Цифры учебные, не являются предложением займа.',
    ],
  },
  {
    id: 'fee-investment',
    name: 'Инвестиции с комиссиями',
    kind: 'investment',
    initialFee: 500,
    monthlyFeePercent: 5,
    withdrawalFeePercent: 3,
    earlyWithdrawalPenalty: 50,
    lockPeriodMonths: 3,
    description: 'Сначала снимаются комиссии, затем считается остаток. Доходность здесь не задана — видно, как платежи уменьшают сумму.',
    assumptions: [
      'Стартовая комиссия списывается сразу.',
      'Ежемесячная комиссия считается от исходной суммы и списывается с остатка.',
      'Если денег не хватает, комиссия ограничивается остатком.',
      'При выводе раньше lock-up добавляется штраф от исходной суммы.',
    ],
  },
  {
    id: 'mlm',
    name: 'MLM-пирамида',
    kind: 'mlm',
    monthlyFeePercent: 10,
    yearlyInterest: -50,
    lockPeriodMonths: 12,
    description: 'Ежемесячные взносы платятся сверху, а стоимость «доли» падает. Если срок меньше lock-up, вывод недоступен.',
    assumptions: [
      'Ежемесячный взнос — отдельный платёж из своих денег.',
      'Стоимость доли падает на указанный годовой процент пропорционально сроку.',
      'При сроке короче lock-up вывести деньги нельзя.',
      'Модель учебная: она показывает расход денег, а не реальный MLM-договор.',
    ],
  },
];

function normalizeCalculatorNumber(raw: string): string {
  return raw.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
}

export function validateCalculatorInput(amountRaw: string, monthsRaw: string): CalculatorValidation {
  const errors: CalculatorFieldErrors = {};
  const amount = Number(normalizeCalculatorNumber(amountRaw));
  const months = Number(normalizeCalculatorNumber(monthsRaw));

  if (amountRaw.trim() === '' || Number.isNaN(amount) || !Number.isFinite(amount)) {
    errors.amount = 'Введи сумму числом больше нуля.';
  } else if (amount <= 0) {
    errors.amount = 'Сумма должна быть больше нуля.';
  } else if (amount > CALCULATOR_LIMITS.maxAmount) {
    errors.amount = `Слишком большая сумма. Максимум ${CALCULATOR_LIMITS.maxAmount.toLocaleString('ru-RU')} ₽.`;
  }

  if (monthsRaw.trim() === '' || Number.isNaN(months) || !Number.isFinite(months)) {
    errors.months = 'Срок должен быть целым числом месяцев.';
  } else if (!Number.isInteger(months)) {
    errors.months = 'Срок должен быть целым числом.';
  } else if (months < CALCULATOR_LIMITS.minMonths || months > CALCULATOR_LIMITS.maxMonths) {
    errors.months = `Срок — от ${CALCULATOR_LIMITS.minMonths} до ${CALCULATOR_LIMITS.maxMonths} месяцев.`;
  }

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    amount: ok ? amount : null,
    months: ok ? months : null,
    errors,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function takeFromBalance(balance: number, requested: number): { next: number; taken: number } {
  const taken = Math.min(Math.max(0, balance), Math.max(0, requested));
  return { next: roundMoney(balance - taken), taken: roundMoney(taken) };
}

export function calculateScenario(
  scenario: CalculatorScenario,
  amount: number,
  months: number
): CalculatorResult {
  const validation = validateCalculatorInput(String(amount), String(months));
  if (!validation.ok || validation.amount === null || validation.months === null) {
    throw new Error('Calculator input is invalid');
  }

  if (scenario.kind === 'loan') {
    return calculateLoan(scenario, amount, months);
  }
  if (scenario.kind === 'mlm') {
    return calculateMlm(scenario, amount, months);
  }
  return calculateInvestment(scenario, amount, months);
}

function calculateLoan(scenario: CalculatorScenario, amount: number, months: number): CalculatorResult {
  const years = months / 12;
  const rate = (scenario.yearlyInterest ?? 0) / 100;
  const debt = roundMoney(amount * (1 + rate * years));
  const overpayment = roundMoney(debt - amount);

  return {
    kind: 'loan',
    invested: amount,
    received: 0,
    fees: 0,
    debt,
    overpayment,
    loss: overpayment,
    gain: 0,
    locked: false,
    formula: 'Долг = сумма × (1 + ставка × срок в годах)',
    assumptions: scenario.assumptions,
    steps: [
      { label: 'Получено в долг', detail: 'Исходная сумма займа', value: amount },
      { label: 'Ставка', detail: `${scenario.yearlyInterest ?? 0}% годовых, простой процент`, value: scenario.yearlyInterest ?? 0 },
      { label: 'Срок', detail: `${months} мес. = ${years.toFixed(2)} года`, value: months },
      { label: 'Сумма долга', detail: `${amount.toLocaleString('ru-RU')} × (1 + ${(rate * years).toFixed(2)})`, value: debt },
      { label: 'Переплата', detail: 'Долг минус полученная сумма', value: overpayment },
    ],
  };
}

function calculateInvestment(scenario: CalculatorScenario, amount: number, months: number): CalculatorResult {
  const steps: CalculatorStep[] = [
    { label: 'Вложено', detail: 'Исходная сумма', value: amount },
  ];
  let balance = amount;
  let fees = 0;

  if (scenario.initialFee) {
    const taken = takeFromBalance(balance, scenario.initialFee);
    balance = taken.next;
    fees += taken.taken;
    steps.push({
      label: 'Стартовая комиссия',
      detail: `Списывается сразу, не больше остатка`,
      value: taken.taken,
    });
  }

  if (scenario.monthlyFeePercent) {
    const requested = amount * (scenario.monthlyFeePercent / 100) * months;
    const taken = takeFromBalance(balance, requested);
    balance = taken.next;
    fees += taken.taken;
    steps.push({
      label: 'Ежемесячные комиссии',
      detail: `${scenario.monthlyFeePercent}% от исходной суммы × ${months} мес.`,
      value: taken.taken,
    });
  }

  if (scenario.yearlyInterest) {
    const interest = roundMoney(balance * (scenario.yearlyInterest / 100) * (months / 12));
    balance = roundMoney(Math.max(0, balance + interest));
    steps.push({
      label: 'Изменение стоимости',
      detail: `${scenario.yearlyInterest}% годовых от текущего остатка, простой процент`,
      value: interest,
    });
  }

  const locked = Boolean(scenario.lockPeriodMonths && months < scenario.lockPeriodMonths);
  if (locked && scenario.earlyWithdrawalPenalty) {
    const requested = amount * (scenario.earlyWithdrawalPenalty / 100);
    const taken = takeFromBalance(balance, requested);
    balance = taken.next;
    fees += taken.taken;
    steps.push({
      label: 'Штраф за ранний вывод',
      detail: `${scenario.earlyWithdrawalPenalty}% от исходной суммы, потому что срок меньше ${scenario.lockPeriodMonths} мес.`,
      value: taken.taken,
    });
  }

  if (scenario.withdrawalFeePercent && balance > 0) {
    const requested = balance * (scenario.withdrawalFeePercent / 100);
    const taken = takeFromBalance(balance, requested);
    balance = taken.next;
    fees += taken.taken;
    steps.push({
      label: 'Комиссия за вывод',
      detail: `${scenario.withdrawalFeePercent}% от остатка`,
      value: taken.taken,
    });
  }

  const received = roundMoney(Math.max(0, balance));
  const loss = roundMoney(Math.max(0, amount - received));
  const gain = roundMoney(Math.max(0, received - amount));

  steps.push({ label: 'Получено', detail: 'Остаток после всех списаний', value: received });
  steps.push({ label: 'Потери', detail: 'Вложено минус получено', value: loss });

  return {
    kind: 'investment',
    invested: amount,
    received,
    fees: roundMoney(fees),
    loss,
    gain,
    locked,
    formula: 'Получено = вложено − комиссии ± изменение стоимости − штраф/вывод',
    assumptions: scenario.assumptions,
    steps,
  };
}

function calculateMlm(scenario: CalculatorScenario, amount: number, months: number): CalculatorResult {
  const monthlyFee = roundMoney(amount * ((scenario.monthlyFeePercent ?? 0) / 100) * months);
  const totalSpent = roundMoney(amount + monthlyFee);
  const valueChange = roundMoney(amount * ((scenario.yearlyInterest ?? 0) / 100) * (months / 12));
  const remainingValue = roundMoney(Math.max(0, amount + valueChange));
  const locked = Boolean(scenario.lockPeriodMonths && months < scenario.lockPeriodMonths);
  const received = locked ? 0 : remainingValue;
  const loss = roundMoney(totalSpent - received);

  return {
    kind: 'mlm',
    invested: amount,
    received,
    fees: monthlyFee,
    loss,
    gain: 0,
    locked,
    formula: 'Потери = (вклад + взносы) − сумма, которую можно вывести',
    assumptions: scenario.assumptions,
    steps: [
      { label: 'Первый взнос', detail: 'Деньги, которые уже отдали в схему', value: amount },
      { label: 'Ежемесячные взносы', detail: `${scenario.monthlyFeePercent ?? 0}% от первого взноса × ${months} мес., платятся сверху`, value: monthlyFee },
      { label: 'Всего потрачено', detail: 'Первый взнос плюс ежемесячные платежи', value: totalSpent },
      { label: 'Стоимость доли', detail: `Изменение ${scenario.yearlyInterest ?? 0}% годовых от первого взноса`, value: remainingValue },
      {
        label: locked ? 'Вывод заблокирован' : 'Можно вывести',
        detail: locked
          ? `Срок меньше lock-up ${scenario.lockPeriodMonths} мес.`
          : 'Срок не меньше lock-up, выводится оставшаяся стоимость доли',
        value: received,
      },
      { label: 'Потери', detail: 'Потрачено минус то, что удалось вернуть', value: loss },
    ],
  };
}
