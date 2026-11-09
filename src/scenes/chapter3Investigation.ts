import type { CharacterPlacement, SceneVisualConfig } from './types';
import { comicEmotion } from './emotionMap';

/** Same proven empty environment as chapter 2 — investigation happens at the theater. */
const THEATER_BACKGROUND = {
  preview: '/assets/game/comic/previews/bg-theater-night-preview.webp',
  mobile: '/assets/game/comic/backgrounds/bg-theater-night-390.webp',
  tablet: '/assets/game/comic/backgrounds/bg-theater-night-768.webp',
  desktop: '/assets/game/comic/backgrounds/bg-theater-night-1440.webp',
  alt: '',
} as const;

const DETECTIVE = {
  thinking: '/assets/game/comic/characters/char-detective-thinking.webp',
  pressured: '/assets/game/comic/characters/char-detective-pressured.webp',
  surprised: '/assets/game/comic/characters/char-detective-surprised.webp',
} as const;

const KARABAS = {
  suspicious: '/assets/game/comic/characters/char-antagonist-suspicious.webp',
  pressured: '/assets/game/comic/characters/char-antagonist-pressured.webp',
} as const;

/**
 * Match chapter 2: two clean busts max. Cricket speaks via the dialogue bubble
 * while Buratino stays on stage as the investigator; Karabas is the leaflet ghost.
 */
export function getChapter3InvestigationConfig(
  speakerId: string,
  rawEmotion: string | undefined,
  dialogueIndex: number,
): SceneVisualConfig {
  const emotion = comicEmotion(rawEmotion);
  const karabasSpeaking = speakerId === 'karabas';
  const showLeafletGhost = dialogueIndex === 0;

  const buratinoEmotion =
    emotion === 'surprised' ? 'surprised' : emotion === 'pressured' ? 'pressured' : 'thinking';

  const buratino: CharacterPlacement = {
    characterId: 'buratino',
    emotion: buratinoEmotion,
    asset: DETECTIVE[buratinoEmotion],
    side: 'left',
    anchorX: 26,
    anchorY: 100,
    width: 42,
    mobileWidth: 46,
    zIndex: karabasSpeaking ? 3 : 5,
    active: !karabasSpeaking,
  };

  const characters: CharacterPlacement[] = [buratino];

  if (showLeafletGhost || karabasSpeaking) {
    characters.push({
      characterId: 'karabas',
      emotion: karabasSpeaking ? emotion : 'suspicious',
      asset: karabasSpeaking ? KARABAS.pressured : KARABAS.suspicious,
      side: 'right',
      anchorX: 76,
      anchorY: 100,
      width: 46,
      mobileWidth: 50,
      zIndex: karabasSpeaking ? 5 : 2,
      active: karabasSpeaking,
    });
  }

  return {
    id: 'chapter3-investigation',
    background: THEATER_BACKGROUND,
    lighting: 'night-street',
    transition: 'panel',
    castMode: 'overlay',
    dialogue: {
      speakerId,
      side: karabasSpeaking ? 'right' : 'left',
      maxWidth: 78,
    },
    characters,
  };
}
