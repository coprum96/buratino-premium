import { useMemo, useState } from 'react';
import { EVIDENCE_CATALOG, EVIDENCE_ZONES, type EvidenceDefinition } from '../data/evidence';
import { caseStrength, evidenceByZone, foundEvidence, lastFoundId, neighborsOf, type VisibleLinkKind } from '../lib/evidence';
import { useGameStore } from '../store/gameStore';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const KIND_LABEL: Record<EvidenceDefinition['kind'], string> = {
  person: 'Человек',
  company: 'Контора',
  document: 'Документ',
  clue: 'Улика',
};

const RELIABILITY_LABEL: Record<EvidenceDefinition['reliability'], string> = {
  strong: 'высокая',
  medium: 'средняя',
  weak: 'слабая',
};

const LINK_LABEL: Record<VisibleLinkKind, string> = {
  confirmed: 'подтверждённая связь',
  hypothesis: 'рабочая гипотеза',
  contradiction: 'противоречие',
  unknown: 'неизвестная связь',
};

const LINK_CLASS: Record<VisibleLinkKind, string> = {
  confirmed: 'border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.85)]',
  hypothesis: 'border-dashed border-amber-300/80',
  contradiction: 'border-dashed border-red-400',
  unknown: 'border-white/25',
};

const STROKE: Record<VisibleLinkKind, { color: string; dash?: string }> = {
  confirmed: { color: '#fbbf24' },
  hypothesis: { color: '#fbbf24', dash: '6 4' },
  contradiction: { color: '#f87171', dash: '2 2' },
  unknown: { color: '#9ca3af', dash: '2 4' },
};

