import { MAX_WISDOM, STARTING_COINS } from './versions';

export type FinaleDecision = 'safe' | 'pause' | 'loss';

export interface ScoreEvent {
  source: 'story' | 'quiz' | 'minigame' | 'finale';
  reason: string;
  deltaWisdom: number;
  deltaCoins: number;
}

export interface StoryChoiceRecord {
  chapterId: number;
  dialogueIndex: number;
  choiceId: string;
  choiceText: string;
  consequence?: string;
  wisdomChange: number;
  coinChange: number;
  selectedIndependentCheck: boolean;
}

export const SCORING_RULES = {
  wisdomMin: 0,
  wisdomMax: MAX_WISDOM,
  coinsMin: 0,
  startingCoins: STARTING_COINS,
  replayAwardsRewards: false,
  quizRewardOnlyIfCorrect: true,
  certificate: {
    minWisdom: 60,
    minPostTestPercent: 70,
    requireSafeOrPauseFinale: true,
    requirePositiveCoins: true,
  },
} as const;

export function clampWisdom(value: number): number {
  return Math.max(SCORING_RULES.wisdomMin, Math.min(SCORING_RULES.wisdomMax, value));
}

export function clampCoins(value: number): number {
  return Math.max(SCORING_RULES.coinsMin, value);
}

export function normalizeWisdomDelta(delta: number): number {
  if (delta === 0) return 0;
  if (delta > 0) {
    if (delta <= 15) return 3;
    if (delta <= 25) return 5;
    if (delta <= 40) return 7;
    return 10;
  }
  if (delta >= -10) return -3;
  if (delta >= -20) return -5;
  return -8;
}

export function applyScoreChange(
  current: { wisdom: number; coins: number; wisdomOverflow?: number },
  event: ScoreEvent,
  isReplay: boolean
): { wisdom: number; coins: number; wisdomOverflow: number; applied: ScoreEvent | null } {
  const overflow = current.wisdomOverflow ?? 0;
  if (isReplay || (event.deltaWisdom === 0 && event.deltaCoins === 0)) {
    return { wisdom: current.wisdom, coins: current.coins, wisdomOverflow: overflow, applied: null };
  }

  const applied: ScoreEvent = {
    ...event,
    deltaWisdom: normalizeWisdomDelta(event.deltaWisdom),
  };
  const uncapped = current.wisdom + applied.deltaWisdom;
  const nextWisdom = clampWisdom(uncapped);
  const overflowGain = applied.deltaWisdom > 0 ? Math.max(0, uncapped - SCORING_RULES.wisdomMax) : 0;

  return {
    wisdom: nextWisdom,
    coins: clampCoins(current.coins + applied.deltaCoins),
    wisdomOverflow: overflow + overflowGain,
    applied,
  };
}

export function describeScoreEvent(event: ScoreEvent): string {
  const parts: string[] = [];
  if (event.deltaWisdom !== 0) {
    parts.push(`Мудрость ${event.deltaWisdom > 0 ? '+' : ''}${event.deltaWisdom}`);
  }
  if (event.deltaCoins !== 0) {
    parts.push(`Монеты ${event.deltaCoins > 0 ? '+' : ''}${event.deltaCoins}`);
  }
  return `${parts.join(', ')}: ${event.reason}`;
}

export function isIndependentCheckChoice(text: string, consequence?: string): boolean {
  if (consequence === 'check') return true;
  if (consequence === 'pause' || consequence === 'safe' || consequence === 'risky' || consequence === 'loss') {
    return false;
  }
  return /независим|провер.*документ|провер.*договор|провер.*реестр|провер.*факт/i.test(text);
}

export interface FinalScoreInput {
  wisdom: number;
  coins: number;
  postTestCorrect: number;
  postTestTotal: number;
  finaleDecision: FinaleDecision | null;
  safeDecisionRate: number;
  independentCheckRate: number;
}

export interface FinalScore {
  total: number;
  parts: {
    tests: number;
    story: number;
    coins: number;
    checks: number;
  };
  earnsCertificate: boolean;
  reviewTopics: string[];
}

export function calculateFinalScore(input: FinalScoreInput): FinalScore {
  const postTestPercent = input.postTestTotal > 0
    ? (input.postTestCorrect / input.postTestTotal) * 100
    : 0;
  const tests = Math.round(postTestPercent * 0.4);
  const story = Math.round(input.wisdom * 0.25);
  const coins = Math.round((input.coins / STARTING_COINS) * 20);
  const checks = Math.round(input.independentCheckRate * 15);
  const total = Math.max(0, Math.min(100, tests + story + coins + checks));

  const reviewTopics: string[] = [];
  if (postTestPercent < 70) reviewTopics.push('Проверочные ситуации и ложные срабатывания');
  if (input.finaleDecision === 'loss') reviewTopics.push('Как остановиться и проверить предложение до перевода');
  if (input.coins <= 0) reviewTopics.push('Что делать после потери денег');
  if (input.safeDecisionRate < 0.6) reviewTopics.push('Признаки давления и нереалистичной доходности');
  if (input.independentCheckRate < 0.4) reviewTopics.push('Независимая проверка и правило паузы');

  const earnsCertificate =
    input.wisdom >= SCORING_RULES.certificate.minWisdom &&
    postTestPercent >= SCORING_RULES.certificate.minPostTestPercent &&
    input.finaleDecision !== 'loss' &&
    input.coins > 0;

  return {
    total,
    parts: { tests, story, coins, checks },
    earnsCertificate,
    reviewTopics,
  };
}
