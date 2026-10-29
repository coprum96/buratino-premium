export const MOTION = {
  duration: {
    fast: 180,
    base: 280,
    slow: 480,
    enter: 640,
    scene: 900,
    unlock: 3200,
  },
  ease: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
    dim: 'cubic-bezier(0.33, 0, 0.2, 1)',
  },
  stagger: 70,
  tilt: {
    maxDeg: 8,
    damping: 0.14,
    returnDamping: 0.1,
  },
  particles: {
    count: 18,
    lifeMs: 900,
    gravity: 0.12,
  },
} as const;

export function motionMs(key: keyof typeof MOTION.duration): string {
  return `${MOTION.duration[key]}ms`;
}
