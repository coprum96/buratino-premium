import { getEndingContent } from '../../src/lib/endings';

export function FinalPayoffScene(_props: { t?: number }) {
  const ending = getEndingContent('safe', 5);
  return (
    <section className="film-scene film-payoff" data-scene="payoff">
      <div className="film-safe text-center">
        <img src="/img/item_gold_coins_5.png" alt="" className="film-coins" />
        <img src="/img/character_buratino_cautious.png" alt="" className="film-portrait mx-auto" />
        <h1 className="film-title">{ending.title}</h1>
        <p className="film-sub">Золотой Детектор. Сначала проверь. Потом решай.</p>
        <p className="film-cta">Научись распознавать финансовое мошенничество</p>
      </div>
    </section>
  );
}
