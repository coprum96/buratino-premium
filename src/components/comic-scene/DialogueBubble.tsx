import { dialoguePreview } from '../../lib/dialoguePreview';

interface DialogueBubbleProps {
  speakerName: string;
  text: string;
  side: 'left' | 'right';
  expanded: boolean;
  onToggle: () => void;
}

export function DialogueBubble({
  speakerName,
  text,
  side,
  expanded,
  onToggle,
}: DialogueBubbleProps) {
  const preview = dialoguePreview(text);
  const needsExpand = preview !== text;

  return (
    <section className="comic-bubble" data-side={side} data-expanded={expanded} aria-labelledby="comic-speaker">
      <p id="comic-speaker" className="comic-bubble-speaker">{speakerName}</p>
      <p className="comic-bubble-text">{expanded || !needsExpand ? text : preview}</p>
      {needsExpand && (
        <button type="button" className="comic-text-btn" onClick={onToggle}>
          {expanded ? 'Свернуть' : 'Показать весь текст'}
        </button>
      )}
      <span className="comic-bubble-tail" aria-hidden="true" />
    </section>
  );
}
