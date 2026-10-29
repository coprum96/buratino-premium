import { useEffect, useId, useRef, useState } from 'react';
import { getAchievement } from '../../data/achievements';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { MOTION } from '../../lib/motion';
import { GoldParticlePool } from '../../motion/particlePool';
import { Badge3D } from './Badge3D';

interface AchievementUnlockProps {
  achievementId: string;
  onClose: () => void;
  replay?: boolean;
}

export function AchievementUnlock({ achievementId, onClose, replay = false }: AchievementUnlockProps) {
  const achievement = getAchievement(achievementId);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const particleHost = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [ctaReady, setCtaReady] = useState(reduced);
  const [particlesGone, setParticlesGone] = useState(reduced);

  useEffect(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((node) => !node.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lastFocus.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (reduced) {
      setCtaReady(true);
      setParticlesGone(true);
      return;
    }
    const ready = window.setTimeout(() => {
      setCtaReady(true);
      ctaRef.current?.focus();
    }, MOTION.duration.unlock);
    return () => window.clearTimeout(ready);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !particleHost.current) return;
    const pool = new GoldParticlePool();
    pool.attach(particleHost.current);
    const burstTimer = window.setTimeout(() => {
      const host = particleHost.current;
      if (!host) return;
      pool.burst(host.clientWidth / 2 - 14, host.clientHeight * 0.38, () => setParticlesGone(true));
    }, 1680);
    return () => {
      window.clearTimeout(burstTimer);
      pool.dispose();
    };
  }, [reduced]);

  if (!achievement) return null;

  return (
    <div className="unlock-root">
      <div className="unlock-dim" onClick={ctaReady ? onClose : undefined} aria-hidden="true" />
      <div className="unlock-glow" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="unlock-card"
        data-testid="achievement-unlock"
        data-particles={particlesGone ? 'idle' : 'active'}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80 mb-3">
          {replay ? 'Повтор просмотра' : 'Достижение открыто'}
        </p>
        <Badge3D asset={achievement.asset} label={achievement.title} />
        <div ref={particleHost} className="unlock-particles" data-testid="particle-host" />
        <div className="unlock-copy mt-5">
          <p className="text-sm text-amber-200 mb-1">{rarityLabel(achievement.rarity)}</p>
          <h2 id={titleId} className="text-3xl font-bold mb-2">{achievement.title}</h2>
          <p className="unlock-copy unlock-reason text-white/85 mb-3">{achievement.description}</p>
          <p className="text-sm text-white/70 mb-2">Почему сейчас: {achievement.condition}</p>
          <p className="text-sm text-amber-100/90">{achievement.reward}</p>
        </div>
        <button
          ref={ctaRef}
          type="button"
          className="btn btn-primary unlock-cta"
          onClick={onClose}
          disabled={!ctaReady}
        >
          {ctaReady ? 'Продолжить' : 'Смотрим результат…'}
        </button>
      </div>
    </div>
  );
}

function rarityLabel(rarity: string): string {
  if (rarity === 'legendary') return 'Легендарное';
  if (rarity === 'rare') return 'Редкое';
  return 'Обычное';
}
