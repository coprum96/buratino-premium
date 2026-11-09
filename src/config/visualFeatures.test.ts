import { describe, expect, it } from 'vitest';
import {
  COMIC_CHAPTER_LEVEL_ID,
  VISUAL_FEATURES,
  isComicChapter,
  isComicChapter2,
} from './visualFeatures';

describe('visual features', () => {
  it('enables comic scenes for chapters 1–3', () => {
    expect(VISUAL_FEATURES.comicChapter1).toBe(true);
    expect(VISUAL_FEATURES.comicChapter2).toBe(true);
    expect(VISUAL_FEATURES.comicChapter3).toBe(true);
    expect(COMIC_CHAPTER_LEVEL_ID).toBe(1);
    expect(isComicChapter(0)).toBe(true);
    expect(isComicChapter(1)).toBe(true);
    expect(isComicChapter(2)).toBe(true);
    expect(isComicChapter(3)).toBe(false);
    expect(isComicChapter2(1)).toBe(true);
    expect(isComicChapter2(0)).toBe(false);
  });

  it('returns the old path when flags are off', () => {
    expect(isComicChapter2(1, { comicChapter2: false })).toBe(false);
    expect(isComicChapter(0, { comicChapter1: false })).toBe(false);
    expect(isComicChapter(2, { comicChapter3: false })).toBe(false);
  });
});
