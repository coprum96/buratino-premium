import { useEffect, useState } from 'react';
import { FILM_DURATION_MS, FILM_SCENES, sceneAt, sceneOpacity } from '../src/lib/filmTimeline';
import { filmProgress } from './clock';
import { BadgeUnlockScene } from './scenes/BadgeUnlockScene';
import { DecisionScene } from './scenes/DecisionScene';
import { DetectorScanScene } from './scenes/DetectorScanScene';
import { FinalPayoffScene } from './scenes/FinalPayoffScene';
import { FraudOfferScene } from './scenes/FraudOfferScene';
import { HookScene } from './scenes/HookScene';
import { ProductRevealScene } from './scenes/ProductRevealScene';
import { ProgressMontageScene } from './scenes/ProgressMontageScene';
import { VerificationToolsScene } from './scenes/VerificationToolsScene';

const SCENES = {
  hook: HookScene,
  reveal: ProductRevealScene,
  detect: FraudOfferScene,
  scan: DetectorScanScene,
  verify: VerificationToolsScene,
  decide: DecisionScene,
  badge: BadgeUnlockScene,
  montage: ProgressMontageScene,
  payoff: FinalPayoffScene,
} as const;

interface LaunchFilmProps {
  ratio?: '16x9' | '9x16' | '1x1';
}

export function LaunchFilm({ ratio = '16x9' }: LaunchFilmProps) {
  const [t, setT] = useState(0);
  const [scale, setScale] = useState(1);
  const width = ratio === '16x9' ? 1920 : 1080;
  const height = ratio === '9x16' ? 1920 : ratio === '1x1' ? 1080 : 1080;

  useEffect(() => {
    const update = () => {
      setScale(Math.min(window.innerWidth / width, window.innerHeight / height, 1));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [height, width]);

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = filmProgress(now, startedAt);
      setT(next);
      if (next < FILM_DURATION_MS) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    const visibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  const current = sceneAt(t);
  const caption = current.caption;

  return (
    <div className="film-stage">
    <main
      className={`film-root film-${ratio}`}
      data-testid="launch-film"
      data-duration={FILM_DURATION_MS}
      data-time={Math.round(t)}
      data-scene={current.id}
      style={{ transform: `scale(${scale})` }}
    >
      {FILM_SCENES.map((scene) => {
        const Scene = SCENES[scene.id as keyof typeof SCENES];
        const opacity = sceneOpacity(t, scene.startMs, scene.endMs);
        if (!Scene || opacity <= 0) return null;
        return (
          <div key={scene.id} className="film-layer" style={{ opacity }}>
            <Scene t={t} />
          </div>
        );
      })}
      <p className="film-caption" data-testid="film-caption">{caption}</p>
    </main>
    </div>
  );
}
