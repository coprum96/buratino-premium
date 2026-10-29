import { ACHIEVEMENTS } from '../data/achievements';

export interface AchievementSignals {
  redFlagOpens: number;
  finePrintOpens: number;
  legitimateCorrect: number;
  calibratedCorrect: number;
  postTestScore: number;
  completedChapters: number[];
  storyChoices: Array<{ consequence?: string; selectedIndependentCheck?: boolean }>;
}

export interface AchievementUnlock {
  id: string;
  unlockedAt: string;
}

export function evaluateAchievements(signals: AchievementSignals, already: string[]): string[] {
  const unlocked = new Set(already);
  const next: string[] = [];
  const hasPause = signals.storyChoices.some((choice) => choice.consequence === 'pause' || choice.consequence === 'check');
  const hasCheck = signals.storyChoices.some((choice) => choice.consequence === 'check' || choice.selectedIndependentCheck);

  const rules: Record<string, boolean> = {
    'first-red-flag': signals.redFlagOpens >= 1,
    'cool-head': hasPause,
    'check-facts': hasCheck,
    'fine-print': signals.finePrintOpens >= 1,
    'not-one-basket': signals.completedChapters.includes(3),
    'golden-detector': signals.postTestScore >= 8,
    'no-false-alarm': signals.legitimateCorrect >= 1,
    'calibrated-confidence': signals.calibratedCorrect >= 1,
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
