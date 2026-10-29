import { describe, expect, it } from 'vitest';
import {
  CALCULATOR_SCENARIOS,
  calculateScenario,
  validateCalculatorInput,
} from './calculator';

const loan = CALCULATOR_SCENARIOS.find((item) => item.id === 'payday-loan')!;
const investment = CALCULATOR_SCENARIOS.find((item) => item.id === 'fee-investment')!;
const mlm = CALCULATOR_SCENARIOS.find((item) => item.id === 'mlm')!;

describe('validateCalculatorInput', () => {
  it('rejects empty, zero, negative, non-numeric and huge values', () => {
    expect(validateCalculatorInput('', '12').ok).toBe(false);
    expect(validateCalculatorInput('0', '12').errors.amount).toMatch(/больше нуля/);
    expect(validateCalculatorInput('-1000', '12').errors.amount).toMatch(/больше нуля/);
    expect(validateCalculatorInput('abc', '12').errors.amount).toBeTruthy();
    expect(validateCalculatorInput('10000001', '12').errors.amount).toMatch(/Максимум/);
    expect(validateCalculatorInput('10000', '-3').errors.months).toMatch(/от 1 до 60/);
    expect(validateCalculatorInput('10000', '1.5').errors.months).toMatch(/целым/);
    expect(validateCalculatorInput('10000', '0').errors.months).toMatch(/от 1 до 60/);
    expect(validateCalculatorInput('10000', '').errors.months).toBeTruthy();
    expect(validateCalculatorInput('10000', '61').errors.months).toMatch(/от 1 до 60/);
    expect(validateCalculatorInput('-100', '-2').ok).toBe(false);
    expect(validateCalculatorInput('-100', '-2').errors.amount).toMatch(/больше нуля/);
    expect(validateCalculatorInput('-100', '-2').errors.months).toMatch(/от 1 до 60/);
    expect(validateCalculatorInput('   ', '12').ok).toBe(false);
    expect(validateCalculatorInput('10 000', '12').ok).toBe(true);
    expect(validateCalculatorInput('10 000', '12').amount).toBe(10000);
    expect(validateCalculatorInput('10000', ' 12 ').ok).toBe(true);
  });

  it('accepts a valid amount and whole months', () => {
    const result = validateCalculatorInput('10000', '12');
    expect(result.ok).toBe(true);
    expect(result.amount).toBe(10000);
    expect(result.months).toBe(12);
  });
});

describe('calculateScenario', () => {
  it('shows loan debt and overpayment instead of investment profit', () => {
    const result = calculateScenario(loan, 10000, 12);
    expect(result.kind).toBe('loan');
    expect(result.debt).toBe(40000);
    expect(result.overpayment).toBe(30000);
    expect(result.received).toBe(0);
    expect(result.loss).toBe(30000);
    expect(result.formula).toMatch(/Долг/);
  });

  it('keeps investment fees from exceeding the remaining balance', () => {
    const result = calculateScenario(investment, 10000, 12);
    expect(result.invested).toBe(10000);
    expect(result.received).toBeGreaterThanOrEqual(0);
    expect(result.received).toBeLessThan(10000);
    expect(result.fees).toBeGreaterThan(0);
    expect(result.loss).toBe(10000 - result.received);
    expect(result.steps.some((step) => step.label === 'Стартовая комиссия')).toBe(true);
  });

  it('applies early withdrawal penalty before lock-up', () => {
    const early = calculateScenario(investment, 10000, 1);
    expect(early.locked).toBe(true);
    expect(early.steps.some((step) => step.label === 'Штраф за ранний вывод')).toBe(true);
    expect(early.fees).toBeGreaterThan(500);
  });

  it('explains MLM cash spent and lock-up instead of inventing extra loss', () => {
    const locked = calculateScenario(mlm, 10000, 3);
    expect(locked.locked).toBe(true);
    expect(locked.received).toBe(0);
    expect(locked.fees).toBe(3000);
    expect(locked.loss).toBe(13000);

    const open = calculateScenario(mlm, 10000, 12);
    expect(open.locked).toBe(false);
    expect(open.fees).toBe(12000);
    expect(open.received).toBe(5000);
    expect(open.loss).toBe(17000);
    expect(open.steps.some((step) => step.detail.includes('платятся сверху'))).toBe(true);
  });
});
