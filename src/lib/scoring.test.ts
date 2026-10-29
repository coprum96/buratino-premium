import { describe, expect, it } from 'vitest';
import { resolveEnding } from './endings';
import { applyScoreChange, calculateFinalScore } from './scoring';

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
      { wisdom: 90, coins: 2 },
      { source: 'finale', reason: 'Потеря', deltaWisdom: 40, deltaCoins: -5 },
      false
    );
    expect(next.wisdom).toBe(100);
    expect(next.coins).toBe(0);
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

describe('endings', () => {
  it('uses the loss ending when coins were given away', () => {
    expect(resolveEnding({ finaleDecision: 'loss', coins: 0, lostAllCoins: true })).toBe('loss');
    expect(resolveEnding({ finaleDecision: 'safe', coins: 0, lostAllCoins: true })).toBe('loss');
    expect(resolveEnding({ finaleDecision: 'pause', coins: 5, lostAllCoins: false })).toBe('pause');
    expect(resolveEnding({ finaleDecision: 'safe', coins: 5, lostAllCoins: false })).toBe('safe');
  });
});
