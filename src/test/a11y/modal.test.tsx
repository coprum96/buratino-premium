import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Modal } from '../../components/ui/Modal';

describe('Modal accessibility', () => {
  it('exposes a dialog name and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="Справочник" onClose={onClose}>
        <p>Короткая тема</p>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: 'Справочник' })).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
