import { useState, type Ref } from 'react';
import { characters } from '../../data/gameData';
import type { CharacterPlacement } from '../../scenes/types';
import { SceneFallback } from './SceneFallback';

interface CharacterLayerProps {
  placement: CharacterPlacement;
  layerRef?: Ref<HTMLDivElement>;
}

export function CharacterLayer({ placement, layerRef }: CharacterLayerProps) {
  const [failed, setFailed] = useState(false);
  const person = characters[placement.characterId];
  const name = person?.name ?? placement.characterId;
  const showImage = Boolean(placement.asset) && !failed;
  const active = placement.active !== false;

  return (
    <div
      ref={layerRef}
      className="comic-character"
      data-side={placement.side}
      data-emotion={placement.emotion}
      data-active={active ? 'true' : 'false'}
      data-testid="character-portrait"
      style={{
        left: `${placement.anchorX}%`,
        width: `min(${placement.mobileWidth ?? placement.width}%, 13rem)`,
        zIndex: placement.zIndex,
      }}
    >
      {showImage ? (
        <img
          src={placement.asset}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <SceneFallback name={name} side={placement.side} />
      )}
      <p className="comic-character-name">{name}</p>
    </div>
  );
}
