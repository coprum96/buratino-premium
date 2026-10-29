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
    expect(useGameStore.getState().wisdom).toBe(15);

    store.enterChapter(0);
    store.addWisdom(15, 'Повтор');
    store.completeStory(0);
    store.completeQuiz(0, 3, 3);

    expect(useGameStore.getState().isReplayingChapter).toBe(true);
    expect(useGameStore.getState().wisdom).toBe(15);
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
    expect(useGameStore.getState().achievementUnlocks['first-red-flag']).toBeTruthy();
    expect(useGameStore.getState().pendingAchievementQueue).toEqual(['first-red-flag']);

    useGameStore.getState().noteRedFlagOpen();
    expect(Object.keys(useGameStore.getState().achievementUnlocks)).toEqual(['first-red-flag']);

    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    const parsed = JSON.parse(raw as string);
    const restored = migrateSave(parsed.state ?? parsed);
    expect(restored.achievementUnlocks['first-red-flag']).toBeTruthy();
    expect(restored.redFlagOpens).toBe(2);
  });

  it('resets progress only through resetGame', () => {
    useGameStore.getState().completeQuiz(0, 1, 1);
    useGameStore.getState().resetGame();
    expect(useGameStore.getState().completedChapters).toEqual([]);
    expect(useGameStore.getState().coins).toBe(5);
    expect(useGameStore.getState().accessStatus).toBe('free');
  });
});
