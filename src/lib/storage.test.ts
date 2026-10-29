import { describe, expect, it } from 'vitest';
import { migrateSave } from './storage';

describe('save migrations', () => {
  it('creates a fresh save from empty storage', () => {
    const state = migrateSave(null);
    expect(state.schemaVersion).toBe(5);
    expect(state.saveVersion).toBe(5);
    expect(state.coins).toBe(5);
    expect(state.completedChapters).toEqual([]);
    expect(state.evidenceFound).toEqual([]);
    expect(state.storyFlags).toEqual([]);
    expect(state.chapterStarted).toEqual([]);
    expect(state.soundMuted).toBe(false);
    expect(state.needsMigrationDecision).toBe(false);
    expect(state.participantId.startsWith('p_')).toBe(true);
  });

  it('deduplicates legacy completedLevels into chapters and activities', () => {
    const state = migrateSave({
      coins: 3,
      wisdom: 40,
      completedLevels: [0, 0, 1, 1, 2, 2],
      accessStatus: 'promo',
      phase: 'chapterMap',
    });

    expect(state.completedChapters).toEqual([0, 1, 2]);
    expect(state.completedActivities).toEqual([
      'ch0-story', 'ch0-quiz',
      'ch1-story', 'ch1-quiz',
      'ch2-story', 'ch2-quiz',
    ]);
    expect(state.accessStatus).toBe('promo');
    expect(state.coins).toBe(3);
  });

  it('repairs a skipped currentLevel back to the first unfinished chapter', () => {
    const state = migrateSave({
      completedChapters: [0, 1, 2, 3],
      currentLevel: 5,
      currentDialogue: 3,
      phase: 'dialogue',
    });
    expect(state.currentLevel).toBe(4);
    expect(state.currentDialogue).toBe(0);
    expect(state.phase).toBe('chapterMap');
    expect(state.wisdomOverflow).toBe(0);
  });

  it('reads zustand persist envelopes', () => {
    const state = migrateSave({
      version: 1,
      state: {
        completedChapters: [0],
        completedActivities: ['ch0-story'],
        coins: 5,
      },
    });
    expect(state.completedChapters).toEqual([0]);
    expect(state.completedActivities).toEqual(['ch0-story']);
  });

  it('restores guaranteed story evidence and an in-progress chapter 5 quiz', () => {
    const state = migrateSave({
      schemaVersion: 2,
      coins: 4,
      wisdom: 35,
      currentLevel: 4,
      currentDialogue: 3,
      completedChapters: [0, 1, 2, 3],
      completedActivities: ['ch4-story'],
      achievementUnlocks: {
        'first-red-flag': '2024-01-01',
        'cool-head': '2024-01-01',
        'check-facts': '2024-01-01',
        'fine-print': '2024-01-01',
      },
      accessStatus: 'promo',
      phase: 'quiz',
      evidenceFound: [],
    });

    expect(state.saveVersion).toBe(5);
    expect(state.currentLevel).toBe(4);
    expect(state.phase).toBe('quiz');
    expect(state.coins).toBe(4);
    expect(state.wisdom).toBe(35);
    expect(state.chapterStarted).toEqual([0, 1, 2, 3, 4]);
    expect(state.evidenceFound).toEqual(expect.arrayContaining([
      'karabas',
      'promised-yield',
      'fake-urgency',
      'swapped-domain',
      'hidden-fee',
      'contract',
    ]));
    expect(state.evidenceFound).not.toContain('golden-stage');
    expect(state.evidenceFound).not.toContain('lockup-clause');
    expect(state.evidenceFound).not.toContain('fox-club');
    expect(state.achievementUnlocks['first-red-flag']).toBeTruthy();
    expect(state.achievementUnlocks['trail-finder']).toBeTruthy();
    expect(state.achievementUnlocks['count-myself']).toBeTruthy();
  });

  it('does not mark the next chapter as started when the player is only on the map', () => {
    const state = migrateSave({
      completedChapters: [0, 1, 2, 3],
      currentLevel: 5,
      currentDialogue: 0,
      phase: 'chapterMap',
      evidenceFound: [],
    });
    expect(state.currentLevel).toBe(4);
    expect(state.phase).toBe('chapterMap');
    expect(state.chapterStarted).toEqual([0, 1, 2, 3]);
  });
});
