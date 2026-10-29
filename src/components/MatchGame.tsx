import { useMemo, useState } from 'react';

interface MatchPair {
  id: number;
  legitimate: string;
  scam: string;
  explanation: string;
  mismatch: string;
  redFlags: string[];
}

const defaultPairs: MatchPair[] = [
  {
    id: 1,
    legitimate: 'Вклад банка из реестра: ставка указана на дату договора, вклад в системе страхования АСВ.',
    scam: '«Инвестиции»: гарантированно 50% в месяц, риска нет, договор пришлют потом.',
    explanation: 'Гарантия огромной доходности без риска не бывает у обычного рыночного продукта.',
    mismatch: 'Это разные предложения: одно называет ставку и страховку, другое обещает невозможную гарантию.',
    redFlags: ['Нереалистичная доходность', 'Слово «гарантированно»', 'Нет проверяемого договора'],
  },
  {
    id: 2,
    legitimate: 'Покупка акций через брокера: доход не обещают, просадка возможна, комиссия раскрыта.',
    scam: '«Уникальная возможность»: 10 тысяч превратятся в 100 тысяч за неделю.',
    explanation: 'Кратное обогащение за неделю без механизма — учебный признак схемы, не «удачной сделки».',
    mismatch: 'Рыночный риск и обещание x10 за неделю — не пара. Сопоставь похожие по сюжету, но разные по честности офферы.',
    redFlags: ['Обещание быстрых денег', 'Нет механизма дохода', 'Давление уникальностью'],
  },
  {
    id: 3,
    legitimate: 'Фонд раскрывает комиссию около 1–2% в год. Доход зависит от рынка и не обещан.',
    scam: '«Фонд»: взнос 50 тысяч, вывод через год, комиссия 15% каждый месяц.',
    explanation: '15% в месяц съедает капитал даже без падения рынка. Lock-up сам по себе не доказывает обман, но вместе с такой комиссией условие становится кабальным.',
    mismatch: 'Комиссия 1–2% в год и 15% в месяц — разные режимы. Найди мошенническую копию именно этого типа продукта.',
    redFlags: ['Огромная комиссия', 'Вывод только через год', 'Доход не объясняется'],
  },
  {
    id: 4,
    legitimate: 'Компания с лицензией на конкретную деятельность, договор с понятными реквизитами и правом задать вопросы.',
    scam: 'Компания «есть в реестре», но деньги просят на карту частного лица, лицензию «оформляют».',
    explanation: 'Регистрация или печать не доказывают добросовестность. Важны совпадение реквизитов и суть деятельности.',
    mismatch: 'Оба могут быть «зарегистрированы». Ищи, куда уходят деньги и что именно разрешено лицензией.',
    redFlags: ['Платёж частному лицу', 'Лицензия «в процессе»', 'Реквизиты не сходятся'],
  },
];

interface MatchGameProps {
  pairs?: MatchPair[];
  onComplete?: (score: number) => void;
}

export function MatchGame({ pairs = defaultPairs, onComplete }: MatchGameProps) {
  const [selectedLegit, setSelectedLegit] = useState<number | null>(null);
  const [selectedScam, setSelectedScam] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const scamOrder = useMemo(() => [...pairs].sort((a, b) => b.id - a.id), [pairs]);

  const checkMatch = (legitId: number, scamId: number) => {
    setAttempts((value) => value + 1);
    if (legitId === scamId) {
      const pair = pairs.find((item) => item.id === legitId);
      setMatched((current) => new Set([...current, legitId]));
      setScore((value) => value + 1);
      setFeedback(pair?.explanation || 'Верная пара.');
      setSelectedLegit(null);
      setSelectedScam(null);
      if (matched.size + 1 === pairs.length) {
        setCompleted(true);
        onComplete?.(score + 1);
      }
      return;
    }
    const pair = pairs.find((item) => item.id === legitId);
    setFeedback(pair?.mismatch || 'Эта пара не сходится. Сравни механизм и условия, не только тон рекламы.');
    setSelectedLegit(null);
    setSelectedScam(null);
  };

  const handleLegitClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedLegit(id);
    if (selectedScam !== null) checkMatch(id, selectedScam);
  };

  const handleScamClick = (id: number) => {
    if (matched.has(id)) return;
    setSelectedScam(id);
    if (selectedLegit !== null) checkMatch(selectedLegit, id);
  };

  return (
    <section className="surface-card">
      <h3 className="text-2xl font-bold mb-2">Сравни предложения</h3>
      <p className="mb-4 text-white/80">
        Попытка считается только когда выбрана пара. Есть и добросовестные продукты с риском — не отмечай мошенничеством всё сложное.
      </p>
      <p className="mb-4">Верных пар: {score} / {pairs.length}. Попыток: {attempts}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div>
          <h4 className="font-bold mb-3">Более прозрачное</h4>
          <div className="space-y-3">
            {pairs.map((pair) => (
              <button
                key={`legit-${pair.id}`}
                type="button"
                onClick={() => handleLegitClick(pair.id)}
                disabled={matched.has(pair.id)}
                className="choice-card"
                data-state={matched.has(pair.id) ? 'correct' : selectedLegit === pair.id ? 'selected' : 'default'}
              >
                {pair.legitimate}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3">Сомнительное</h4>
          <div className="space-y-3">
            {scamOrder.map((pair) => (
              <button
                key={`scam-${pair.id}`}
                type="button"
                onClick={() => handleScamClick(pair.id)}
                disabled={matched.has(pair.id)}
                className="choice-card"
                data-state={matched.has(pair.id) ? 'correct' : selectedScam === pair.id ? 'selected' : 'default'}
              >
                {pair.scam}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-primary/20 rounded-xl p-4" role="status">
          {feedback}
        </div>
      )}

      {completed && (
        <p className="mt-4 font-semibold">Все пары разобраны за {attempts} попыток.</p>
      )}
    </section>
  );
}
