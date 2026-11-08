interface InnerMonologuePanelProps {
  text: string;
}

export function InnerMonologuePanel({ text }: InnerMonologuePanelProps) {
  return (
    <aside className="comic-monologue" data-testid="inner-monologue">
      <p>{text}</p>
    </aside>
  );
}
