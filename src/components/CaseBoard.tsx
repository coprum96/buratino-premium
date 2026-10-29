import { useMemo, useState } from 'react';
import { EVIDENCE_CATALOG, type EvidenceDefinition } from '../data/evidence';
import { caseStrength, foundEvidence } from '../lib/evidence';
import { useGameStore } from '../store/gameStore';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const KIND_LABEL: Record<EvidenceDefinition['kind'], string> = {
  person: 'Человек',
  company: 'Контора',
  document: 'Документ',
  clue: 'Улика',
};

export function CaseBoard() {
  const { evidenceFound, setPhase, storyFlags } = useGameStore();
  const reduced = usePrefersReducedMotion();
  const found = useMemo(() => foundEvidence(evidenceFound), [evidenceFound]);
  const [selected, setSelected] = useState<EvidenceDefinition | null>(found[0] ?? null);
  const strength = caseStrength(evidenceFound);
  const linked = new Set(selected?.links ?? []);

  return (
    <main className="min-h-screen pt-28 pb-10 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200/80">Секретное</p>
            <h1 className="text-4xl font-bold">Дело Карабаса</h1>
            <p className="text-white/75 max-w-2xl mt-2">
              Собери достаточно доказательств, сохрани монеты и выясни, кто стоит за схемой.
              Серое — ещё не найдено. Золотая нить — только то, что ты сам открыл.
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
          {storyFlags.includes('lost-coin-karabas') && (
            <p className="text-sm mt-3 text-amber-100/90">Отложенное следствие: одна монета уже стала ценой урока у Карабаса.</p>
          )}
        </section>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <section className="relative overflow-hidden rounded-3xl border border-amber-200/20 min-h-[28rem] p-4 sm:p-6" style={{ background: 'radial-gradient(circle at 20% 10%, rgba(251,191,36,0.12), transparent 35%), #1b1328' }}>
            <div className="absolute inset-0 opacity-20" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EVIDENCE_CATALOG.map((item) => {
                const open = evidenceFound.includes(item.id);
                const hot = selected?.id === item.id;
                const connected = selected && open && (linked.has(item.id) || item.links.includes(selected.id));
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!open}
                    onClick={() => setSelected(item)}
                    className={`text-left rounded-2xl border min-h-28 p-3 transition-transform ${open ? 'bg-black/30 border-amber-200/40' : 'bg-black/20 border-white/10 opacity-50'}`}
                    style={{
                      transform: !reduced && hot ? 'translateY(-3px)' : undefined,
                      boxShadow: connected && !reduced ? '0 0 0 1px rgba(251,191,36,0.7), 0 10px 24px rgba(0,0,0,0.35)' : undefined,
                    }}
                  >
                    <p className="text-xs uppercase tracking-wide text-amber-100/70">{KIND_LABEL[item.kind]}</p>
                    <h2 className="font-bold mt-1">{open ? item.title : 'Неизвестный узел'}</h2>
                    <p className="text-xs mt-2 text-white/60">{open ? item.source : 'Сначала найди это действием, не лекцией.'}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="surface-card">
            {selected ? (
              <div className="motion-scene">
                <p className="text-sm text-amber-100/80">{KIND_LABEL[selected.kind]} · надёжность: {selected.reliability === 'strong' ? 'высокая' : selected.reliability === 'medium' ? 'средняя' : 'слабая'}</p>
                <h2 className="text-2xl font-bold mb-3">{selected.title}</h2>
                <p className="mb-3">{selected.whyItMatters}</p>
                <p className="mb-2"><strong>Подтверждает:</strong> {selected.confirms}</p>
                <p className="mb-4"><strong>Ещё не доказывает:</strong> {selected.doesNotProve}</p>
                <p className="text-sm text-white/70">Источник: {selected.source}</p>
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
