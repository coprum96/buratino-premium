export const VISUAL_FEATURES = {
  comicChapter2: true,
  comicChapter1: true,
  comicChapter3: true,
} as const;

export type VisualFeatures = {
  comicChapter2: boolean;
  comicChapter1: boolean;
  comicChapter3: boolean;
};

/** UI chapter N uses `levels[N - 1]`. */
export const COMIC_CHAPTER_LEVEL_ID = 1;
export const COMIC_CHAPTER1_LEVEL_ID = 0;
export const COMIC_CHAPTER3_LEVEL_ID = 2;

const COMIC_LEVELS = new Set([
  COMIC_CHAPTER1_LEVEL_ID,
  COMIC_CHAPTER_LEVEL_ID,
  COMIC_CHAPTER3_LEVEL_ID,
]);

export function isComicChapter2(
  levelId: number,
  features: Partial<VisualFeatures> = {},
): boolean {
  const flags = { ...VISUAL_FEATURES, ...features };
  return flags.comicChapter2 && levelId === COMIC_CHAPTER_LEVEL_ID;
}

export function isComicChapter(
  levelId: number,
  features: Partial<VisualFeatures> = {},
): boolean {
  const flags = { ...VISUAL_FEATURES, ...features };
  if (!COMIC_LEVELS.has(levelId)) return false;
  if (levelId === COMIC_CHAPTER1_LEVEL_ID) return flags.comicChapter1;
  if (levelId === COMIC_CHAPTER_LEVEL_ID) return flags.comicChapter2;
  if (levelId === COMIC_CHAPTER3_LEVEL_ID) return flags.comicChapter3;
  return false;
}
