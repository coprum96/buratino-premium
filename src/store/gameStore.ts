import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { stageIdFor } from '../data/learningStages';
import { resolveEnding, type EndingId } from '../lib/endings';
import { addEvidenceId } from '../lib/evidence';
import { addCompletedActivity, addCompletedChapter, nextUnlockedChapter, uniqueIds, uniqueSortedNumbers } from '../lib/progress';
import { playCue, setSoundMuted } from '../lib/sound';
import {
  applyScoreChange,
  calculateFinalScore,
  isIndependentCheckChoice,
  type FinaleDecision,
  type FinalScore,
  type ScoreEvent,
  type StoryChoiceRecord,
} from '../lib/scoring';
import {
  createDefaultPersistedState,
  createParticipantId,
  migrateSave,
  type PersistedGameState,
} from '../lib/storage';
import { evaluateAchievements, mergeUnlocks } from '../lib/achievements';
import { recordResearchEvent } from '../lib/research/events';
import { SAVE_SCHEMA_VERSION, SAVE_STORAGE_KEY, STARTING_COINS } from '../lib/versions';
import { AccessStatus, validatePromoCode } from '../utils/accessControl';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import type { GamePhase } from './gameTypes';

export type { GamePhase } from './gameTypes';

interface GameState extends PersistedGameState {
  showMaterialsPanel: boolean;
  showAchievementGallery: boolean;
  pendingAchievementQueue: string[];
  globalCitizensCount: number;
  victimCount: number;
  isReplayingChapter: boolean;

  setPhase: (phase: GamePhase) => void;
  applyReward: (event: ScoreEvent) => void;
  addCoins: (amount: number, reason?: string) => void;
  addWisdom: (amount: number, reason?: string) => void;
  nextLevel: () => void;
  setCurrentDialogue: (index: number) => void;
  enterChapter: (levelId: number) => void;
  completeStory: (levelId: number) => void;
  completeQuiz: (levelId: number, score: number, total: number) => void;
  completeChapter: (levelId: number) => void;
  recordStoryChoice: (choice: Omit<StoryChoiceRecord, 'selectedIndependentCheck'> & { selectedIndependentCheck?: boolean }) => void;
  setFinaleDecision: (decision: FinaleDecision) => void;
  addAchievement: (achievement: string) => void;
  dismissAchievement: () => void;
  toggleMaterialsPanel: () => void;
  toggleAchievementGallery: () => void;
  noteRedFlagOpen: () => void;
  noteFinePrintOpen: () => void;
  noteAssessmentResult: (payload: { kind: string; isCorrect: boolean; confidence: number }) => void;
  setPostTestScore: (score: number) => void;
  markOnboardingSeen: () => void;
  resetGame: () => void;
  incrementCitizensCount: () => void;
  setAccessStatus: (status: AccessStatus) => void;
  setPendingLevel: (level: number | null) => void;
  activatePromoCode: (code: string) => { success: boolean; error?: string };
  checkLevelAccess: (levelId: number) => boolean;
  continueFromPaywall: () => void;
  getEndingId: () => EndingId;
  getFinalScore: () => FinalScore;
  collectEvidence: (ids: string[]) => void;
  setStoryFlags: (flags: string[]) => void;
  toggleSoundMuted: () => void;
}

const UI_DEFAULTS = {
  showMaterialsPanel: false,
  showAchievementGallery: false,
  pendingAchievementQueue: [] as string[],
  globalCitizensCount: 0,
  victimCount: 13495302,
  isReplayingChapter: false,
};

