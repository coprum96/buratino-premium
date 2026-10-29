import type { AssessmentItem, OfferKind } from '../../data/assessmentBank';
import type { StoryChoiceRecord } from '../scoring';
import type { ResearchEvent } from './events';

export interface LearningMetrics {
  safeDecisionRate: number;
  missedScamRate: number;
  falsePositiveRate: number;
  independentCheckRate: number;
  confidenceCalibration: number;
  immediateScore: number | null;
  delayedScore: number | null;
}

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(3));
}

export function computeStoryMetrics(choices: StoryChoiceRecord[]) {
  const decisions = choices.filter((choice) => choice.consequence);
  const safe = decisions.filter((choice) => choice.consequence === 'safe' || choice.consequence === 'check' || choice.consequence === 'pause');
  const checks = choices.filter((choice) => choice.selectedIndependentCheck);
  return {
    safeDecisionRate: rate(safe.length, Math.max(1, decisions.length)),
    independentCheckRate: rate(checks.length, Math.max(1, choices.length)),
  };
}

export function computeAssessmentMetrics(
  events: ResearchEvent[],
  items: AssessmentItem[]
): Pick<LearningMetrics, 'missedScamRate' | 'falsePositiveRate' | 'confidenceCalibration' | 'immediateScore' | 'delayedScore'> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const answers = events.filter((event) => event.type === 'assessment_answer' && event.itemId);

  const scam = answers.filter((event) => byId.get(event.itemId!)?.kind === 'scam');
  const legit = answers.filter((event) => byId.get(event.itemId!)?.kind === 'legitimate');
  const missedScam = scam.filter((event) => event.isCorrect === false);
  const falsePositives = legit.filter((event) => event.isCorrect === false);

  const withConfidence = answers.filter((event) => typeof event.confidence === 'number');
  const calibrated = withConfidence.filter((event) => {
    const confidence = event.confidence ?? 0;
    return event.isCorrect ? confidence >= 3 : confidence <= 3;
  });

  const immediate = answers.filter((event) => event.wave === 'immediate');
  const delayed = answers.filter((event) => event.wave === 'delayed');

  return {
    missedScamRate: rate(missedScam.length, scam.length),
    falsePositiveRate: rate(falsePositives.length, legit.length),
    confidenceCalibration: rate(calibrated.length, withConfidence.length),
    immediateScore: immediate.length
      ? rate(immediate.filter((event) => event.isCorrect).length, immediate.length)
      : null,
    delayedScore: delayed.length
      ? rate(delayed.filter((event) => event.isCorrect).length, delayed.length)
      : null,
  };
}

export function classifyAnswer(kind: OfferKind, selectedLabel: 'scam' | 'legitimate' | 'unknown'): 'hit' | 'miss' | 'false-positive' | 'correct-unknown' {
  if (kind === 'scam') return selectedLabel === 'scam' ? 'hit' : 'miss';
  if (kind === 'legitimate') return selectedLabel === 'scam' ? 'false-positive' : 'hit';
  return selectedLabel === 'unknown' ? 'correct-unknown' : 'miss';
}
