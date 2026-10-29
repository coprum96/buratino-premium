import { describe, expect, it } from 'vitest';
import { assessmentBank } from '../../data/assessmentBank';
import { classifyAnswer, computeAssessmentMetrics, computeStoryMetrics } from './metrics';

describe('research metrics', () => {
  it('separates missed scams from false positives', () => {
    const metrics = computeAssessmentMetrics([
      { type: 'assessment_answer', itemId: 'imm-01', isCorrect: false, confidence: 5, wave: 'immediate' } as never,
      { type: 'assessment_answer', itemId: 'imm-02', isCorrect: false, confidence: 5, wave: 'immediate' } as never,
      { type: 'assessment_answer', itemId: 'imm-02', isCorrect: true, confidence: 4, wave: 'immediate' } as never,
    ], assessmentBank);

    expect(metrics.missedScamRate).toBeGreaterThan(0);
    expect(metrics.falsePositiveRate).toBeGreaterThan(0);
  });

  it('tracks independent checks in story choices', () => {
    const metrics = computeStoryMetrics([
      { chapterId: 1, dialogueIndex: 0, choiceId: 'a', choiceText: 'Могу проверить?', consequence: 'check', wisdomChange: 10, coinChange: 0, selectedIndependentCheck: true },
      { chapterId: 7, dialogueIndex: 0, choiceId: 'b', choiceText: 'Вложу всё', consequence: 'loss', wisdomChange: -20, coinChange: -5, selectedIndependentCheck: false },
    ]);
    expect(metrics.independentCheckRate).toBe(0.5);
    expect(metrics.safeDecisionRate).toBe(0.5);
  });

  it('classifies unknown-data items separately', () => {
    expect(classifyAnswer('insufficient-data', 'unknown')).toBe('correct-unknown');
    expect(classifyAnswer('legitimate', 'scam')).toBe('false-positive');
  });
});
