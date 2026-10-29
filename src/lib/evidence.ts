import {
  EVIDENCE_CATALOG,
  EVIDENCE_LINK_KIND,
  STRONG_EVIDENCE_IDS,
  evidenceLinkKey,
  getEvidence,
  type EvidenceDefinition,
  type EvidenceLinkKind,
  type EvidenceZone,
} from '../data/evidence';
import { uniqueIds } from './progress';

export type VisibleLinkKind = EvidenceLinkKind | 'unknown';

export interface EvidenceNeighbor {
  item: EvidenceDefinition;
  open: boolean;
  kind: VisibleLinkKind;
}

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

export function evidenceByZone(zone: EvidenceZone): EvidenceDefinition[] {
  return EVIDENCE_CATALOG.filter((item) => item.zone === zone);
}

export function lastFoundId(ids: string[]): string | undefined {
  const known = new Set(EVIDENCE_CATALOG.map((item) => item.id));
  for (let index = ids.length - 1; index >= 0; index -= 1) {
    if (known.has(ids[index])) return ids[index];
  }
  return undefined;
}

export function linkKindFor(a: string, b: string, found: string[]): VisibleLinkKind {
  const open = found.includes(a) && found.includes(b);
  if (!open) return 'unknown';
  return EVIDENCE_LINK_KIND[evidenceLinkKey(a, b)] ?? 'confirmed';
}

export function neighborsOf(id: string, found: string[]): EvidenceNeighbor[] {
  const item = getEvidence(id);
  if (!item) return [];
  const known = new Set(found);
  const neighborIds = new Set(item.links);
  for (const other of EVIDENCE_CATALOG) {
    if (other.id !== id && other.links.includes(id)) neighborIds.add(other.id);
  }
  return [...neighborIds]
    .map((linkId) => getEvidence(linkId))
    .filter((neighbor): neighbor is EvidenceDefinition => Boolean(neighbor))
    .map((neighbor) => ({
      item: neighbor,
      open: known.has(neighbor.id),
      kind: linkKindFor(id, neighbor.id, found),
    }));
}

export function reputationRank(reputation: number): string {
  if (reputation >= 85) return 'Золотой детектор';
  if (reputation >= 65) return 'Следователь';
  if (reputation >= 45) return 'Аналитик';
  if (reputation >= 20) return 'Наблюдатель';
  return 'Новичок';
}
