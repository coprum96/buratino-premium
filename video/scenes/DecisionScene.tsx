import { levels } from '../../src/data/gameData';

interface SceneProps {
  t: number;
}

export function DecisionScene({ t }: SceneProps) {
  const choices = levels[7].dialogues[0].choices;
  const unsafe = choices.find((choice) => choice.consequence === 'loss');
  const safe = choices.find((choice) => choice.consequence === 'pause') ?? choices.find((choice) => choice.consequence === 'safe');
  return (
    <section className="film-scene" data-scene="decide">
      <div className="film-safe film-split">
        <article className="choice-card" data-state="incorrect" style={{ opacity: t > 20400 ? 1 : 0 }}>
          <span>{unsafe?.text}</span>
          <small>{unsafe?.feedback}</small>
        </article>
        <article className="choice-card" data-state="correct" style={{ opacity: t > 22800 ? 1 : 0 }}>
          <span>{safe?.text}</span>
          <small>{safe?.feedback}</small>
        </article>
      </div>
    </section>
  );
}
