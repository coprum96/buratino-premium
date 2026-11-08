import type { Choice } from '../../data/gameData';
import { ChoiceAction } from './ChoiceAction';

interface ChoicePanelProps {
  question: string;
  choices: Choice[];
  disabled: boolean;
  selectedId?: string;
  onSelect: (choice: Choice) => void;
}

export function ChoicePanel({
  question,
  choices,
  disabled,
  selectedId,
  onSelect,
}: ChoicePanelProps) {
  return (
    <div className="comic-choices" data-testid="choice-panel">
      <p className="comic-choices-q">{question}</p>
      {choices.map((choice, index) => {
        const id = choice.id || choice.text;
        return (
          <ChoiceAction
            key={id}
            choice={choice}
            index={index}
            disabled={disabled}
            selected={selectedId === id}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
