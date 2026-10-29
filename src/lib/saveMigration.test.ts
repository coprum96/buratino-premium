import { describe, expect, it } from 'vitest';
import {
  evidenceFromStoryChoices,
  guaranteedEvidenceForChapters,
  restoreStoryEvidence,
} from './saveMigration';

describe('save evidence restoration', () => {
  it('restores only unavoidable clues for completed chapters', () => {
    const granted = guaranteedEvidenceForChapters([0, 1, 2, 3]);
    expect(granted).toEqual(expect.arrayContaining([
      'karabas',
      'promised-yield',
      'fake-urgency',
      'swapped-domain',
      'hidden-fee',
      'contract',
    ]));
    expect(granted).not.toContain('golden-stage');
    expect(granted).not.toContain('personal-card');
    expect(granted).not.toContain('lockup-clause');
    expect(granted).not.toContain('victim-note');
  });

  it('reconstructs choice evidence without inventing optional tools', () => {
    const fromChoices = evidenceFromStoryChoices([
      {
        chapterId: 1,
        dialogueIndex: 0,
        choiceId: 'Это обман, ухожу',
        choiceText: 'Это обман, ухожу',
        wisdomChange: 40,
        coinChange: 0,
        selectedIndependentCheck: false,
      },
    ]);
    expect(fromChoices).toEqual(expect.arrayContaining(['karabas', 'promised-yield', 'fake-urgency']));
    expect(fromChoices).not.toContain('golden-stage');
  });

  it('does not duplicate already collected clues', () => {
    const restored = restoreStoryEvidence(['karabas'], [1], []);
    expect(restored.filter((id) => id === 'karabas')).toHaveLength(1);
  });
});
