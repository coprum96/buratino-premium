import type { CharacterPlacement, SceneVisualConfig } from './types';
import { comicEmotion } from './emotionMap';

const WORKSHOP_BACKGROUND = {
  preview: '/assets/game/comic/previews/bg-workshop-attic-preview.webp',
  mobile: '/assets/game/comic/backgrounds/bg-workshop-attic-390.webp',
  tablet: '/assets/game/comic/backgrounds/bg-workshop-attic-768.webp',
  desktop: '/assets/game/comic/backgrounds/bg-workshop-attic-1440.webp',
  alt: '',
} as const;

const DETECTIVE = {
  thinking: '/assets/game/comic/characters/char-detective-thinking.webp',
  pressured: '/assets/game/comic/characters/char-detective-pressured.webp',
  surprised: '/assets/game/comic/characters/char-detective-surprised.webp',
} as const;

const KARABAS = {
  friendly: '/assets/game/comic/characters/char-antagonist-friendly.webp',
} as const;

/**
 * Prologue uses the painted workshop as the cast (characters already in the art).
 * Only the Karabas teaser switches to overlay busts like chapter 2.
 */
export function getChapter1WorkshopConfig(
  speakerId: string,
  rawEmotion: string | undefined,
  dialogueIndex: number,
): SceneVisualConfig {
  const emotion = comicEmotion(rawEmotion);
  const teaser = dialogueIndex >= 3;

  if (!teaser) {
    return {
      id: 'chapter1-workshop',
      background: WORKSHOP_BACKGROUND,
      lighting: 'interior',
      transition: 'panel',
      castMode: 'embedded',
      dialogue: {
        speakerId,
        side: speakerId === 'cricket' ? 'left' : 'right',
        maxWidth: 78,
      },
      characters: [],
    };
  }

  const buratino: CharacterPlacement = {
    characterId: 'buratino',
    emotion: emotion === 'surprised' ? 'surprised' : 'pressured',
    asset: emotion === 'surprised' ? DETECTIVE.surprised : DETECTIVE.pressured,
    side: 'right',
    anchorX: 78,
    anchorY: 100,
    width: 42,
    mobileWidth: 46,
    zIndex: 4,
    active: speakerId !== 'karabas',
  };

  const karabas: CharacterPlacement = {
    characterId: 'karabas',
    emotion: 'friendly',
    asset: KARABAS.friendly,
    side: 'left',
    anchorX: 24,
    anchorY: 100,
    width: 44,
    mobileWidth: 48,
    zIndex: 5,
    active: speakerId === 'karabas',
  };

  return {
    id: 'chapter1-workshop-teaser',
    background: WORKSHOP_BACKGROUND,
    lighting: 'interior',
    transition: 'panel',
    castMode: 'overlay',
    dialogue: {
      speakerId,
      side: speakerId === 'karabas' ? 'left' : 'right',
      maxWidth: 78,
    },
    characters: [buratino, karabas],
  };
}
