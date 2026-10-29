import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoldParticlePool } from './particlePool';

describe('GoldParticlePool', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reuses a fixed pool and removes nodes on dispose', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const pool = new GoldParticlePool(6);
    pool.attach(host);
    expect(host.querySelectorAll('.gold-particle')).toHaveLength(6);
    pool.burst(40, 40);
    expect(pool.activeCount).toBe(6);
    pool.dispose();
    expect(host.querySelectorAll('.gold-particle')).toHaveLength(0);
    expect(pool.activeCount).toBe(0);
  });
});
