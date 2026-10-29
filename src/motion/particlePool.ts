import { MOTION } from '../lib/motion';

interface Particle {
  el: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  active: boolean;
}

export class GoldParticlePool {
  private particles: Particle[] = [];
  private frame = 0;
  private host: HTMLElement | null = null;
  private onEmpty: (() => void) | null = null;

  constructor(private max: number = MOTION.particles.count) {}

  attach(host: HTMLElement) {
    this.host = host;
    for (let i = 0; i < this.max; i += 1) {
      const el = document.createElement('img');
      el.src = '/img/effect_coin_sparkle.png';
      el.alt = '';
      el.className = 'gold-particle';
      el.setAttribute('aria-hidden', 'true');
      el.style.opacity = '0';
      host.appendChild(el);
      this.particles.push({ el, x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false });
    }
  }

  burst(originX: number, originY: number, onEmpty?: () => void) {
    if (!this.host) return;
    this.onEmpty = onEmpty ?? null;
    this.particles.forEach((particle, index) => {
      const angle = (Math.PI * 2 * index) / this.max;
      particle.active = true;
      particle.life = MOTION.particles.lifeMs;
      particle.x = originX;
      particle.y = originY;
      particle.vx = Math.cos(angle) * 2.4;
      particle.vy = Math.sin(angle) * 2.4 - 1.2;
      particle.el.style.opacity = '1';
      particle.el.style.transform = `translate(${originX}px, ${originY}px) scale(0.35)`;
    });
    this.start();
  }

  private start() {
    if (this.frame) return;
    const step = (last: number) => (now: number) => {
      const dt = Math.min(32, now - last);
      let alive = false;
      this.particles.forEach((particle) => {
        if (!particle.active) return;
        particle.life -= dt;
        particle.vy += MOTION.particles.gravity;
        particle.x += particle.vx * (dt / 16);
        particle.y += particle.vy * (dt / 16);
        const t = Math.max(0, particle.life / MOTION.particles.lifeMs);
        particle.el.style.opacity = String(t);
        particle.el.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${0.2 + t * 0.25})`;
        if (particle.life <= 0) {
          particle.active = false;
          particle.el.style.opacity = '0';
        } else {
          alive = true;
        }
      });
      if (alive && !document.hidden) {
        this.frame = requestAnimationFrame(step(now));
      } else {
        this.frame = 0;
        this.particles.forEach((particle) => {
          particle.active = false;
          particle.el.style.opacity = '0';
        });
        this.onEmpty?.();
      }
    };
    this.frame = requestAnimationFrame(step(performance.now()));
  }

  dispose() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.particles.forEach((particle) => particle.el.remove());
    this.particles = [];
    this.host = null;
    this.onEmpty = null;
  }

  get activeCount() {
    return this.particles.filter((particle) => particle.active).length;
  }
}
