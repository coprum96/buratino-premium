import { expect, test } from '@playwright/test';
import { FILM_DURATION_MS, FILM_SCENES } from '../src/lib/filmTimeline';

test('film timeline is complete and uses documented adapters', () => {
  expect(FILM_DURATION_MS).toBe(40000);
  expect(FILM_SCENES).toHaveLength(9);
  expect(FILM_SCENES.every((scene) => scene.caption.length > 0)).toBe(true);
  const components = FILM_SCENES.map((scene) => scene.component);
  expect(components).toContain('BadgeUnlockScene');
  expect(components).toContain('FraudOfferScene');
});
