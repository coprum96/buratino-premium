import type { AccessStatus } from '../utils/accessControl';
import type { GamePhase } from '../store/gameTypes';
import type { FinaleDecision, ScoreEvent, StoryChoiceRecord } from './scoring';
import { addCompletedActivity, addCompletedChapter, canOpenChapter, nextUnlockedChapter, uniqueIds, uniqueSortedNumbers } from './progress';
import {
  GAME_VERSION,
  ITEM_BANK_VERSION,
  SAVE_SCHEMA_VERSION,
  SAVE_STORAGE_KEY,
  SCENARIO_VERSION,
  STARTING_COINS,
} from './versions';

export interface PersistedGameState {
  schemaVersion: number;
  gameVersion: string;
  scenarioVersion: string;
  itemBankVersion: string;
  coins: number;
  wisdom: number;
  wisdomOverflow: number;
  currentLevel: number;
  currentDialogue: number;
  completedChapters: number[];
  completedActivities: string[];
  chapterQuizScores: Record<number, number>;
  postTestScore: number;
  storyChoices: StoryChoiceRecord[];
  finaleDecision: FinaleDecision | null;
  achievements: string[];
  achievementUnlocks: Record<string, string>;
  redFlagOpens: number;
  finePrintOpens: number;
  legitimateCorrect: number;
  calibratedCorrect: number;
  accessStatus: AccessStatus;
  pendingLevel: number | null;
  phase: GamePhase;
  hasSeenOnboarding: boolean;
  participantId: string;
  lastScoreEvent: ScoreEvent | null;
  evidenceFound: string[];
  storyFlags: string[];
  chapterStarted: number[];
  soundMuted: boolean;
}

export function createParticipantId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `p_${crypto.randomUUID()}`;
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultPersistedState(): PersistedGameState {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameVersion: GAME_VERSION,
    scenarioVersion: SCENARIO_VERSION,
    itemBankVersion: ITEM_BANK_VERSION,
    coins: STARTING_COINS,
    wisdom: 0,
    wisdomOverflow: 0,
    currentLevel: 0,
    currentDialogue: 0,
    completedChapters: [],
    completedActivities: [],
    chapterQuizScores: {},
    postTestScore: 0,
    storyChoices: [],
    finaleDecision: null,
    achievements: [],
    achievementUnlocks: {},
    redFlagOpens: 0,
    finePrintOpens: 0,
    legitimateCorrect: 0,
    calibratedCorrect: 0,
    accessStatus: 'free',
    pendingLevel: null,
    phase: 'landing',
    hasSeenOnboarding: false,
    participantId: createParticipantId(),
    lastScoreEvent: null,
    evidenceFound: [],
    storyFlags: [],
    chapterStarted: [],
    soundMuted: false,
  };
}

function asNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asCount(value: unknown): number {
  return typeof value === 'number' && value >= 0 ? value : 0;
}

function asStringRecord(value: unknown, fallbackIds: string[] = []): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
  }
  return Object.fromEntries(fallbackIds.map((id) => [id, '']));
}

function repairCurrentLevel(currentLevel: number, completedChapters: number[]): number {
  if (canOpenChapter(currentLevel, completedChapters)) return currentLevel;
  return nextUnlockedChapter(completedChapters);
}

function migrateLegacyCompletedLevels(completedLevels: unknown): { chapters: number[]; activities: string[] } {
  const raw = asNumberArray(completedLevels);
  const chapters = uniqueSortedNumbers(raw);
  const activities = chapters.flatMap((chapterId) => {
    if (chapterId >= 7) return [];
    return [`ch${chapterId}-story`, `ch${chapterId}-quiz`];
  });
  return { chapters, activities };
}

