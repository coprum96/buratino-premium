import { levels } from '../../src/data/gameData';

interface SceneProps {
  t: number;
}

export function DetectorScanScene({ t }: SceneProps) {
  const flags = levels[7].dialogues[0].redFlagsData ?? [];
  return (
    <section className="film-scene" data-scene="scan">
      <div className="film-scan" aria-hidden="true" />
      <div className="film-safe">
        <h1 className="film-title mb-6">Золотой Детектор отмечает признаки</h1>
        <ul className="flag-list">
          {flags.slice(0, 4).map((flag, index) => (
            <li
              key={flag.title}
              className="choice-card motion-danger"
              style={{ opacity: t > 11200 + index * 380 ? 1 : 0 }}
            >
              {flag.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
