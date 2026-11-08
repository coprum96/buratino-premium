import { useEffect, useState, type RefObject } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface CoinTransferProps {
  coinsDelta: number;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
}

export function CoinTransfer({ coinsDelta, fromRef, toRef }: CoinTransferProps) {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (coinsDelta >= 0) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const life = reduced ? 280 : 560;
    const timer = window.setTimeout(() => setVisible(false), life);
    return () => window.clearTimeout(timer);
  }, [coinsDelta, reduced]);

  if (!visible || coinsDelta >= 0) return null;

  const from = fromRef.current?.getBoundingClientRect();
  const to = toRef.current?.getBoundingClientRect();
  const startLeft = from?.left ?? 16;
  const startTop = from?.top ?? 12;
  const flyX = to ? `${Math.round(to.left - startLeft)}px` : '40px';
  const flyY = to ? `${Math.round(to.top - startTop)}px` : '90px';

  return (
    <div
      className={`comic-fx ${reduced ? 'comic-coin-fade' : 'comic-coin-fly'}`}
      data-testid="coin-transfer"
      style={{
        left: startLeft,
        top: startTop,
        ['--comic-fly-x' as string]: flyX,
        ['--comic-fly-y' as string]: flyY,
      }}
      aria-hidden="true"
    />
  );
}
