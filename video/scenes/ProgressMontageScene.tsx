import { CHAPTER_META } from '../../src/data/learningStages';

export function ProgressMontageScene(_props: { t?: number }) {
  const shots = [
    { title: 'Карта глав', src: '/img/background_cobblestone_path.png', note: CHAPTER_META[1].title },
    { title: 'Договор', src: '/img/item_letter_tortila_sealed.png', note: 'Микроскоп: мелкий шрифт' },
    { title: 'Калькулятор', src: '/img/item_business_plan.png', note: 'Долг и переплата, не сказка' },
    { title: 'Проверка', src: '/img/character_cricket_wise.png', note: 'Независимый тест' },
    { title: 'Галерея', src: '/img/item_detector_mirror_golden.png', note: 'Достижения сохраняются' },
  ];
  return (
    <section className="film-scene" data-scene="montage">
      <div className="film-safe montage-grid">
        {shots.map((shot) => (
          <article key={shot.title} className="surface-card montage-card">
            <img src={shot.src} alt="" />
            <h2>{shot.title}</h2>
            <p>{shot.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