export function migrateSave(raw: unknown): PersistedGameState {
  const base = createDefaultPersistedState();
  if (!raw || typeof raw !== 'object') {
    return base;
  }

  const data = raw as Record<string, unknown>;
  const persisted = (data.state && typeof data.state === 'object'
    ? data.state
    : data) as Record<string, unknown>;

  const legacy = migrateLegacyCompletedLevels(persisted.completedLevels);
  const completedChapters = uniqueSortedNumbers([
    ...legacy.chapters,
    ...asNumberArray(persisted.completedChapters),
  ]).reduce((acc, id) => addCompletedChapter(acc, id), [] as number[]);

  const completedActivities = uniqueIds([
    ...legacy.activities,
    ...asStringArray(persisted.completedActivities),
  ]).reduce((acc, id) => addCompletedActivity(acc, id), [] as string[]);

  const accessStatus = persisted.accessStatus;
  const finaleDecision = persisted.finaleDecision;
  const achievements = asStringArray(persisted.achievements);
  const achievementUnlocks = asStringRecord(persisted.achievementUnlocks, achievements);
  const mergedAchievements = Array.from(new Set([...achievements, ...Object.keys(achievementUnlocks)]));
  const rawLevel = typeof persisted.currentLevel === 'number' ? persisted.currentLevel : base.currentLevel;
  const currentLevel = repairCurrentLevel(rawLevel, completedChapters);
  const jumpedAhead = rawLevel !== currentLevel;
  const rawPhase = typeof persisted.phase === 'string' ? persisted.phase as GamePhase : 'landing';
  const phase = jumpedAhead && (rawPhase === 'dialogue' || rawPhase === 'quiz')
    ? 'chapterMap'
    : rawPhase;

  return {
    ...base,
    coins: typeof persisted.coins === 'number' ? persisted.coins : base.coins,
    wisdom: typeof persisted.wisdom === 'number' ? persisted.wisdom : base.wisdom,
    wisdomOverflow: typeof persisted.wisdomOverflow === 'number' ? persisted.wisdomOverflow : 0,
    currentLevel,
    currentDialogue: jumpedAhead
      ? 0
      : typeof persisted.currentDialogue === 'number' ? persisted.currentDialogue : base.currentDialogue,
    completedChapters,
    completedActivities,
    chapterQuizScores: persisted.chapterQuizScores && typeof persisted.chapterQuizScores === 'object'
      ? persisted.chapterQuizScores as Record<number, number>
      : {},
    postTestScore: typeof persisted.postTestScore === 'number' ? persisted.postTestScore : 0,
    storyChoices: Array.isArray(persisted.storyChoices) ? persisted.storyChoices as PersistedGameState['storyChoices'] : [],
    finaleDecision: finaleDecision === 'safe' || finaleDecision === 'pause' || finaleDecision === 'loss'
      ? finaleDecision
      : null,
    achievements: mergedAchievements,
    achievementUnlocks,
    redFlagOpens: asCount(persisted.redFlagOpens),
    finePrintOpens: asCount(persisted.finePrintOpens),
    legitimateCorrect: asCount(persisted.legitimateCorrect),
    calibratedCorrect: asCount(persisted.calibratedCorrect),
    accessStatus: accessStatus === 'promo' || accessStatus === 'paid' || accessStatus === 'free' || accessStatus === 'locked'
      ? accessStatus
      : 'free',
    pendingLevel: typeof persisted.pendingLevel === 'number' ? persisted.pendingLevel : null,
    phase,
    hasSeenOnboarding: Boolean(persisted.hasSeenOnboarding),
    participantId: typeof persisted.participantId === 'string' ? persisted.participantId : base.participantId,
    lastScoreEvent: null,
    evidenceFound: uniqueIds(asStringArray(persisted.evidenceFound)),
    storyFlags: uniqueIds(asStringArray(persisted.storyFlags)),
    chapterStarted: uniqueSortedNumbers(asNumberArray(persisted.chapterStarted)),
    soundMuted: Boolean(persisted.soundMuted),
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameVersion: GAME_VERSION,
    scenarioVersion: SCENARIO_VERSION,
    itemBankVersion: ITEM_BANK_VERSION,
  };
}

export function readSavedState(): PersistedGameState | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(SAVE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return migrateSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSavedState(state: PersistedGameState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify({
    state,
    version: SAVE_SCHEMA_VERSION,
  }));
}

export function clearSavedState(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(SAVE_STORAGE_KEY);
}

export function hasRestorableProgress(state: PersistedGameState | null): boolean {
  if (!state) return false;
  return (
    state.completedChapters.length > 0 ||
    state.completedActivities.length > 0 ||
    state.currentLevel > 0 ||
    state.phase !== 'landing' ||
    state.accessStatus === 'promo' ||
    state.accessStatus === 'paid' ||
    state.wisdom > 0
  );
}
