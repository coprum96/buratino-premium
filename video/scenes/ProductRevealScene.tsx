import { CHAPTER_META } from '../../src/data/learningStages';

interface SceneProps {
  t: number;
}

export function ProductRevealScene({ t }: SceneProps) {
  return (
    <section className="film-scene" data-scene="reveal">
      <div className="film-scan" aria-hidden="true" />
      <div className="film-safe text-center">
        <img src="/img/item_detector_mirror_golden.png" alt="" className="film-logo" />
        <h1 className="film-title">Золотой Детектор</h1>
        <p className="film-sub">Учебная игра. Сначала проверь. Потом решай.</p>
        <div className="map-stack">
          {CHAPTER_META.slice(0, 6).map((chapter, index) => (
            <article
              key={chapter.id}
              className="surface-card map-card"
              style={{ opacity: t > 3800 + index * 180 ? 1 : 0 }}
            >
              <p className="text-xs uppercase tracking-wide text-white/70">Глава {index + 1}</p>
              <h2 className="text-lg font-bold">{chapter.title}</h2>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
