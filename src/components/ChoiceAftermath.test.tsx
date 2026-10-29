import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChoiceAftermath } from './ChoiceAftermath';

const karabasChoice = {
  id: 'Выглядит профессионально, вложу!',
  text: 'Перевести одну монету, чтобы место сохранили',
  icon: '💸',
  wisdom: -20,
  coins: -1,
  consequence: 'risky' as const,
  evidence: ['promised-yield', 'fake-urgency'],
  feedback: 'Карабас быстро забирает монету и прячет бумагу. «Остальные принесёшь завтра».',
};

describe('ChoiceAftermath', () => {
  it('shows the story first, then applied resources and the five-point reading', () => {
    render(
      <ChoiceAftermath
        choice={karabasChoice}
        characterId="karabas"
        replay={false}
        applied={{
          coinsDelta: -1,
          reputationDelta: -5,
          overflowDelta: 0,
          newEvidenceIds: ['promised-yield', 'fake-urgency'],
        }}
        onContinue={() => undefined}
      />
    );

    expect(screen.getByRole('heading', { name: 'Что произошло' })).toBeInTheDocument();
    expect(screen.getAllByText(/забирает монету/).length).toBeGreaterThan(0);
    expect(screen.getByText('Потеряно: 1 монета')).toBeInTheDocument();
    expect(screen.getByText('Репутация: -5')).toBeInTheDocument();
    expect(screen.getByText(/Новая улика: Обещание 900%/)).toBeInTheDocument();
    expect(screen.getByText(/Отношения: Карабас считает/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Что это значит' })).toBeInTheDocument();
    expect(screen.getByText(/4\. Пока не доказывает/)).toBeInTheDocument();
    expect(screen.queryByText(/плохое решение/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'К доске дела' })).not.toBeInTheDocument();
  });

  it('offers a board shortcut when a new clue was just found', () => {
    render(
      <ChoiceAftermath
        choice={karabasChoice}
        characterId="karabas"
        replay={false}
        applied={{
          coinsDelta: -1,
          reputationDelta: -5,
          overflowDelta: 0,
          newEvidenceIds: ['promised-yield'],
        }}
        onContinue={() => undefined}
        onOpenBoard={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'К доске дела' })).toBeInTheDocument();
  });

  it('hides resource and clue lines when nothing was applied', () => {
    render(
      <ChoiceAftermath
        choice={karabasChoice}
        characterId="karabas"
        replay
        applied={{ coinsDelta: 0, reputationDelta: 0, overflowDelta: 0, newEvidenceIds: [] }}
        onContinue={() => undefined}
      />
    );

    expect(screen.getByText(/Повтор: репутация/)).toBeInTheDocument();
    expect(screen.queryByText('Потеряно: 1 монета')).not.toBeInTheDocument();
    expect(screen.queryByText(/Новая улика/)).not.toBeInTheDocument();
  });
});
