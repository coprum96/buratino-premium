import { describe, expect, it } from 'vitest';
import { FILM_SCENES, sceneOpacity } from './filmTimeline';

describe('film scene opacity', () => {
  it('never shows two scenes at the same timestamp', () => {
    for (const t of [0, 2999, 3000, 8000, 26000, 39999]) {
      const visible = FILM_SCENES.filter((scene) => sceneOpacity(t, scene.startMs, scene.endMs) > 0);
      expect(visible.length).toBeLessThanOrEqual(1);
    }
  });
});
