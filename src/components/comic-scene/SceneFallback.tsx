interface SceneFallbackProps {
  name: string;
  side: 'left' | 'right';
}

export function SceneFallback({ name, side }: SceneFallbackProps) {
  return (
    <div
      className="comic-fallback"
      data-side={side}
      data-testid="character-fallback"
      aria-label={name}
    >
      <div className="comic-fallback-figure" aria-hidden="true" />
    </div>
  );
}
