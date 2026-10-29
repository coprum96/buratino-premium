import { useEffect, type RefObject } from 'react';
import { MOTION } from '../lib/motion';

interface TiltOptions {
  disabled?: boolean;
}

export function useBadgeTilt(ref: RefObject<HTMLElement>, options: TiltOptions = {}): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || options.disabled) {
      if (node) {
        node.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(12px)';
        node.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.35)';
      }
      return;
    }

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let dragging = false;
    let idle = 0;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const apply = () => {
      const shineX = 50 + currentY * 3;
      const shineY = 40 - currentX * 3;
      node.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateZ(12px)`;
      node.style.setProperty('--badge-shine-x', `${shineX}%`);
      node.style.setProperty('--badge-shine-y', `${shineY}%`);
      const shadowX = (-currentY * 1.4).toFixed(1);
      const shadowY = (10 + currentX * 1.2).toFixed(1);
      node.style.boxShadow = `${shadowX}px ${shadowY}px 28px rgba(0, 0, 0, 0.35)`;
    };

    const tick = () => {
      if (coarse && !dragging && Math.abs(targetX) < 0.05 && Math.abs(targetY) < 0.05) {
        idle += 0.016;
        targetX = Math.sin(idle * 0.7) * 2.4;
        targetY = Math.cos(idle * 0.55) * 2.4;
      }
      const damping = Math.abs(targetX) + Math.abs(targetY) < 0.2 && !coarse
        ? MOTION.tilt.returnDamping
        : MOTION.tilt.damping;
      currentX += (targetX - currentX) * damping;
      currentY += (targetY - currentY) * damping;
      apply();
      if (
        Math.abs(targetX - currentX) > 0.02
        || Math.abs(targetY - currentY) > 0.02
        || dragging
        || coarse
      ) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const startLoop = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const pointToTarget = (clientX: number, clientY: number) => {
      const rect = node.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;
      targetY = Math.max(-MOTION.tilt.maxDeg, Math.min(MOTION.tilt.maxDeg, nx * MOTION.tilt.maxDeg * 2));
      targetX = Math.max(-MOTION.tilt.maxDeg, Math.min(MOTION.tilt.maxDeg, -ny * MOTION.tilt.maxDeg * 2));
      startLoop();
    };

    const onMove = (event: PointerEvent) => {
      pointToTarget(event.clientX, event.clientY);
    };
    const onLeave = () => {
      dragging = false;
      targetX = 0;
      targetY = 0;
      startLoop();
    };
    const onDown = (event: PointerEvent) => {
      dragging = true;
      node.setPointerCapture(event.pointerId);
      pointToTarget(event.clientX, event.clientY);
    };
    const onUp = () => {
      dragging = false;
      targetX = 0;
      targetY = 0;
      startLoop();
    };

    const visibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden) {
        startLoop();
      }
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointerup', onUp);
    node.addEventListener('pointercancel', onUp);
    document.addEventListener('visibilitychange', visibility);
    startLoop();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointerup', onUp);
      node.removeEventListener('pointercancel', onUp);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [options.disabled, ref]);
}
