import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

vi.mock('../config/visualFeatures', () => ({
  VISUAL_FEATURES: { comicChapter2: false },
  COMIC_CHAPTER_LEVEL_ID: 1,
  isComicChapter2: () => false,
}));

import { DialogueScene } from './DialogueScene';

describe('DialogueScene with comic flag off', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
    useGameStore.setState({
      currentLevel: 1,
      currentDialogue: 0,
      completedChapters: [0],
      accessStatus: 'promo',
      phase: 'dialogue',
    });
  });

  it('keeps the legacy card scene', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    expect(screen.queryByTestId('comic-scene')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Карабас Барабас' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'На карту' })).toBeInTheDocument();
    const skip = screen.getByRole('button', { name: 'Показать весь текст' });
    if (!skip.hasAttribute('disabled')) {
      await user.click(skip);
    }
    expect(await screen.findByText('На что обратить внимание')).toBeInTheDocument();
  });
});
