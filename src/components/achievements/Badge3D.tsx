import { useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useBadgeTilt } from '../../motion/useBadgeTilt';

interface Badge3DProps {
  asset: string;
  label: string;
  disableTilt?: boolean;
}

export function Badge3D({ asset, label, disableTilt = false }: Badge3DProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tiltOff = disableTilt || reduced;
  useBadgeTilt(plateRef, { disabled: tiltOff });

  return (
    <div className="badge-stage" data-tilt-disabled={tiltOff ? 'true' : 'false'}>
      <img src="/img/effect_golden_rays.png" alt="" className="badge-rays" />
      <div ref={plateRef} className="badge-3d" data-testid="badge-3d">
        <div className="badge-edge" aria-hidden="true" />
        <div className="badge-plate">
          <img src={asset} alt={label} className="badge-emblem" />
          <div className="badge-shine" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
