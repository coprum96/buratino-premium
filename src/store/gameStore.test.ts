import { beforeEach, describe, expect, it } from 'vitest';
import { migrateSave } from '../lib/storage';
import { SAVE_STORAGE_KEY } from '../lib/versions';
import { useGameStore } from './gameStore';

describe('game store progress', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it('does not duplicate chapter progress or rewards on replay', () => {
    const store = useGameStore.getState();
    store.completeStory(0);
    store.addWisdom(15, 'Первое прохождение');
    store.completeQuiz(0, 3, 3);

    expect(useGameStore.getState().completedChapters).toEqual([0]);
    expect(useGameStore.getState().completedActivities).toEqual(['ch0-story', 'ch0-quiz']);
    expect(useGameStore.getState().wisdom).toBe(3);

    store.enterChapter(0);
    store.addWisdom(15, 'Повтор');
    store.completeStory(0);
    store.completeQuiz(0, 3, 3);

    expect(useGameStore.getState().isReplayingChapter).toBe(true);
    expect(useGameStore.getState().wisdom).toBe(3);
    expect(useGameStore.getState().completedChapters).toEqual([0]);
    expect(useGameStore.getState().completedActivities).toEqual(['ch0-story', 'ch0-quiz']);
  });

  it('restores progress after a simulated reload', () => {
    useGameStore.getState().completeStory(1);
    useGameStore.getState().completeQuiz(1, 2, 3);
    useGameStore.getState().activatePromoCode('buratino');
    useGameStore.getState().addCoins(-1, 'Урок');
    useGameStore.setState({ phase: 'chapterMap' });

    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    const restored = migrateSave(parsed.state ?? parsed);
    expect(restored.completedChapters).toContain(1);
    expect(restored.accessStatus).toBe('promo');
    expect(restored.coins).toBe(4);
    expect(restored.phase).toBe('chapterMap');
  });

  it('unlocks an achievement once and keeps it after a simulated reload', () => {
    useGameStore.getState().noteRedFlagOpen();
    useGameStore.getState().noteRedFlagOpen();
    expect(useGameStore.getState().achievementUnlocks['first-red-flag']).toBeFalsy();

    useGameStore.getState().noteRedFlagOpen();
    expect(useGameStore.getState().achievementUnlocks['first-red-flag']).toBeTruthy();
    expect(useGameStore.getState().pendingAchievementQueue).toEqual(['first-red-flag']);

    useGameStore.getState().noteRedFlagOpen();
    expect(Object.keys(useGameStore.getState().achievementUnlocks)).toEqual(['first-red-flag']);

    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    const parsed = JSON.parse(raw as string);
    const restored = migrateSave(parsed.state ?? parsed);
    expect(restored.achievementUnlocks['first-red-flag']).toBeTruthy();
    expect(restored.redFlagOpens).toBe(4);
  });

  it('does not skip the next unfinished chapter after completing a quiz', () => {
    useGameStore.setState({
      completedChapters: [0, 1, 2],
      currentLevel: 3,
    });
    useGameStore.getState().completeQuiz(3, 4, 4);
    useGameStore.getState().nextLevel();

    expect(useGameStore.getState().completedChapters).toEqual([0, 1, 2, 3]);
    expect(useGameStore.getState().currentLevel).toBe(4);
  });

  it('repairs a skipped chapter when rehydrating a version-2 save', async () => {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 4,
        wisdom: 20,
        currentLevel: 5,
        currentDialogue: 2,
        completedChapters: [0, 1, 2, 3],
        accessStatus: 'promo',
        phase: 'dialogue',
        hasSeenOnboarding: true,
      },
      version: 2,
    }));
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().currentLevel).toBe(4);
    expect(useGameStore.getState().currentDialogue).toBe(0);
    expect(useGameStore.getState().phase).toBe('chapterMap');
  });

  it('collects unique evidence, skips replay, and resumes a started chapter', () => {
    useGameStore.getState().enterChapter(1);
    useGameStore.getState().setCurrentDialogue(2);
    useGameStore.getState().collectEvidence(['karabas', 'karabas', 'not-a-real-clue']);
    useGameStore.getState().setStoryFlags(['lost-coin-karabas']);

    expect(useGameStore.getState().evidenceFound).toEqual(['karabas']);
    expect(useGameStore.getState().storyFlags).toEqual(['lost-coin-karabas']);
    expect(useGameStore.getState().chapterStarted).toEqual([1]);

    useGameStore.setState({ phase: 'chapterMap' });
    useGameStore.getState().enterChapter(1);
    expect(useGameStore.getState().currentDialogue).toBe(2);
    expect(useGameStore.getState().phase).toBe('dialogue');

    useGameStore.getState().completeQuiz(1, 3, 3);
    useGameStore.getState().enterChapter(1);
    useGameStore.getState().collectEvidence(['promised-yield']);
    expect(useGameStore.getState().isReplayingChapter).toBe(true);
    expect(useGameStore.getState().currentDialogue).toBe(0);
    expect(useGameStore.getState().evidenceFound).toEqual(['karabas']);
  });

  it('resets progress only through resetGame', () => {
    useGameStore.getState().completeQuiz(0, 1, 1);
    useGameStore.getState().resetGame();
    expect(useGameStore.getState().completedChapters).toEqual([]);
    expect(useGameStore.getState().coins).toBe(5);
    expect(useGameStore.getState().accessStatus).toBe('free');
  });
});
