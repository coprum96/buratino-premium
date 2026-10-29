import { describe, expect, it } from 'vitest';
import { buildChoiceAftermath, formatCoinDelta, formatReputationDelta } from './choiceAftermath';

describe('choiceAftermath', () => {
  it('leads with the story beat and reads the new clue without a score slogan', () => {
    const aftermath = buildChoiceAftermath({
      id: 'Выглядит профессионально, вложу!',
      text: 'Перевести одну монету, чтобы место сохранили',
      icon: '💸',
      wisdom: -20,
      coins: -1,
      consequence: 'risky',
      evidence: ['promised-yield', 'fake-urgency'],
      feedback: 'Карабас быстро забирает монету и прячет бумагу. «Остальные принесёшь завтра».',
    }, 'karabas', { newEvidenceIds: ['promised-yield', 'fake-urgency'] });

    expect(aftermath.happened).toMatch(/забирает монету/);
    expect(aftermath.signal).toMatch(/доходность|срочность|механизм/i);
    expect(aftermath.confirms).toBeTruthy();
    expect(aftermath.doesNotProve).toMatch(/не .*доказательство|не приговор|документы/i);
    expect(aftermath.nextStep).toMatch(/не переводить/i);
    expect(aftermath.relation).toMatch(/легко давить/);
    expect(aftermath.evidenceTitles).toContain('Обещание 900% за месяц');
    expect(JSON.stringify(aftermath)).not.toMatch(/плохое решение/i);
  });

  it('does not list clues that were not actually added', () => {
    const aftermath = buildChoiceAftermath({
      text: 'Перевести одну монету, чтобы место сохранили',
      icon: '💸',
      consequence: 'risky',
      evidence: ['promised-yield'],
      feedback: 'Карабас быстро забирает монету и прячет бумагу. «Остальные принесёшь завтра».',
    }, 'karabas', { newEvidenceIds: [] });

    expect(aftermath.evidenceTitles).toEqual([]);
  });

  it('formats only real resource changes', () => {
    expect(formatCoinDelta(-1)).toBe('Потеряно: 1 монета');
    expect(formatReputationDelta(-5)).toBe('Репутация: -5');
    expect(formatCoinDelta(0)).toBeNull();
    expect(formatReputationDelta(0)).toBeNull();
    expect(formatReputationDelta(0, 3)).toBe('Репутация на максимуме, опыт сверх шкалы: +3');
  });

  it('uses pause next-step when there is no new clue yet', () => {
    const aftermath = buildChoiceAftermath({
      text: 'Попросить сутки и официальный договор',
      icon: '🤔',
      wisdom: 30,
      consequence: 'pause',
      feedback: 'Лиса вздыхает: «Завтра мест не будет». Договора всё равно нет.',
    }, 'fox_alice');

    expect(aftermath.nextStep).toMatch(/Не отвечать сегодня/);
    expect(aftermath.relation).toMatch(/пауза ещё не проверка/);
    expect(aftermath.doesNotProve).toMatch(/не доказывает состав/);
  });
});
