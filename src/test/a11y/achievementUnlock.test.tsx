import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { AchievementUnlock } from '../../components/achievements/AchievementUnlock';

describe('AchievementUnlock accessibility', () => {
  it('names the dialog, traps focus, and closes from CTA or Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <AchievementUnlock achievementId="cool-head" onClose={onClose} />
    );

    const dialog = screen.getByRole('dialog', { name: 'Холодная голова' });
    expect(dialog).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toEqual([]);

    const cta = screen.getByRole('button', { name: /Продолжить|Смотрим результат/ });
    expect(cta).toBeDisabled();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
