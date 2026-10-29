import { levels } from '../data/gameData';
import { stageIdFor } from '../data/learningStages';
import { addEvidenceId } from './evidence';
import { uniqueSortedNumbers } from './progress';
import type { StoryChoiceRecord } from './scoring';
import { SAVE_BACKUP_KEY } from './versions';

/**
 * Story clues granted on every completion path of a chapter.
 * Optional tools (presentation, site extras, microscope, finale-only links) stay out.
 */
export const GUARANTEED_STORY_EVIDENCE: Record<number, string[]> = {
  1: ['karabas', 'promised-yield', 'fake-urgency'],
  2: ['promised-yield', 'swapped-domain'],
  3: ['hidden-fee', 'contract'],
  7: ['fox-club'],
};

export function preserveSaveBackup(raw: string): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(SAVE_BACKUP_KEY)) return;
  localStorage.setItem(SAVE_BACKUP_KEY, raw);
}

export function readSaveBackup(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(SAVE_BACKUP_KEY);
}

export function evidenceFromStoryChoices(storyChoices: StoryChoiceRecord[]): string[] {
  return storyChoices.reduce((acc, record) => {
    const level = levels.find((item) => item.id === record.chapterId);
    const dialogue = level?.dialogues[record.dialogueIndex];
    const choice = dialogue?.choices.find((item) => (
      item.text === record.choiceText || (item.id !== undefined && item.id === record.choiceId)
    ));
    return (choice?.evidence ?? []).reduce((next, id) => addEvidenceId(next, id), acc);
  }, [] as string[]);
}

export function guaranteedEvidenceForChapters(completedChapters: number[]): string[] {
  return completedChapters.reduce((acc, chapterId) => {
    const granted = GUARANTEED_STORY_EVIDENCE[chapterId] ?? [];
    return granted.reduce((next, id) => addEvidenceId(next, id), acc);
  }, [] as string[]);
}

export function restoreStoryEvidence(
  existing: string[],
  completedChapters: number[],
  storyChoices: StoryChoiceRecord[]
): string[] {
  const fromChoices = evidenceFromStoryChoices(storyChoices);
  const guaranteed = guaranteedEvidenceForChapters(completedChapters);
  return [...existing, ...fromChoices, ...guaranteed].reduce(
    (acc, id) => addEvidenceId(acc, id),
    [] as string[]
  );
}

export function inferChapterStarted(input: {
  existing: number[];
  completedChapters: number[];
  currentLevel: number;
  currentDialogue: number;
  phase: string;
  completedActivities: string[];
}): number[] {
  const started = [...input.existing, ...input.completedChapters];
  const unfinished = !input.completedChapters.includes(input.currentLevel);
  if (unfinished) {
    if (input.phase === 'dialogue' || input.phase === 'quiz') {
      started.push(input.currentLevel);
    } else if (input.currentDialogue > 0) {
      started.push(input.currentLevel);
    } else if (input.completedActivities.includes(stageIdFor(input.currentLevel, 'story'))) {
      started.push(input.currentLevel);
    }
  }
  input.completedActivities.forEach((activityId) => {
    const match = /^ch(\d+)-story$/.exec(activityId);
    if (!match) return;
    const chapterId = Number(match[1]);
    if (!input.completedChapters.includes(chapterId)) started.push(chapterId);
  });
  return uniqueSortedNumbers(started);
}
