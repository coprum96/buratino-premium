import { describe, expect, it } from 'vitest';
import { EVIDENCE_CATALOG, EVIDENCE_LINK_KIND, EVIDENCE_ZONES, evidenceLinkKey, getEvidence } from '../data/evidence';
import { addEvidenceId, caseStrength, linkKindFor, neighborsOf, reputationRank, strongEvidenceCount } from './evidence';

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

  it('puts every clue in a board zone without spoiling hidden titles', () => {
    const zoneIds = new Set(EVIDENCE_ZONES.map((zone) => zone.id));
    expect(EVIDENCE_CATALOG).toHaveLength(14);
    for (const item of EVIDENCE_CATALOG) {
      expect(zoneIds.has(item.zone)).toBe(true);
      expect(item.unlockHint.length).toBeGreaterThan(8);
      expect(item.unlockHint.toLowerCase()).not.toContain(item.title.toLowerCase());
    }
  });

  it('keeps a domain mismatch as a contradiction only after both ends are found', () => {
    expect(linkKindFor('golden-stage', 'swapped-domain', ['golden-stage'])).toBe('unknown');
    expect(linkKindFor('golden-stage', 'swapped-domain', ['golden-stage', 'swapped-domain'])).toBe('contradiction');
    expect(neighborsOf('karabas', ['karabas', 'golden-stage'])[0]?.kind).toBe('confirmed');
    const fromCompany = neighborsOf('golden-stage', ['golden-stage', 'promised-yield']);
    expect(fromCompany.some((neighbor) => neighbor.item.id === 'promised-yield' && neighbor.kind === 'hypothesis')).toBe(true);
  });

  it('only types links that exist in the catalog graph', () => {
    for (const key of Object.keys(EVIDENCE_LINK_KIND)) {
      const [leftId, rightId] = key.split('|');
      const left = getEvidence(leftId);
      const right = getEvidence(rightId);
      expect(left && right && (left.links.includes(rightId) || right.links.includes(leftId))).toBe(true);
      expect(key).toBe(evidenceLinkKey(leftId, rightId));
    }
  });
});
