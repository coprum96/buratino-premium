import { LEARNING_STAGES, stageIdFor } from '../data/learningStages';
import { TOTAL_CHAPTERS, TOTAL_LEARNING_STAGES } from './versions';

export function uniqueIds<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function uniqueSortedNumbers(values: number[]): number[] {
  return [...new Set(values)].filter((value) => Number.isInteger(value) && value >= 0).sort((a, b) => a - b);
}

export function completedChapterCount(completedChapters: number[]): number {
  return Math.min(TOTAL_CHAPTERS, uniqueSortedNumbers(completedChapters).length);
}

export function completedStageCount(completedActivities: string[]): number {
  const known = new Set(LEARNING_STAGES.map((stage) => stage.id));
  const unique = uniqueIds(completedActivities).filter((id) => known.has(id));
  return Math.min(TOTAL_LEARNING_STAGES, unique.length);
}

export function canOpenChapter(chapterId: number, currentLevel: number, completedChapters: number[]): boolean {
  if (chapterId < 0 || chapterId >= TOTAL_CHAPTERS) return false;
  if (completedChapters.includes(chapterId)) return true;
  return chapterId <= currentLevel;
}

export function isChapterLockedByProgress(chapterId: number, currentLevel: number, completedChapters: number[]): boolean {
  return !canOpenChapter(chapterId, currentLevel, completedChapters);
}

export function nextUnlockedChapter(completedChapters: number[]): number {
  const unique = uniqueSortedNumbers(completedChapters);
  for (let id = 0; id < TOTAL_CHAPTERS; id += 1) {
    if (!unique.includes(id)) return id;
  }
  return TOTAL_CHAPTERS - 1;
}

export function addCompletedChapter(completedChapters: number[], chapterId: number): number[] {
  if (chapterId < 0 || chapterId >= TOTAL_CHAPTERS) return uniqueSortedNumbers(completedChapters);
  return uniqueSortedNumbers([...completedChapters, chapterId]);
}

export function addCompletedActivity(completedActivities: string[], activityId: string): string[] {
  const known = LEARNING_STAGES.some((stage) => stage.id === activityId);
  if (!known) return uniqueIds(completedActivities);
  return uniqueIds([...completedActivities, activityId]);
}

export function chapterActivities(chapterId: number): string[] {
  return [
    stageIdFor(chapterId, 'story'),
    stageIdFor(chapterId, 'quiz'),
  ].filter((id) => LEARNING_STAGES.some((stage) => stage.id === id));
}
