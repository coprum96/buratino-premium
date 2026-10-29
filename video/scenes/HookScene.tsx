interface SceneProps {
  t: number;
}

export function HookScene({ t }: SceneProps) {
  const words = ['2000%', 'Только сегодня', 'Осталось 2 места'];
  return (
    <section className="film-scene film-hook" data-scene="hook">
      <div className="film-safe">
        {words.map((word, index) => {
          const appear = 40 + index * 380;
          const visible = t >= appear;
          return (
            <p
              key={word}
              className="hook-word"
              style={{
                opacity: visible ? 1 : 0,
                transform: `translateZ(0) scale(${visible ? 1 : 1.18})`,
              }}
            >
              {word}
            </p>
          );
        })}
        <h1 className="film-title" style={{ opacity: t > 2100 ? 1 : 0 }}>
          Мошеннику нужны несколько секунд. Тебе нужна одна пауза.
        </h1>
      </div>
    </section>
  );
}