export function CaseBoard() {
  const { evidenceFound, setPhase, storyFlags } = useGameStore();
  const reduced = usePrefersReducedMotion();
  const found = useMemo(() => foundEvidence(evidenceFound), [evidenceFound]);
  const newest = lastFoundId(evidenceFound);
  const [selected, setSelected] = useState<EvidenceDefinition | null>(
    found.find((item) => item.id === newest) ?? found[0] ?? null
  );
  const strength = caseStrength(evidenceFound);
  const related = selected ? neighborsOf(selected.id, evidenceFound) : [];
  const relatedKind = new Map(related.map((neighbor) => [neighbor.item.id, neighbor.kind]));

  return (
    <main className="min-h-screen pt-28 pb-10 px-4 max-lg:pl-16">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80">Секретное</p>
            <h1 className="text-4xl font-bold">Дело Карабаса</h1>
            <p className="text-white/75 max-w-2xl mt-2">
              Карта расследования по зонам. Сплошная золотая нить — подтверждённая связь, пунктир — гипотеза, красная — противоречие, серая — ещё не открыто.
            </p>
          </div>
          <button type="button" className="btn" onClick={() => setPhase('chapterMap')}>На карту</button>
        </div>

        <section className="surface-card mb-6">
          <div className="flex justify-between gap-4 mb-3">
            <p className="font-semibold">Сила дела: {strength}%</p>
            <p className="text-sm text-white/70">{found.length} из {EVIDENCE_CATALOG.length} узлов</p>
          </div>
          <div className="h-3 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-200"
              style={{ width: `${strength}%`, transition: reduced ? 'none' : 'width 280ms ease' }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
            <li><span aria-hidden="true">━ </span>подтверждено</li>
            <li><span aria-hidden="true">┈ </span>гипотеза</li>
            <li className="text-red-300"><span aria-hidden="true">× </span>противоречие</li>
            <li><span aria-hidden="true">🔒 </span>недостаёт</li>
          </ul>
          {storyFlags.includes('lost-coin-karabas') && (
            <p className="text-sm mt-3 text-amber-100/90">Отложенное следствие: одна монета уже стала ценой урока у Карабаса.</p>
          )}
        </section>

        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-5">
          <section className="relative overflow-hidden rounded-3xl border border-amber-200/20 p-4 sm:p-6 space-y-5" style={{ background: 'radial-gradient(circle at 20% 10%, rgba(251,191,36,0.12), transparent 35%), #1b1328' }}>
            {EVIDENCE_ZONES.map((zone) => {
              const items = evidenceByZone(zone.id);
              if (items.length === 0) return null;
              return (
                <section key={zone.id}>
                  <h2 className="text-sm uppercase tracking-wide text-amber-100/80 mb-2">{zone.label}</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => {
                      const open = evidenceFound.includes(item.id);
                      const hot = selected?.id === item.id;
                      const tone = relatedKind.get(item.id);
                      const connected = Boolean(open && selected && selected.id !== item.id && tone);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!open}
                          aria-pressed={open ? hot : undefined}
                          onClick={() => setSelected(item)}
                          className={`text-left rounded-2xl border min-h-24 p-3 ${open ? 'bg-black/30 border-amber-200/40' : 'bg-black/20 border-white/10'} ${connected && tone ? LINK_CLASS[tone] : ''} ${newest === item.id && open ? 'ring-1 ring-amber-200/70' : ''}`}
                          style={{ transform: !reduced && hot ? 'translateY(-2px)' : undefined }}
                        >
                          <p className="text-xs uppercase tracking-wide text-amber-100/70">
                            {open ? KIND_LABEL[item.kind] : zone.label}
                          </p>
                          <h3 className="font-bold mt-1">{open ? item.title : 'Неизвестный узел'}</h3>
                          <p className="text-xs mt-2 text-white/60">
                            {open ? item.source : `🔒 ${item.unlockHint}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </section>

          <aside className="surface-card">
            {selected ? (
              <div className="motion-scene">
                <p className="text-sm text-amber-100/80">
                  {KIND_LABEL[selected.kind]} · {EVIDENCE_ZONES.find((zone) => zone.id === selected.zone)?.label} · надёжность: {RELIABILITY_LABEL[selected.reliability]}
                </p>
                <h2 className="text-2xl font-bold mb-3">{selected.title}</h2>
                <p className="mb-3">{selected.whyItMatters}</p>
                <p className="mb-2"><strong>Источник:</strong> {selected.source}</p>
                <p className="mb-2"><strong>Глава:</strong> {selected.chapter}</p>
                <p className="mb-2"><strong>Подтверждает:</strong> {selected.confirms}</p>
                <p className="mb-4"><strong>Ещё не доказывает:</strong> {selected.doesNotProve}</p>
                {related.length > 0 && (
                  <EvidenceGraph selected={selected} related={related} onOpen={(item) => setSelected(item)} />
                )}
              </div>
            ) : (
              <p>Пока нет ни одной улики. Вернись в главу и проверь сайт, договор или реквизиты.</p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function EvidenceGraph({
  selected,
  related,
  onOpen,
}: {
  selected: EvidenceDefinition;
  related: ReturnType<typeof neighborsOf>;
  onOpen: (item: EvidenceDefinition) => void;
}) {
  const cx = 120;
  const cy = 88;
  return (
    <div>
      <p className="text-sm font-semibold mb-2">Связи</p>
      <svg viewBox="0 0 240 176" className="w-full h-40 mb-3" role="img" aria-label={`Связи узла ${selected.title}`}>
        {related.map((neighbor, index) => {
          const angle = ((Math.PI * 2) / related.length) * index - Math.PI / 2;
          const x = cx + Math.cos(angle) * 78;
          const y = cy + Math.sin(angle) * 58;
          const stroke = STROKE[neighbor.kind];
          return (
            <g key={neighbor.item.id}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={stroke.color}
                strokeWidth="2"
                strokeDasharray={stroke.dash}
              />
              <circle cx={x} cy={y} r="7" fill={neighbor.open ? stroke.color : '#1b1328'} stroke={stroke.color} />
              {!neighbor.open && <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#fde68a">🔒</text>}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="10" fill="#fbbf24" />
      </svg>
      <ul className="space-y-2">
        {related.map((neighbor) => (
          <li key={neighbor.item.id}>
            {neighbor.open ? (
              <button type="button" className="text-left text-sm underline-offset-2 hover:underline" onClick={() => onOpen(neighbor.item)}>
                {neighbor.item.title} — {LINK_LABEL[neighbor.kind]}
              </button>
            ) : (
              <span className="text-sm text-white/65">🔒 Недостающий элемент · {LINK_LABEL.unknown}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
