import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { CaseBoard } from './CaseBoard';

describe('CaseBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.persist.clearStorage();
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it('groups hidden nodes by zone without spoiling titles', () => {
    render(<CaseBoard />);
    expect(screen.getByRole('heading', { name: 'Персонажи' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Компании' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Сайты и контакты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Документы' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Платежи' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'События' })).toBeInTheDocument();
    expect(screen.getAllByText('Неизвестный узел').length).toBe(14);
    expect(screen.queryByText('Карабас Барабас')).not.toBeInTheDocument();
    expect(screen.getByText(/Появится, когда кто-то предложит вложить монеты/)).toBeInTheDocument();
    expect(screen.getByText('0 из 14 узлов')).toBeInTheDocument();
  });

  it('opens a found node with source, chapter and a confirmed link', async () => {
    useGameStore.setState({ evidenceFound: ['karabas', 'golden-stage'] });
    render(<CaseBoard />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Человек.*Карабас Барабас/ }));
    expect(screen.getByText(/Источник:/)).toBeInTheDocument();
    expect(screen.getByText(/Глава:/)).toBeInTheDocument();
    expect(screen.getByText(/Подтверждает:/)).toBeInTheDocument();
    expect(screen.getByText(/Ещё не доказывает:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /«Золотая сцена» — подтверждённая связь/ })).toBeInTheDocument();
  });

  it('marks a domain mismatch as a contradiction once both ends are open', () => {
    useGameStore.setState({ evidenceFound: ['golden-stage', 'swapped-domain'] });
    render(<CaseBoard />);
    expect(screen.getByRole('button', { name: /«Золотая сцена» — противоречие/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Недостающий элемент/).length).toBeGreaterThan(0);
  });
});
