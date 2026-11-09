import { getChapter1WorkshopConfig } from './chapter1Workshop';
import { getChapter2TheaterConfig } from './chapter2Theater';
import { getChapter3InvestigationConfig } from './chapter3Investigation';
import type { SceneVisualConfig } from './types';

export function getComicSceneConfig(
  levelId: number,
  dialogueIndex: number,
  speakerId: string,
  emotion?: string,
): SceneVisualConfig {
  if (levelId === 0) return getChapter1WorkshopConfig(speakerId, emotion, dialogueIndex);
  if (levelId === 2) return getChapter3InvestigationConfig(speakerId, emotion, dialogueIndex);
  return getChapter2TheaterConfig(speakerId, emotion);
}

export function comicLocationLabel(levelId: number, dialogueIndex: number): string {
  if (levelId === 0) {
    if (dialogueIndex >= 3) return 'Тень у двери мастерской';
    if (dialogueIndex >= 1) return 'Мастерская · сообщение';
    return 'Тёплый чердак-мастерская';
  }
  if (levelId === 2) return 'Закулисье · стол расследования';
  return 'Ночная улица у театра';
}
