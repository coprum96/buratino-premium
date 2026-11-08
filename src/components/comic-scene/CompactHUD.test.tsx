import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { CompactHUD } from './CompactHUD';

describe('CompactHUD', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
    useGameStore.setState({
      coins: 5,
      wisdom: 40,
      evidenceFound: ['karabas'],
      soundMuted: false,
      phase: 'dialogue',
    });
  });

  it('keeps coins, rank, clues, case and menu on one row', () => {
    render(<CompactHUD />);
    const hud = screen.getByTestId('compact-hud');
    expect(hud.className).toContain('comic-hud');
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Наблюдатель')).toBeInTheDocument();
    expect(screen.getByText('1/14')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Дело' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Меню' })).toBeInTheDocument();
  });

  it('opens the menu from the keyboard and persists mute', async () => {
    const user = userEvent.setup();
    render(<CompactHUD />);
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('hud-menu')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(useGameStore.getState().soundMuted).toBe(true);
    expect(screen.getByRole('menuitem', { name: 'Звук выключен' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('moves to the case board from the case button', async () => {
    const user = userEvent.setup();
    render(<CompactHUD />);
    await user.click(screen.getByRole('button', { name: 'Дело' }));
    expect(useGameStore.getState().phase).toBe('caseBoard');
  });
});
