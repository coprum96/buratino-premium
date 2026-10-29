import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LossCalculator } from './LossCalculator';

describe('LossCalculator', () => {
  it('reports invalid negative input and valid numbers', async () => {
    const user = userEvent.setup();
    const onValidityChange = vi.fn();
    render(<LossCalculator onValidityChange={onValidityChange} />);

    expect(onValidityChange).toHaveBeenCalledWith(true);

    await user.clear(screen.getByLabelText('Сумма, ₽'));
    await user.type(screen.getByLabelText('Сумма, ₽'), '-100');
    await user.clear(screen.getByLabelText('Срок, месяцы'));
    await user.type(screen.getByLabelText('Срок, месяцы'), '-2');

    expect(screen.getByText('Сумма должна быть больше нуля.')).toBeInTheDocument();
    expect(screen.getByText('Срок — от 1 до 60 месяцев.')).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByLabelText('Сумма, ₽')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Сумма, ₽')).toHaveAttribute('aria-describedby', expect.stringContaining('calc-amount-error'));
  });

  it('rejects empty, pasted and non-numeric values', async () => {
    const user = userEvent.setup();
    const onValidityChange = vi.fn();
    render(<LossCalculator onValidityChange={onValidityChange} />);

    const amount = screen.getByLabelText('Сумма, ₽');
    const months = screen.getByLabelText('Срок, месяцы');

    await user.clear(amount);
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
    expect(amount).toHaveAttribute('aria-invalid', 'true');

    await user.click(amount);
    await user.paste('abc');
    expect(screen.getByText('Введи сумму числом больше нуля.')).toBeInTheDocument();

    await user.clear(amount);
    await user.paste('-1000');
    await user.clear(months);
    await user.paste('1.5');
    expect(screen.getByText('Сумма должна быть больше нуля.')).toBeInTheDocument();
    expect(screen.getByText('Срок должен быть целым числом.')).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });
});
