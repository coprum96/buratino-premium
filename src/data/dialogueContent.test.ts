import { describe, expect, it } from 'vitest';
import { CHARACTER_VOICES } from './characterVoices';
import { characters, educationalMaterials, levels } from './gameData';

const FORBIDDEN_LINES = [
  /тело знает, что тебя обманывают/i,
  /вспомни ощущение правды/i,
  /вспомни ощущение обмана/i,
  /настрой детектор/i,
  /используй ощущения как компас/i,
  /да, это мошенничество/i,
  /понял! буду осторожен/i,
  /понял! буду внимательнее/i,
  /понял математику! это обман/i,
  /вижу все флажки/i,
  /вижу все флажка/i,
  /вложу все монеты/i,
  /вложу всё/i,
  /нужно показать пользователю/i,
  /корректная формулировка для пользователя/i,
  /не давайте системе и пользователю/i,
  /91% людей/i,
  /такого не существует/i,
];

const FORBIDDEN_ABSOLUTES = [
  /99\.9% предложений/i,
  /обман 100%/i,
  /выдумка 100%/i,
  /защита 95%/i,
  /безопасные инвестиции дают 5–10%/i,
  /безопасных вложений[\s\S]*5-10% в год/i,
];

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
  });

  it('keeps spoken lines short enough for a phone screen', () => {
    for (const level of levels) {
      for (const dialogue of level.dialogues) {
        const lines = dialogue.text.split('\n').filter((line) => line.trim());
        expect(lines.length, `${level.title}: ${dialogue.text.slice(0, 40)}`).toBeLessThanOrEqual(5);
        expect(dialogue.text.length, `${level.title} too long`).toBeLessThan(420);
      }
    }
  });

  it('rejects textbook verdicts, body-detector language and absolute yields', () => {
    const text = collectStoryText().join('\n');
    for (const pattern of [...FORBIDDEN_LINES, ...FORBIDDEN_ABSOLUTES]) {
      expect(text, String(pattern)).not.toMatch(pattern);
    }
  });

  it('makes choices look like actions with a possible motive', () => {
    const obvious = /это обман!?$|буду осторожен!?$|понял математику/i;
    for (const level of levels) {
      for (const dialogue of level.dialogues) {
        for (const choice of dialogue.choices) {
          expect(choice.text, choice.text).not.toMatch(obvious);
          if (dialogue.choices.length > 1) {
            expect(choice.detail, choice.text).toBeTruthy();
          }
        }
      }
    }
  });
});
