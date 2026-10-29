import { describe, expect, it } from 'vitest';
import { addEvidenceId, caseStrength, reputationRank, strongEvidenceCount } from './evidence';

describe('evidence helpers', () => {
  it('stores unique known clues only', () => {
    const once = addEvidenceId([], 'swapped-domain');
    const twice = addEvidenceId(once, 'swapped-domain');
    expect(twice).toEqual(['swapped-domain']);
    expect(addEvidenceId([], 'unknown-clue')).toEqual([]);
  });

  it('counts case strength from the catalog', () => {
    expect(caseStrength([])).toBe(0);
    expect(caseStrength(['swapped-domain', 'hidden-fee', 'unknown-clue'])).toBeGreaterThan(0);
    expect(strongEvidenceCount(['swapped-domain', 'promised-yield'])).toBeGreaterThan(0);
  });

  it('maps reputation to a readable rank', () => {
    expect(reputationRank(0)).toBe('Новичок');
    expect(reputationRank(50)).toBe('Аналитик');
    expect(reputationRank(90)).toBe('Золотой детектор');
  });
});
