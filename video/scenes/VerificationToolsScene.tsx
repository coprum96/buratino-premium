import { assessmentBank } from '../../src/data/assessmentBank';
import { controlQuestions } from '../../src/data/gameData';

interface SceneProps {
  t: number;
}

export function VerificationToolsScene({ t }: SceneProps) {
  const tools = ['Список ЦБ', 'Лицензия', 'Реквизиты', 'Договор', 'Расчёт'];
  const honest = assessmentBank.find((item) => item.kind === 'legitimate');
  return (
    <section className="film-scene" data-scene="verify">
      <div className="film-scan" aria-hidden="true" />
      <div className="film-safe">
        <div className="tool-row">
          {tools.map((tool, index) => (
            <span key={tool} className="tool-chip" style={{ opacity: t > 14200 + index * 220 ? 1 : 0 }}>
              {tool}
            </span>
          ))}
        </div>
        <article className="surface-card mt-6">
          <p className="text-sm text-amber-200 mb-2">Не только схема. Ещё и добросовестное предложение.</p>
          <p className="text-lg">{honest?.text}</p>
          <p className="mt-3 text-white/75">{controlQuestions[0]}</p>
        </article>
      </div>
    </section>
  );
}
