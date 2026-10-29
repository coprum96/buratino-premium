import { FILM_DURATION_MS, sceneOpacity } from '../src/lib/filmTimeline';

export { sceneOpacity };

export function filmProgress(now: number, startedAt: number, duration = FILM_DURATION_MS): number {
  return Math.min(duration, Math.max(0, now - startedAt));
}
