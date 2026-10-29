import { characters, levels } from '../../src/data/gameData';

export function FraudOfferScene(_props: { t?: number }) {
  const offer = levels[7].dialogues[0];
  const fox = characters.fox_alice;
  return (
    <section className="film-scene" data-scene="detect">
      <div className="film-safe film-split">
        <img src={`/img/${fox.image}`} alt="" className="film-portrait" />
        <article className="surface-card">
          <p className="text-sm uppercase tracking-wide text-amber-200">{fox.name}</p>
          <p className="text-xl leading-relaxed">{offer.text}</p>
        </article>
      </div>
    </section>
  );
}
