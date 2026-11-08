import { describe, expect, it } from 'vitest';
import { COMIC_CHAPTER_LEVEL_ID, VISUAL_FEATURES, isComicChapter2 } from './visualFeatures';

describe('visual features', () => {
  it('enables the comic scene only for chapter 2', () => {
    expect(VISUAL_FEATURES.comicChapter2).toBe(true);
    expect(COMIC_CHAPTER_LEVEL_ID).toBe(1);
    expect(isComicChapter2(1)).toBe(true);
    expect(isComicChapter2(0)).toBe(false);
    expect(isComicChapter2(2)).toBe(false);
  });

  it('returns the old path when the flag is off', () => {
    expect(isComicChapter2(1, { comicChapter2: false })).toBe(false);
    expect(isComicChapter2(0, { comicChapter2: false })).toBe(false);
  });
});