function syncAchievements(set: (partial: Partial<GameState>) => void, get: () => GameState) {
  const state = get();
  const nextIds = evaluateAchievements({
    redFlagOpens: state.redFlagOpens,
    finePrintOpens: state.finePrintOpens,
    legitimateCorrect: state.legitimateCorrect,
    calibratedCorrect: state.calibratedCorrect,
    postTestScore: state.postTestScore,
    completedChapters: state.completedChapters,
    storyChoices: state.storyChoices,
    evidenceFound: state.evidenceFound,
  }, Object.keys(state.achievementUnlocks));
  if (nextIds.length === 0) return;
  const unlocks = mergeUnlocks(state.achievementUnlocks, nextIds);
  nextIds.forEach((id) => {
    recordResearchEvent(state.participantId, 'achievement_unlock', { itemId: id, completed: true });
  });
  if (!state.soundMuted) playCue('achievement');
  set({
    achievementUnlocks: unlocks,
    achievements: Object.keys(unlocks),
    pendingAchievementQueue: [...state.pendingAchievementQueue, ...nextIds],
  });
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...createDefaultPersistedState(),
      ...UI_DEFAULTS,

      setPhase: (phase) => set({ phase }),

      applyReward: (event) => {
        const state = get();
        const next = applyScoreChange(state, event, state.isReplayingChapter);
        set({
          wisdom: next.wisdom,
          coins: next.coins,
          wisdomOverflow: next.wisdomOverflow,
          lastScoreEvent: next.applied,
        });
        if (next.applied && !get().soundMuted) {
          playCue(next.applied.deltaCoins !== 0 ? 'coins' : 'evidence');
        }
      },

      addCoins: (amount, reason = 'Изменение монет') => {
        get().applyReward({
          source: 'story',
          reason,
          deltaWisdom: 0,
          deltaCoins: amount,
        });
      },

      addWisdom: (amount, reason = 'Изменение мудрости') => {
        get().applyReward({
          source: 'story',
          reason,
          deltaWisdom: amount,
          deltaCoins: 0,
        });
      },

      nextLevel: () => set((state) => ({
        currentLevel: nextUnlockedChapter(state.completedChapters),
        currentDialogue: 0,
        phase: 'chapterMap',
        isReplayingChapter: false,
      })),

      setCurrentDialogue: (index) => set({ currentDialogue: index }),

      enterChapter: (levelId) => set((state) => {
        const replaying = state.completedChapters.includes(levelId);
        const resuming = !replaying && state.currentLevel === levelId && state.chapterStarted.includes(levelId);
        return {
          currentLevel: levelId,
          currentDialogue: resuming ? state.currentDialogue : 0,
          phase: 'dialogue',
          isReplayingChapter: replaying,
          lastScoreEvent: null,
          chapterStarted: uniqueSortedNumbers([...state.chapterStarted, levelId]),
        };
      }),

      completeStory: (levelId) => {
        sessionAnalytics.completeLevel(levelId);
        set((state) => ({
          completedActivities: addCompletedActivity(state.completedActivities, stageIdFor(levelId, 'story')),
        }));
      },

      completeQuiz: (levelId, score, total) => {
        set((state) => ({
          completedActivities: addCompletedActivity(state.completedActivities, stageIdFor(levelId, 'quiz')),
          chapterQuizScores: {
            ...state.chapterQuizScores,
            [levelId]: total > 0 ? Math.round((score / total) * 100) : 0,
          },
        }));
        get().completeChapter(levelId);
      },

      completeChapter: (levelId) => {
        sessionAnalytics.completeLevel(levelId);
        set((state) => {
          const completedChapters = addCompletedChapter(state.completedChapters, levelId);
          return {
            completedChapters,
            currentLevel: nextUnlockedChapter(completedChapters),
          };
        });
        syncAchievements(set, get);
      },

      recordStoryChoice: (choice) => {
        const selectedIndependentCheck = choice.selectedIndependentCheck
          ?? isIndependentCheckChoice(choice.choiceText, choice.consequence);
        set((state) => ({
          storyChoices: [
            ...state.storyChoices,
            { ...choice, selectedIndependentCheck },
          ],
        }));

        if (choice.consequence === 'safe' || choice.consequence === 'pause' || choice.consequence === 'loss') {
          if (choice.chapterId === 7) {
            get().setFinaleDecision(choice.consequence);
          }
        }
        syncAchievements(set, get);
      },

      setFinaleDecision: (decision) => set({ finaleDecision: decision }),

      addAchievement: (achievement) => {
        if (get().achievementUnlocks[achievement]) return;
        const unlocks = mergeUnlocks(get().achievementUnlocks, [achievement]);
        set({
          achievementUnlocks: unlocks,
          achievements: Object.keys(unlocks),
          pendingAchievementQueue: [...get().pendingAchievementQueue, achievement],
        });
      },

      dismissAchievement: () => set((state) => ({
        pendingAchievementQueue: state.pendingAchievementQueue.slice(1),
      })),

      toggleMaterialsPanel: () => set((state) => ({
        showMaterialsPanel: !state.showMaterialsPanel,
      })),

      toggleAchievementGallery: () => set((state) => ({
        showAchievementGallery: !state.showAchievementGallery,
      })),

      noteRedFlagOpen: () => {
        set((state) => ({ redFlagOpens: state.redFlagOpens + 1 }));
        syncAchievements(set, get);
      },

      noteFinePrintOpen: () => {
        set((state) => ({ finePrintOpens: state.finePrintOpens + 1 }));
        syncAchievements(set, get);
      },

      noteAssessmentResult: ({ kind, isCorrect, confidence }) => {
        set((state) => ({
          legitimateCorrect: state.legitimateCorrect + (kind === 'legitimate' && isCorrect ? 1 : 0),
          calibratedCorrect: state.calibratedCorrect + (isCorrect && confidence >= 4 ? 1 : 0),
        }));
        syncAchievements(set, get);
      },

      setPostTestScore: (score) => {
        set({ postTestScore: score });
        const state = get();
        sessionAnalytics.updateFinalStats(state.coins, state.wisdom, Object.keys(state.achievementUnlocks));
        syncAchievements(set, get);
      },

      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),

      incrementCitizensCount: () => set((state) => ({
        globalCitizensCount: state.globalCitizensCount + 1,
      })),

      resetGame: () => {
        sessionAnalytics.endSession();
        set({
          ...createDefaultPersistedState(),
          ...UI_DEFAULTS,
          participantId: createParticipantId(),
        });
      },

      setAccessStatus: (status) => set({ accessStatus: status }),

      setPendingLevel: (level) => set({ pendingLevel: level }),

      activatePromoCode: (code) => {
        const validatedStatus = validatePromoCode(code);
        if (validatedStatus) {
          set({ accessStatus: validatedStatus });
          return { success: true };
        }
        return {
          success: false,
          error: 'Неверный промокод. Попробуй ещё раз.',
        };
      },

      checkLevelAccess: (levelId) => {
        const state = get();
        if (levelId <= 2) return true;
        return state.accessStatus === 'promo' || state.accessStatus === 'paid';
      },

      continueFromPaywall: () => {
        const state = get();
        if (state.pendingLevel !== null) {
          set({
            currentLevel: state.pendingLevel,
            currentDialogue: 0,
            phase: 'chapterMap',
            pendingLevel: null,
          });
          return;
        }
        set({ phase: 'chapterMap' });
      },

      collectEvidence: (ids) => {
        if (ids.length === 0) return;
        const state = get();
        if (state.isReplayingChapter) return;
        const evidenceFound = ids.reduce((acc, id) => addEvidenceId(acc, id), state.evidenceFound);
        if (evidenceFound.length === state.evidenceFound.length) return;
        set({ evidenceFound });
        if (!state.soundMuted) playCue('evidence');
        syncAchievements(set, get);
      },

      setStoryFlags: (flags) => {
        if (flags.length === 0) return;
        set((state) => ({
          storyFlags: uniqueIds([...state.storyFlags, ...flags]),
        }));
        syncAchievements(set, get);
      },

      toggleSoundMuted: () => {
        const next = !get().soundMuted;
        setSoundMuted(next);
        set({ soundMuted: next });
      },

      getEndingId: () => {
        const state = get();
        return resolveEnding({
          finaleDecision: state.finaleDecision,
          coins: state.coins,
          lostAllCoins: state.coins <= 0 || state.finaleDecision === 'loss',
          evidenceFound: state.evidenceFound,
          storyFlags: state.storyFlags,
        });
      },

      getFinalScore: () => {
        const state = get();
        const checks = state.storyChoices.filter((choice) => choice.selectedIndependentCheck).length;
        const safe = state.storyChoices.filter((choice) => (
          choice.consequence === 'safe' || choice.consequence === 'check' || choice.consequence === 'pause'
        )).length;
        return calculateFinalScore({
          wisdom: state.wisdom,
          coins: state.coins,
          postTestCorrect: state.postTestScore,
          postTestTotal: 10,
          finaleDecision: state.finaleDecision,
          safeDecisionRate: state.storyChoices.length ? safe / state.storyChoices.length : 0,
          independentCheckRate: state.storyChoices.length ? checks / state.storyChoices.length : 0,
        });
      },
    }),
    {
      name: SAVE_STORAGE_KEY,
      version: SAVE_SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => migrateSave(persisted),
      merge: (persisted, current) => ({
        ...current,
        ...migrateSave(persisted),
      }),
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        gameVersion: state.gameVersion,
        scenarioVersion: state.scenarioVersion,
        itemBankVersion: state.itemBankVersion,
        coins: state.coins,
        wisdom: state.wisdom,
        wisdomOverflow: state.wisdomOverflow,
        currentLevel: state.currentLevel,
        currentDialogue: state.currentDialogue,
        completedChapters: state.completedChapters,
        completedActivities: state.completedActivities,
        chapterQuizScores: state.chapterQuizScores,
        postTestScore: state.postTestScore,
        storyChoices: state.storyChoices,
        finaleDecision: state.finaleDecision,
        achievements: state.achievements,
        achievementUnlocks: state.achievementUnlocks,
        redFlagOpens: state.redFlagOpens,
        finePrintOpens: state.finePrintOpens,
        legitimateCorrect: state.legitimateCorrect,
        calibratedCorrect: state.calibratedCorrect,
        accessStatus: state.accessStatus,
        pendingLevel: state.pendingLevel,
        phase: state.phase === 'paywall' ? 'chapterMap' : state.phase,
        hasSeenOnboarding: state.hasSeenOnboarding,
        participantId: state.participantId,
        lastScoreEvent: null,
        evidenceFound: state.evidenceFound,
        storyFlags: state.storyFlags,
        chapterStarted: state.chapterStarted,
        soundMuted: state.soundMuted,
      }),
    }
  )
);

export { STARTING_COINS };
