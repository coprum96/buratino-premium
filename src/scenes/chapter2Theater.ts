import { levels } from '../data/gameData';
import { comicEmotion } from './emotionMap';
import type { CharacterPlacement, SceneVisualConfig } from './types';

export const CHAPTER2_THEATER_ID = 'chapter2-theater-night';

const THEATER_BACKGROUND = {
  preview: '/assets/game/comic/previews/bg-theater-night-preview.webp',
  mobile: '/assets/game/comic/backgrounds/bg-theater-night-390.webp',
  tablet: '/assets/game/comic/backgrounds/bg-theater-night-768.webp',
  desktop: '/assets/game/comic/backgrounds/bg-theater-night-1440.webp',
  alt: '',
} as const;

export const EXPECTED_CHARACTER_ASSETS = {
  buratino: {
    neutral: '/assets/game/comic/characters/char-detective-neutral.webp',
    surprised: '/assets/game/comic/characters/char-detective-surprised.webp',
    thinking: '/assets/game/comic/characters/char-detective-thinking.webp',
    pressured: '/assets/game/comic/characters/char-detective-pressured.webp',
  },
  karabas: {
    friendly: '/assets/game/comic/characters/char-antagonist-friendly.webp',
    suspicious: '/assets/game/comic/characters/char-antagonist-suspicious.webp',
    pressured: '/assets/game/comic/characters/char-antagonist-pressured.webp',
    angry: '/assets/game/comic/characters/char-antagonist-angry.webp',
  },
} as const;

type BuratinoEmotion = keyof typeof EXPECTED_CHARACTER_ASSETS.buratino;
type KarabasEmotion = keyof typeof EXPECTED_CHARACTER_ASSETS.karabas;

function buratinoAsset(emotion: string): string {
  const key = (emotion in EXPECTED_CHARACTER_ASSETS.buratino
    ? emotion
    : emotion === 'friendly'
      ? 'neutral'
      : emotion === 'angry'
        ? 'pressured'
        : emotion === 'suspicious'
          ? 'thinking'
          : 'neutral') as BuratinoEmotion;
  return EXPECTED_CHARACTER_ASSETS.buratino[key];
}

function karabasAsset(emotion: string): string {
  const key = (emotion in EXPECTED_CHARACTER_ASSETS.karabas
    ? emotion
    : emotion === 'neutral' || emotion === 'surprised' || emotion === 'thinking'
      ? 'friendly'
      : 'suspicious') as KarabasEmotion;
  return EXPECTED_CHARACTER_ASSETS.karabas[key];
}

export function chapter2OfferText(): string {
  return levels[1].dialogues[0].text;
}

export function chapter2Presentation() {
  return levels[1].dialogues[1].presentation ?? [];
}

export function getChapter2TheaterConfig(
  speakerId: string,
  rawEmotion?: string,
): SceneVisualConfig {
  const emotion = comicEmotion(rawEmotion);
  const karabasSpeaking = speakerId === 'karabas';
  const buratinoSpeaking = speakerId === 'buratino';

  const buratinoEmotion = karabasSpeaking ? 'pressured' : buratinoSpeaking ? emotion : 'thinking';
  const karabasEmotion = karabasSpeaking ? emotion : 'suspicious';
  const buratinoActive = !karabasSpeaking;

  const buratino: CharacterPlacement = {
    characterId: 'buratino',
    emotion: buratinoEmotion,
    asset: buratinoAsset(buratinoEmotion),
    side: 'left',
    anchorX: 26,
    anchorY: 100,
    width: 42,
    mobileWidth: 46,
    zIndex: buratinoActive ? 5 : 3,
    active: buratinoActive,
  };

  const karabas: CharacterPlacement = {
    characterId: 'karabas',
    emotion: karabasEmotion,
    asset: karabasAsset(karabasEmotion),
    side: 'right',
    anchorX: 76,
    anchorY: 100,
    width: 46,
    mobileWidth: 50,
    zIndex: karabasSpeaking ? 5 : 4,
    active: karabasSpeaking,
  };

  return {
    id: CHAPTER2_THEATER_ID,
    background: THEATER_BACKGROUND,
    lighting: 'night-street',
    transition: 'panel',
    dialogue: {
      speakerId,
      side: karabasSpeaking ? 'right' : 'left',
      maxWidth: 76,
    },
    evidence: [
      { id: 'phone', kind: 'phone', anchorX: 18, anchorY: 58 },
      { id: 'leaflet', kind: 'leaflet', anchorX: 50, anchorY: 64 },
    ],
    characters: [buratino, karabas],
  };
}
