import { describe, expect, it } from 'vitest';
import { evaluateAchievements, mergeUnlocks } from './achievements';
import { FILM_DURATION_MS, FILM_SCENES } from './filmTimeline';

const emptySignals = {
  redFlagOpens: 0,
  finePrintOpens: 0,
  legitimateCorrect: 0,
  calibratedCorrect: 0,
  postTestScore: 0,
  completedChapters: [] as number[],
  storyChoices: [] as Array<{ consequence?: string; selectedIndependentCheck?: boolean }>,
};

describe('achievement unlocks', () => {
  it('unlocks each achievement only once', () => {
    const first = evaluateAchievements({ ...emptySignals, redFlagOpens: 1 }, []);
    expect(first).toEqual(['first-red-flag']);
    const second = evaluateAchievements({ ...emptySignals, redFlagOpens: 4 }, ['first-red-flag']);
    expect(second).toEqual([]);
  });

  it('maps real player actions to the eight badges', () => {
    const ids = evaluateAchievements({
      redFlagOpens: 1,
      finePrintOpens: 1,
      legitimateCorrect: 1,
      calibratedCorrect: 1,
      postTestScore: 8,
      completedChapters: [3],
      storyChoices: [
        { consequence: 'pause', selectedIndependentCheck: false },
        { consequence: 'check', selectedIndependentCheck: true },
      ],
    }, []);
    expect(ids).toEqual([
      'first-red-flag',
      'cool-head',
      'check-facts',
      'fine-print',
      'not-one-basket',
      'golden-detector',
      'no-false-alarm',
      'calibrated-confidence',
    ]);
  });

  it('keeps the first unlock timestamp', () => {
    const first = mergeUnlocks({}, ['cool-head'], '2026-10-29T10:00:00.000Z');
    const again = mergeUnlocks(first, ['cool-head'], '2026-10-29T11:00:00.000Z');
    expect(again['cool-head']).toBe('2026-10-29T10:00:00.000Z');
  });
});

describe('film timeline', () => {
  it('is exactly 40 seconds and covers every named scene', () => {
    expect(FILM_DURATION_MS).toBe(40000);
    expect(FILM_SCENES[FILM_SCENES.length - 1].endMs).toBe(40000);
    expect(FILM_SCENES.map((scene) => scene.component)).toEqual([
      'HookScene',
      'ProductRevealScene',
      'FraudOfferScene',
      'DetectorScanScene',
      'VerificationToolsScene',
      'DecisionScene',
      'BadgeUnlockScene',
      'ProgressMontageScene',
      'FinalPayoffScene',
    ]);
  });
});
