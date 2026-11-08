import { useEffect, useState, type RefObject } from 'react';
import { getEvidence } from '../../data/evidence';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface EvidenceRevealProps {
  ids: string[];
  targetRef: RefObject<HTMLElement | null>;
}

export function EvidenceReveal({ ids, targetRef }: EvidenceRevealProps) {
  const reduced = usePrefersReducedMotion();
  const firstId = ids[0];
  const item = firstId ? getEvidence(firstId) : undefined;
  const [visible, setVisible] = useState(Boolean(item));

  useEffect(() => {
    if (!item) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const life = reduced ? 280 : 900;
    const timer = window.setTimeout(() => setVisible(false), life);
    return () => window.clearTimeout(timer);
  }, [item, reduced]);

  if (!item || !visible) return null;

  const target = targetRef.current?.getBoundingClientRect();
  const flyX = target ? `${Math.round(target.left - 24)}px` : '80px';
  const flyY = target ? `${Math.round(target.top - 220)}px` : '-120px';

  return (
    <div
      className={`comic-fx ${reduced ? 'comic-evidence-fade' : 'comic-evidence-fly'}`}
      data-testid="evidence-reveal"
      style={{
        left: '1rem',
        bottom: '8rem',
        ['--comic-fly-x' as string]: flyX,
        ['--comic-fly-y' as string]: flyY,
      }}
      aria-hidden="true"
    >
      <div className="comic-evidence-card">{item.title}</div>
    </div>
  );
}
