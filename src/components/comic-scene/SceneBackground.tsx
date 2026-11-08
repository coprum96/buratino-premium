import { useState } from 'react';
import type { ResponsiveAsset } from '../../scenes/types';

interface SceneBackgroundProps {
  asset: ResponsiveAsset;
}

export function SceneBackground({ asset }: SceneBackgroundProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="comic-bg" data-testid="scene-background">
      <img
        className="comic-bg-preview"
        src={asset.preview}
        alt=""
        aria-hidden="true"
      />
      {failed ? (
        <div className="comic-bg-fallback" data-testid="background-fallback" />
      ) : (
        <picture>
          <source media="(min-width: 1024px)" srcSet={asset.desktop} />
          <source media="(min-width: 640px)" srcSet={asset.tablet} />
          <img
            src={asset.mobile}
            alt={asset.alt}
            width={390}
            height={694}
            decoding="async"
            onError={() => setFailed(true)}
          />
        </picture>
      )}
      <div className="comic-bg-grain" aria-hidden="true" />
    </div>
  );
}
