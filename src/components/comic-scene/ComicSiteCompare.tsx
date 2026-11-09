import { useEffect, useMemo, useState } from 'react';

const MARKS = [
  { id: 'domain', label: 'Домен', fake: 'zoloto-scena.com', real: 'zoloto-scena.ru', hint: 'Почти тот же адрес, но другая зона.' },
  { id: 'phone', label: 'Телефон', fake: '+7 900 111-22-33', real: '+7 812 555-01-01', hint: 'На подделке другой номер.' },
  { id: 'payee', label: 'Получатель', fake: 'Карта 2200 · Иван К.', real: 'ООО «Сцена», р/с в банке', hint: 'Деньги просят на физлицо.' },
  { id: 'purpose', label: 'Назначение', fake: 'Пай за ночь · +900%', real: 'Афиша и билеты', hint: 'Официальный сайт не продаёт «паи».' },
  { id: 'legal', label: 'Юрлицо', fake: '«В процессе регистрации»', real: 'ООО «Сцена» в открытых данных', hint: 'Нет проверяемого юрлица.' },
  { id: 'site', label: 'Официальный сайт', fake: 'Только ссылка из чата', real: 'Отдельный домен театра', hint: 'Чат подменяет вход на витрину.' },
] as const;

interface ComicSiteCompareProps {
  onComplete: () => void;
}

export function ComicSiteCompare({ onComplete }: ComicSiteCompareProps) {
  const [found, setFound] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const done = found.length >= 4;
  const latest = useMemo(
    () => MARKS.find((item) => item.id === focus) ?? null,
    [focus],
  );

  useEffect(() => {
    if (done && !locked) {
      setLocked(true);
      onComplete();
    }
  }, [done, locked, onComplete]);

  const mark = (id: string) => {
    setFocus(id);
    setFound((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <section className="comic-sites is-compact" data-testid="comic-site-compare" aria-label="Сравнение витрин">
      <p className="comic-sites-count" role="status">
        Несоответствия: {found.length} / 4+
      </p>
      <div className="comic-sites-grid">
        <article className="comic-phone" data-kind="fake">
          <header>Чат · «инвестор»</header>
          {MARKS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="comic-phone-row"
              data-marked={found.includes(item.id)}
              aria-pressed={found.includes(item.id)}
              onClick={() => mark(item.id)}
            >
              <span>{item.label}</span>
              <strong>{item.fake}</strong>
            </button>
          ))}
        </article>
        <article className="comic-phone" data-kind="real">
          <header>Официальный ориентир</header>
          {(latest ? [latest] : MARKS.slice(0, 1)).map((item) => (
            <div key={item.id} className="comic-phone-row is-static">
              <span>{item.label}</span>
              <strong>{item.real}</strong>
            </div>
          ))}
          {latest && (
            <p className="comic-sites-explain" role="status">
              <span className="comic-flag-mark" aria-hidden="true">✕</span>
              {latest.hint}
            </p>
          )}
        </article>
      </div>
      {!done && (
        <p className="comic-sites-missing">Отметь ещё на левом экране.</p>
      )}
    </section>
  );
}
