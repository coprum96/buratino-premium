import type { Choice } from '../../data/gameData';

interface ChoiceActionProps {
  choice: Choice;
  index: number;
  disabled: boolean;
  selected: boolean;
  onSelect: (choice: Choice) => void;
}

export function ChoiceAction({
  choice,
  index,
  disabled,
  selected,
  onSelect,
}: ChoiceActionProps) {
  return (
    <button
      type="button"
      className="comic-choice"
      data-state={selected ? 'selected' : 'default'}
      disabled={disabled}
      onClick={() => onSelect(choice)}
    >
      <span className="comic-choice-mark" aria-hidden="true">{index + 1}</span>
      <span>
        <span className="comic-choice-title">{choice.text}</span>
        {choice.detail && <span className="comic-choice-detail">{choice.detail}</span>}
      </span>
    </button>
  );
}
