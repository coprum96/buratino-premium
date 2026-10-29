import { describe, expect, it } from 'vitest';
import { CHARACTER_VOICES } from './characterVoices';
import { characters, educationalMaterials, levels } from './gameData';

function collectStoryText(): string[] {
  const chunks: string[] = [];
  for (const level of levels) {
    for (const dialogue of level.dialogues) {
      chunks.push(dialogue.text);
      for (const variant of Object.values(dialogue.variants ?? {})) {
        chunks.push(variant.text);
      }
      for (const choice of dialogue.choices) {
        chunks.push(choice.text, choice.detail ?? '', choice.feedback ?? '');
      }
      for (const flag of dialogue.redFlagsData ?? []) {
        chunks.push(flag.title, flag.description, flag.example ?? '', flag.law ?? '', flag.statistics ?? '', ...(flag.tips ?? []));
      }
    }
    for (const question of level.quiz) {
      chunks.push(question.text, question.explanation ?? '', ...question.options);
    }
  }
  for (const material of educationalMaterials) {
    for (const section of material.sections) {
      chunks.push(section.name, section.content);
    }
  }
  return chunks.filter(Boolean);
}

describe('dialogue content', () => {
  it('covers every speaking character with a voice guide', () => {
    const ids = new Set(CHARACTER_VOICES.map((voice) => voice.id));
    expect(ids.has('buratino')).toBe(true);
    expect(ids.has('cricket')).toBe(true);
    expect(ids.has('cat_basilio')).toBe(true);
    expect(ids.has('lawyer')).toBe(true);
    Object.keys(characters).forEach((id) => {
      expect(ids.has(id)).toBe(true);
    });
    expect(characters.lawyer.name).toBe('Юрист');
  });

  it('keeps the original teaching dialogues and red-flag cards', () => {
    const text = collectStoryText().join('\n');
    expect(text).toContain('Научимся их защищать?');
    expect(text).toContain('Давай применим "Золотой Детектор"');
    expect(text).toContain('КОРЗИНА 1 - "БЕЗОПАСНОСТЬ"');
    expect(text).toContain('ТЕХНИКА "МИКРОСКОП"');
    expect(text).toContain('Да! Я готов учиться!');
    expect(levels[0].dialogues[0].redFlagsData?.[0].statistics).toMatch(/НАФИ/);
    expect(levels[0].dialogues[0].redFlagsData?.[0].tips?.length).toBeGreaterThan(0);
  });
});
