import { EVIDENCE_CATALOG, STRONG_EVIDENCE_IDS, type EvidenceDefinition } from '../data/evidence';
import { uniqueIds } from './progress';

export function addEvidenceId(current: string[], id: string): string[] {
  if (!EVIDENCE_CATALOG.some((item) => item.id === id)) return uniqueIds(current);
  return uniqueIds([...current, id]);
}

export function foundEvidence(ids: string[]): EvidenceDefinition[] {
  const known = new Set(ids);
  return EVIDENCE_CATALOG.filter((item) => known.has(item.id));
}

export function unknownEvidence(ids: string[]): EvidenceDefinition[] {
  const known = new Set(ids);
  return EVIDENCE_CATALOG.filter((item) => !known.has(item.id));
}

export function strongEvidenceCount(ids: string[]): number {
  const known = new Set(ids);
  return STRONG_EVIDENCE_IDS.filter((id) => known.has(id)).length;
}

export function caseStrength(ids: string[]): number {
  const unique = uniqueIds(ids).filter((id) => EVIDENCE_CATALOG.some((item) => item.id === id));
  return Math.min(100, Math.round((unique.length / EVIDENCE_CATALOG.length) * 100));
}

export function reputationRank(reputation: number): string {
  if (reputation >= 85) return 'Золотой детектор';
  if (reputation >= 65) return 'Следователь';
  if (reputation >= 45) return 'Аналитик';
  if (reputation >= 20) return 'Наблюдатель';
  return 'Новичок';
}
