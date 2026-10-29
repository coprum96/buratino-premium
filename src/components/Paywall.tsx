import { useState } from 'react';
import { FaGift, FaLock, FaTimesCircle } from 'react-icons/fa';
import { useGameStore } from '../store/gameStore';
import type { AccessStatus } from '../utils/accessControl';

interface PaywallProps {
  onClose?: () => void;
  onAccessGranted: (status: AccessStatus) => void;
}

export function Paywall({ onClose, onAccessGranted }: PaywallProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setPromoError('Введи промокод');
      return;
    }

    setIsActivating(true);
    setPromoError('');
    const result = useGameStore.getState().activatePromoCode(promoCode);
    setIsActivating(false);

    if (result.success) {
      setPromoSuccess(true);
    } else {
      setPromoError(result.error || 'Неверный промокод');
    }
  };

  if (promoSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="surface-card max-w-xl text-center">
          <h1 className="text-3xl font-bold mb-4">Полный доступ активирован</h1>
          <p className="mb-6">
            Полный контент доступен. Главы открываются последовательно, а не все сразу.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => onAccessGranted('promo')}>
            Вернуться к карте
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="surface-card max-w-2xl w-full">
        <div className="text-center mb-6">
          <FaLock className="text-4xl mx-auto mb-3 text-secondary" aria-hidden="true" />
          <h1 className="text-3xl font-bold mb-3">Дальше нужен полный доступ</h1>
          <p className="text-white/80">
            Следующие главы, проверка контрагента, договор и финал доступны с промокодом исследования.
            Онлайн-оплата в этой версии не подключена.
          </p>
        </div>

        <form onSubmit={handlePromoSubmit} className="space-y-4">
          <div>
            <label htmlFor="promo" className="block font-semibold mb-2">
              <FaGift className="inline mr-2" aria-hidden="true" />
              Промокод
            </label>
            <input
              id="promo"
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError('');
              }}
              aria-invalid={Boolean(promoError)}
              aria-describedby="promo-hint promo-error"
              className="w-full min-h-11 px-4 rounded-xl bg-white/10 border-2 border-white/30"
              autoComplete="off"
            />
            <p id="promo-hint" className="text-sm mt-1 text-white/70">Промокод даёт доступ к контенту, главы всё равно идут по порядку.</p>
            {promoError && (
              <p id="promo-error" className="text-sm text-danger mt-1 flex items-center gap-2">
                <FaTimesCircle aria-hidden="true" />
                {promoError}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isActivating}>
            {isActivating ? 'Проверка...' : 'Активировать промокод'}
          </button>
        </form>

        {onClose && (
          <button type="button" className="btn w-full mt-4" onClick={onClose}>
            Вернуться к карте
          </button>
        )}
      </div>
    </main>
  );
}
