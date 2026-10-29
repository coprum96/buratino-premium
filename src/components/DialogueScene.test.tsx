import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { DialogueScene } from './DialogueScene';

describe('DialogueScene calculator gate', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
    useGameStore.setState({
      currentLevel: 3,
      currentDialogue: 3,
      completedChapters: [0, 1, 2],
      accessStatus: 'promo',
      phase: 'dialogue',
    });
  });

  it('does not finish the stage after the fields become invalid', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    const skip = screen.getByRole('button', { name: 'Показать весь текст' });
    if (!skip.hasAttribute('disabled')) {
      await user.click(skip);
    }
    const choice = await screen.findByRole('button', { name: /Теперь всё ясно!/ });
    await user.click(choice);
    const next = screen.getByRole('button', { name: 'Далее' });
    await user.clear(screen.getByLabelText('Сумма, ₽'));
    expect(screen.getByText('Введи сумму числом больше нуля.')).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(useGameStore.getState().phase).toBe('dialogue');
    expect(useGameStore.getState().completedActivities).not.toContain('ch3-story');
  });
});

describe('DialogueScene board shortcut', () => {
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

  it('advances the scene before opening the board so the same choice cannot be farmed', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    const skip = screen.getByRole('button', { name: 'Показать весь текст' });
    if (!skip.hasAttribute('disabled')) {
      await user.click(skip);
    }
    await user.click(await screen.findByRole('button', { name: /Это обман, ухожу/ }));
    await user.click(screen.getByRole('button', { name: 'К доске дела' }));
    expect(useGameStore.getState().phase).toBe('caseBoard');
    expect(useGameStore.getState().currentDialogue).toBe(3);
    expect(useGameStore.getState().evidenceFound).toEqual(['karabas', 'promised-yield', 'fake-urgency']);
  });
});
