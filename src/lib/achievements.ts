import { ACHIEVEMENTS } from '../data/achievements';

export interface AchievementSignals {
  redFlagOpens: number;
  finePrintOpens: number;
  legitimateCorrect: number;
  calibratedCorrect: number;
  postTestScore: number;
  completedChapters: number[];
  storyChoices: Array<{ consequence?: string; selectedIndependentCheck?: boolean }>;
  evidenceFound?: string[];
}

export interface AchievementUnlock {
  id: string;
  unlockedAt: string;
}

export function evaluateAchievements(signals: AchievementSignals, already: string[]): string[] {
  const unlocked = new Set(already);
  const next: string[] = [];
  const hasPause = signals.storyChoices.some((choice) => choice.consequence === 'pause');
  const hasCheck = signals.storyChoices.some((choice) => choice.consequence === 'check');
  const evidence = new Set(signals.evidenceFound ?? []);
  const refusedAfterCheck = signals.storyChoices.some((choice) => choice.consequence === 'safe')
    && hasCheck;

  const rules: Record<string, boolean> = {
    'first-red-flag': signals.redFlagOpens >= 3,
    'cool-head': hasPause,
    'check-facts': hasCheck,
    'fine-print': signals.finePrintOpens >= 1,
    'trail-finder': evidence.has('swapped-domain'),
    'count-myself': evidence.has('hidden-fee'),
    'not-all-gold': refusedAfterCheck,
    'golden-detector': signals.postTestScore >= 8,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && rules[achievement.id]) {
      next.push(achievement.id);
    }
  }
  return next;
}

export function mergeUnlocks(
  current: Record<string, string>,
  ids: string[],
  now = new Date().toISOString()
): Record<string, string> {
  const next = { ...current };
  for (const id of ids) {
    if (!next[id]) next[id] = now;
  }
  return next;
}
