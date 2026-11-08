export const VISUAL_FEATURES = {
  comicChapter2: true,
} as const;

export type VisualFeatures = {
  comicChapter2: boolean;
};

/** Chapter 2 in UI is `levels[1]`. */
export const COMIC_CHAPTER_LEVEL_ID = 1;

export function isComicChapter2(
  levelId: number,
  features: VisualFeatures = VISUAL_FEATURES,
): boolean {
  return features.comicChapter2 && levelId === COMIC_CHAPTER_LEVEL_ID;
}
