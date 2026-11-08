import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useGameStore } from '../../store/gameStore';
import { DialogueScene } from '../DialogueScene';

vi.mock('../../hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

function openChapter2(extra: Record<string, unknown> = {}) {
  useGameStore.setState({
    currentLevel: 1,
    currentDialogue: 0,
    completedChapters: [0],
    accessStatus: 'promo',
    phase: 'dialogue',
    coins: 5,
    wisdom: 20,
    evidenceFound: [],
    isReplayingChapter: false,
    ...extra,
  });
}

describe('chapter 2 comic slice', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    openChapter2();
  });

  it('loads the comic scene only for chapter 2 with Buratino and Karabas portraits', () => {
    render(<DialogueScene />);
    expect(screen.getByTestId('comic-scene')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Карабас и инвестиционное предложение' })).toBeInTheDocument();
    const portraits = screen.getAllByTestId('character-portrait');
    expect(portraits).toHaveLength(2);
    expect(portraits[0].querySelector('img')?.getAttribute('src')).toContain('char-detective');
    expect(portraits[1].querySelector('img')?.getAttribute('src')).toContain('char-antagonist');
    expect(within(portraits[0]).getByText('Буратино')).toBeInTheDocument();
    expect(within(portraits[1]).getByText('Карабас Барабас')).toBeInTheDocument();
    expect(screen.queryByText('🤡')).not.toBeInTheDocument();
  });

  it('keeps the full replica available from the preview', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    expect(screen.queryByText(/эксклюзивное предложение/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать весь текст' }));
    expect(screen.getByText(/эксклюзивное предложение/)).toBeInTheDocument();
  });

  it('lets keyboard choose an action and blocks a second click', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    const leave = screen.getByRole('button', { name: /Это обман, ухожу/ });
    leave.focus();
    expect(leave).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.click(leave).catch(() => undefined);
    expect(useGameStore.getState().evidenceFound).toEqual(['karabas', 'promised-yield', 'fake-urgency']);
    expect(screen.getByRole('heading', { name: 'Что произошло' })).toBeInTheDocument();
  });

  it('awards evidence once and does not duplicate it on replay', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Это обман, ухожу/ }));
    expect(useGameStore.getState().evidenceFound).toEqual(['karabas', 'promised-yield', 'fake-urgency']);
    unmount();

    openChapter2({
      evidenceFound: ['karabas', 'promised-yield', 'fake-urgency'],
      isReplayingChapter: true,
      coins: 5,
    });
    render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Это обман, ухожу/ }));
    expect(useGameStore.getState().evidenceFound).toEqual(['karabas', 'promised-yield', 'fake-urgency']);
    expect(useGameStore.getState().coins).toBe(5);
  });

  it('changes coins only when the choice includes a coin delta', async () => {
    const user = userEvent.setup();
    openChapter2({ currentDialogue: 1 });
    render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Могу я задать вопросы/ }));
    expect(useGameStore.getState().coins).toBe(5);
    expect(screen.queryByTestId('coin-transfer')).not.toBeInTheDocument();
  });

  it('animates a lost coin after the store has already changed', async () => {
    const user = userEvent.setup();
    openChapter2({ currentDialogue: 1 });
    render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Выглядит профессионально, вложу/ }));
    expect(useGameStore.getState().coins).toBe(4);
    expect(screen.getByTestId('coin-transfer')).toBeInTheDocument();
  });

  it('uses fade instead of travel when reduced motion is on', async () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);
    const user = userEvent.setup();
    render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Это обман, ухожу/ }));
    const card = screen.getByTestId('evidence-reveal');
    expect(card.className).toContain('comic-evidence-fade');
    expect(card.className).not.toContain('comic-evidence-fly');
  });

  it('opens the phone and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    const phone = screen.getByRole('button', { name: /Телефон/ });
    await user.click(phone);
    const dialog = screen.getByRole('dialog', { name: 'Сообщение Карабаса' });
    expect(within(dialog).getByText(/эксклюзивное предложение/)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Сообщение Карабаса' })).not.toBeInTheDocument();
    expect(phone).toHaveFocus();
  });

  it('shows the chapter 2 leaflet, not the chapter 7 contract', async () => {
    const user = userEvent.setup();
    render(<DialogueScene />);
    await user.click(screen.getByRole('button', { name: /Листовка/ }));
    expect(screen.getByRole('dialog', { name: /Листовка/ })).toBeInTheDocument();
    expect(screen.getByText(/5 монет сейчас = 50 монет через месяц/)).toBeInTheDocument();
    expect(screen.queryByText(/ИНВЕСТИЦИОННЫЙ ДОГОВОР № 12345/)).not.toBeInTheDocument();
  });

  it('falls back if the background image errors', () => {
    render(<DialogueScene />);
    const image = screen.getByTestId('scene-background').querySelector('img:not(.comic-bg-preview)');
    expect(image).toBeTruthy();
    fireEvent.error(image as HTMLImageElement);
    expect(screen.getByTestId('background-fallback')).toBeInTheDocument();
  });
});
