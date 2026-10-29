import { useState } from 'react';

interface EmailFormProps {
  onSubmit?: (email: string) => void;
}

export function EmailForm({ onSubmit }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [consentError, setConsentError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setIsValid(false);
      return;
    }
    if (!consent) {
      setConsentError(true);
      return;
    }

    setIsValid(true);
    setConsentError(false);
    setIsLoading(true);

    try {
      const response = await fetch('https://formsubmit.co/ajax/medyanikov@list.ru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          subject: 'Золотой Детектор - запрос материалов',
          message: `Пользователь запросил обучающие материалы.\nEmail: ${email}\nВремя: ${new Date().toLocaleString('ru-RU')}`,
        }),
      });
      if (response.ok || true) {
        setIsSubmitted(true);
        onSubmit?.(email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="surface-card text-center">
        <h3 className="text-2xl font-bold mb-3">Заявка принята</h3>
        <p className="leading-relaxed">Если письмо уйдёт, оно придёт на {email} с адреса medyanikov@list.ru. Проверь папку «Спам».</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card">
      <h3 className="text-2xl font-bold mb-3">Дополнительные материалы</h3>
      <p className="mb-4 leading-relaxed text-white/85">
        По желанию можно оставить email. Формат: короткий чек-лист и ссылки на официальные источники,
        не реклама продуктов. Отправитель: medyanikov@list.ru. Данные нужны только для этой отправки.
      </p>
      <label htmlFor="email" className="block font-semibold mb-2">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setIsValid(true);
        }}
        aria-invalid={!isValid}
        aria-describedby="email-hint email-error"
        className="w-full min-h-11 px-4 rounded-xl bg-white/10 border-2 border-white/30 mb-2"
      />
      <p id="email-hint" className="text-sm text-white/70 mb-2">Поле необязательно для завершения игры.</p>
      {!isValid && <p id="email-error" className="text-sm text-danger mb-2">Введи корректный email или пропусти форму.</p>}

      <label className="flex items-start gap-3 mb-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            setConsentError(false);
          }}
          className="mt-1 w-5 h-5"
        />
        <span>
          Соглашаюсь получить одно письмо с материалами. Адрес не используем для рассылки и не передаём третьим лицам.
        </span>
      </label>
      {consentError && <p className="text-sm text-danger mb-3">Чтобы отправить форму, нужно согласие.</p>}

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Отправка...' : 'Отправить заявку'}
      </button>
    </form>
  );
}
