import { describe, expect, it } from 'vitest';
import { resolveEnding } from './endings';
import { applyScoreChange, calculateFinalScore, isIndependentCheckChoice, normalizeWisdomDelta } from './scoring';

describe('scoring', () => {
  it('does not award rewards on chapter replay', () => {
    const next = applyScoreChange(
      { wisdom: 20, coins: 5 },
      { source: 'story', reason: 'Повтор', deltaWisdom: 40, deltaCoins: -1 },
      true
    );
    expect(next.wisdom).toBe(20);
    expect(next.coins).toBe(5);
    expect(next.applied).toBeNull();
  });

  it('clamps wisdom and never lets coins go below zero', () => {
    const next = applyScoreChange(
      { wisdom: 95, coins: 2 },
      { source: 'finale', reason: 'Потеря', deltaWisdom: 50, deltaCoins: -5 },
      false
    );
    expect(next.wisdom).toBe(100);
    expect(next.coins).toBe(0);
    expect(next.wisdomOverflow).toBe(5);
  });

  it('normalizes large wisdom rewards and keeps overflow after 100', () => {
    expect(normalizeWisdomDelta(50)).toBe(10);
    expect(normalizeWisdomDelta(15)).toBe(3);
    expect(normalizeWisdomDelta(-20)).toBe(-5);

    const next = applyScoreChange(
      { wisdom: 97, coins: 5, wisdomOverflow: 0 },
      { source: 'story', reason: 'Калькулятор', deltaWisdom: 50, deltaCoins: 0 },
      false
    );
    expect(next.applied?.deltaWisdom).toBe(10);
    expect(next.wisdom).toBe(100);
    expect(next.wisdomOverflow).toBe(7);
  });

  it('does not give a certificate after a loss ending', () => {
    const score = calculateFinalScore({
      wisdom: 100,
      coins: 0,
      postTestCorrect: 10,
      postTestTotal: 10,
      finaleDecision: 'loss',
      safeDecisionRate: 0.2,
      independentCheckRate: 0.1,
    });
    expect(score.earnsCertificate).toBe(false);
    expect(score.reviewTopics.length).toBeGreaterThan(0);
  });
});

describe('independent checks', () => {
  it('does not treat a general pause answer as an independent check', () => {
    expect(isIndependentCheckChoice('Сначала остановлюсь и не буду решать под давлением', 'pause')).toBe(false);
    expect(isIndependentCheckChoice('Дальше проверю документы и независимый источник', 'check')).toBe(true);
    expect(isIndependentCheckChoice('Могу я задать вопросы?', 'safe')).toBe(false);
  });
});

describe('endings', () => {
  it('uses the loss ending when coins were given away', () => {
    expect(resolveEnding({ finaleDecision: 'loss', coins: 0, lostAllCoins: true })).toBe('trapped');
    expect(resolveEnding({ finaleDecision: 'safe', coins: 0, lostAllCoins: true })).toBe('trapped');
    expect(resolveEnding({ finaleDecision: 'pause', coins: 5, lostAllCoins: false })).toBe('saved');
    expect(resolveEnding({
      finaleDecision: 'safe',
      coins: 5,
      lostAllCoins: false,
      evidenceFound: ['promised-yield', 'swapped-domain', 'hidden-fee', 'personal-card', 'lockup-clause'],
    })).toBe('golden');
    expect(resolveEnding({
      finaleDecision: 'safe',
      coins: 5,
      lostAllCoins: false,
      storyFlags: ['false-alarm'],
    })).toBe('falseAlarm');
    expect(resolveEnding({
      finaleDecision: 'pause',
      coins: 3,
      lostAllCoins: false,
      evidenceFound: ['promised-yield', 'swapped-domain', 'hidden-fee'],
    })).toBe('costly');
  });
});
