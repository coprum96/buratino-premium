import { useMemo, useState } from 'react';

const MARKS = [
  { id: 'domain', label: 'Домен', hint: 'zoloto-scena.com выглядит почти как официальный адрес, но это не он.' },
  { id: 'phone', label: 'Телефон', hint: 'На поддельной витрине другой номер, тот же, что потом всплывёт у Лисы.' },
  { id: 'payee', label: 'Получатель', hint: 'Деньги просят на карту физлица, не на счёт организации.' },
] as const;

interface SiteCompareTaskProps {
  onComplete: () => void;
}

export function SiteCompareTask({ onComplete }: SiteCompareTaskProps) {
  const [found, setFound] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const done = found.length === MARKS.length;
  const missing = useMemo(() => MARKS.filter((item) => !found.includes(item.id)), [found]);

  const mark = (id: string) => {
    setFound((current) => (current.includes(id) ? current : [...current, id]));
  };

  const finish = () => {
    if (locked) return;
    setLocked(true);
    onComplete();
  };

  return (
    <section className="surface-card mb-5">
      <h3 className="text-2xl font-bold mb-2">Сравни две витрины</h3>
      <p className="mb-4 text-white/80">
        Слева — страница, которую прислал «инвестор». Справа — официальный вид, как его описывает Дядя.
        Найди три отличия. Это не лекция: нажимай на подозрительные места.
      </p>
      <p className="text-sm mb-4" role="status">Найдено отличий: {found.length} из {MARKS.length}</p>

      <div className="grid md:grid-cols-2 gap-4">
        <article className="rounded-2xl bg-black/30 border border-red-300/30 p-4">
          <p className="text-xs uppercase tracking-wide text-red-200 mb-2">Прислали в чат</p>
          <button type="button" className="choice-card mb-2" onClick={() => mark('domain')}>
            zoloto-scena.com
          </button>
          <p className="text-lg font-bold mb-2">Золотая сцена · пай за ночь</p>
          <button type="button" className="choice-card mb-2" onClick={() => mark('payee')}>
            Перевод: карта 2200 · Иван К.
          </button>
          <button type="button" className="choice-card" onClick={() => mark('phone')}>
            Тел. +7 900 111-22-33
          </button>
        </article>
        <article className="rounded-2xl bg-black/30 border border-emerald-300/30 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-200 mb-2">Официальный ориентир</p>
          <p className="choice-card mb-2 pointer-events-none">zoloto-scena.ru</p>
          <p className="text-lg font-bold mb-2">Афиша и билеты, не «паи»</p>
          <p className="choice-card mb-2 pointer-events-none">ООО «Сцена», р/с в банке</p>
          <p className="choice-card pointer-events-none">Тел. +7 812 555-01-01</p>
        </article>
      </div>

      {found.length > 0 && (
        <ul className="mt-4 space-y-2">
          {MARKS.filter((item) => found.includes(item.id)).map((item) => (
            <li key={item.id}><strong>{item.label}:</strong> {item.hint}</li>
          ))}
        </ul>
      )}

      {done ? (
        <button type="button" className="btn btn-primary mt-5" onClick={finish} disabled={locked}>
          {locked ? 'Улика на доске' : 'Закрепить улику на доске'}
        </button>
      ) : (
        <p className="text-sm mt-4 text-white/70">Ещё не отмечено: {missing.map((item) => item.label.toLowerCase()).join(', ')}.</p>
      )}
    </section>
  );
}
