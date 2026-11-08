import { useEffect, useMemo, useRef, useState } from 'react';
import { characters, type Choice, type PresentationSlide, type RedFlagDetail } from '../../data/gameData';
import type { AppliedAftermath } from '../../lib/choiceAftermath';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { chapter2OfferText, chapter2Presentation, getChapter2TheaterConfig } from '../../scenes/chapter2Theater';
import { ChoiceAftermath } from '../ChoiceAftermath';
import { CharacterLayer } from './CharacterLayer';
import { ChoicePanel } from './ChoicePanel';
import { CoinTransfer } from './CoinTransfer';
import { CompactHUD } from './CompactHUD';
import { DialogueBubble } from './DialogueBubble';
import { EvidenceReveal } from './EvidenceReveal';
import { InnerMonologuePanel } from './InnerMonologuePanel';
import { InteractiveEvidence } from './InteractiveEvidence';
import { SceneBackground } from './SceneBackground';

export interface GameSceneProps {
  chapterLabel: string;
  chapterTitle: string;
  location: string;
  speakerId: string;
  emotion?: string;
  dialogueText: string;
  question: string;
  choices: Choice[];
  pendingChoice: Choice | null;
  appliedAftermath: AppliedAftermath;
  replay: boolean;
  presentation?: PresentationSlide[];
  redFlags?: RedFlagDetail[];
  lostCoinWarning: boolean;
  nextDisabled?: boolean;
  onChoice: (choice: Choice) => void;
  onContinue: () => void;
  onOpenBoard?: () => void;
  onRedFlag: (flag: RedFlagDetail) => void;
  onCollectPresentation: () => void;
}

export function GameScene({
  chapterLabel,
  chapterTitle,
  location,
  speakerId,
  emotion,
  dialogueText,
  question,
  choices,
  pendingChoice,
  appliedAftermath,
  replay,
  presentation,
  redFlags,
  lostCoinWarning,
  nextDisabled,
  onChoice,
  onContinue,
  onOpenBoard,
  onRedFlag,
  onCollectPresentation,
}: GameSceneProps) {
  const reduced = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [dialogueText]);
  const coinRef = useRef<HTMLSpanElement>(null);
  const caseRef = useRef<HTMLButtonElement>(null);
  const antagonistRef = useRef<HTMLDivElement>(null);
  const choiceLock = useRef(false);

  useEffect(() => {
    if (!pendingChoice) choiceLock.current = false;
  }, [pendingChoice]);

  const selectChoice = (choice: Choice) => {
    if (choiceLock.current || pendingChoice) return;
    choiceLock.current = true;
    onChoice(choice);
  };
  const config = useMemo(
    () => getChapter2TheaterConfig(speakerId, emotion),
    [speakerId, emotion],
  );
  const speakerName = characters[speakerId]?.name ?? speakerId;
  const slides = presentation && presentation.length > 0 ? presentation : chapter2Presentation();

  return (
    <main className={`comic-scene ${reduced ? '' : 'comic-scene-enter'}`} data-testid="comic-scene">
      <CompactHUD coinRef={coinRef} caseButtonRef={caseRef} />
      <div className="comic-stage">
        <SceneBackground asset={config.background} />
        <div className="comic-cast" aria-hidden={false}>
          <header className="comic-chapter">
            <p>{chapterLabel} · {location}</p>
            <h1>{chapterTitle}</h1>
          </header>
          {config.characters.map((placement) => (
            <CharacterLayer
              key={`${placement.characterId}-${placement.side}`}
              placement={placement}
              layerRef={placement.characterId === 'karabas' ? antagonistRef : undefined}
            />
          ))}
        </div>
        <div className="comic-front">
          {lostCoinWarning && (
            <InnerMonologuePanel text="Подушка тоньше: у Карабаса уже ушла одна монета." />
          )}
          {replay && (
            <InnerMonologuePanel text="Повтор: баллы не начисляются снова." />
          )}
          <DialogueBubble
            key={dialogueText}
            speakerName={speakerName}
            text={dialogueText}
            side={config.dialogue.side}
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
          />
          <InteractiveEvidence
            phoneText={chapter2OfferText()}
            slides={slides}
            redFlags={redFlags}
            collectOnLeafletClose={Boolean(presentation)}
            onCollectPresentation={onCollectPresentation}
            onRedFlag={onRedFlag}
          />
          {!pendingChoice && (
            <ChoicePanel
              question={question}
              choices={choices}
              disabled={false}
              onSelect={selectChoice}
            />
          )}
          {pendingChoice && (
            <ChoiceAftermath
              choice={pendingChoice}
              characterId={speakerId}
              replay={replay}
              applied={appliedAftermath}
              nextDisabled={nextDisabled}
              className="comic-aftermath"
              onContinue={onContinue}
              onOpenBoard={onOpenBoard}
            />
          )}
        </div>
      </div>
      <EvidenceReveal ids={appliedAftermath.newEvidenceIds} targetRef={caseRef} />
      <CoinTransfer
        coinsDelta={appliedAftermath.coinsDelta}
        fromRef={coinRef}
        toRef={antagonistRef}
      />
    </main>
  );
}
