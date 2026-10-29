import { describe, expect, it } from 'vitest';
import { LEARNING_STAGES } from '../data/learningStages';
import {
  addCompletedActivity,
  addCompletedChapter,
  canOpenChapter,
  completedChapterCount,
  completedStageCount,
  currentChapterFromProgress,
  nextUnlockedChapter,
} from './progress';

describe('progress counters', () => {
  it('never reports more than 8 completed chapters', () => {
    const duplicated = addCompletedChapter([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6], 6);
    expect(completedChapterCount(duplicated)).toBe(7);
    expect(duplicated).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('counts only the 14 known learning stages', () => {
    const activities = LEARNING_STAGES.map((stage) => stage.id);
    const withJunk = addCompletedActivity([...activities, 'ch0-story', 'unknown'], 'unknown');
    expect(completedStageCount(withJunk)).toBe(14);
    expect(completedStageCount(withJunk)).not.toBeGreaterThan(14);
  });

  it('does not increment chapter progress on repeat completion', () => {
    const once = addCompletedChapter([], 0);
    const twice = addCompletedChapter(once, 0);
    expect(completedChapterCount(once)).toBe(1);
    expect(completedChapterCount(twice)).toBe(1);
    expect(nextUnlockedChapter(twice)).toBe(1);
  });

  it('treats only the first unfinished chapter as current and locks the rest', () => {
    const completed = [0, 1, 2, 3];
    expect(currentChapterFromProgress(completed)).toBe(4);
    expect(canOpenChapter(3, completed)).toBe(true);
    expect(canOpenChapter(4, completed)).toBe(true);
    expect(canOpenChapter(5, completed)).toBe(false);
    expect(canOpenChapter(6, completed)).toBe(false);
  });
});
