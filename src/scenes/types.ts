export type ResponsiveAsset = {
  preview: string;
  mobile: string;
  tablet: string;
  desktop: string;
  alt: string;
};

export type CharacterPlacement = {
  characterId: string;
  emotion: string;
  asset?: string;
  side: 'left' | 'right';
  anchorX: number;
  anchorY: number;
  width: number;
  mobileWidth?: number;
  zIndex: number;
  active?: boolean;
};

export type DialoguePlacement = {
  speakerId: string;
  side: 'left' | 'right';
  maxWidth: number;
};

export type EvidencePlacement = {
  id: string;
  kind: 'phone' | 'leaflet';
  anchorX: number;
  anchorY: number;
};

export type SceneTransition = 'panel' | 'fade';

export type LightingPreset = 'night-street' | 'interior';

export type SceneCastMode = 'overlay' | 'embedded';

export type SceneVisualConfig = {
  id: string;
  background: ResponsiveAsset;
  foreground?: ResponsiveAsset;
  characters: CharacterPlacement[];
  dialogue: DialoguePlacement;
  evidence?: EvidencePlacement[];
  lighting?: LightingPreset;
  transition?: SceneTransition;
  /** Characters already painted into the background — do not overlay busts. */
  castMode?: SceneCastMode;
};
