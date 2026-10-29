import { describe, expect, it } from 'vitest';
import { migrateSave } from './storage';

describe('save migrations', () => {
  it('creates a fresh save from empty storage', () => {
    const state = migrateSave(null);
    expect(state.schemaVersion).toBe(4);
    expect(state.coins).toBe(5);
    expect(state.completedChapters).toEqual([]);
    expect(state.evidenceFound).toEqual([]);
    expect(state.storyFlags).toEqual([]);
    expect(state.chapterStarted).toEqual([]);
    expect(state.soundMuted).toBe(false);
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
});
