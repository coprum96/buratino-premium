import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { characters, type Choice, type PresentationSlide, type RedFlagDetail } from '../../data/gameData';
import type { AppliedAftermath } from '../../lib/choiceAftermath';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { chapter2OfferText, chapter2Presentation } from '../../scenes/chapter2Theater';
import { comicLocationLabel, getComicSceneConfig } from '../../scenes/comicScenes';
import { ChoiceAftermath } from '../ChoiceAftermath';
import { CharacterLayer } from './CharacterLayer';
import { ChoicePanel } from './ChoicePanel';
import { CoinTransfer } from './CoinTransfer';
import { ComicSiteCompare } from './ComicSiteCompare';
import { CompactHUD } from './CompactHUD';
import { DialogueBubble } from './DialogueBubble';
import { EvidenceReveal } from './EvidenceReveal';
import { InnerMonologuePanel } from './InnerMonologuePanel';
import { InteractiveEvidence } from './InteractiveEvidence';
import { PrologueTable } from './PrologueTable';
import { SceneBackground } from './SceneBackground';
import { YieldCalcTask } from './YieldCalcTask';

export interface GameSceneProps {
  levelId: number;
  dialogueIndex: number;
  chapterLabel: string;
  chapterTitle: string;
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
  showPrologueTable?: boolean;
  showYieldCalc?: boolean;
  showSiteCompare?: boolean;
  showOfferObjects?: boolean;
  nextDisabled?: boolean;
  onChoice: (choice: Choice) => void;
  onContinue: () => void;
  onOpenBoard?: () => void;
  onRedFlag: (flag: RedFlagDetail) => void;
  onCollectPresentation: () => void;
  onGateReady?: (ready: boolean) => void;
}

export function GameScene({
  levelId,
  dialogueIndex,
  chapterLabel,
  chapterTitle,
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
  showPrologueTable = false,
  showYieldCalc = false,
  showSiteCompare = false,
  showOfferObjects = false,
  nextDisabled,
  onChoice,
  onContinue,
  onOpenBoard,
  onRedFlag,
  onCollectPresentation,
  onGateReady,
}: GameSceneProps) {
  const reduced = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const coinRef = useRef<HTMLSpanElement>(null);
  const caseRef = useRef<HTMLButtonElement>(null);
  const antagonistRef = useRef<HTMLDivElement>(null);
  const choiceLock = useRef(false);

  useEffect(() => {
    setExpanded(false);
  }, [dialogueText]);

  useEffect(() => {
    if (!pendingChoice) choiceLock.current = false;
  }, [pendingChoice]);

  const selectChoice = (choice: Choice) => {
    if (choiceLock.current || pendingChoice) return;
    choiceLock.current = true;
    onChoice(choice);
  };

  const handleGate = useCallback((ready: boolean) => {
    onGateReady?.(ready);
  }, [onGateReady]);

  const config = useMemo(
    () => getComicSceneConfig(levelId, dialogueIndex, speakerId, emotion),
    [levelId, dialogueIndex, speakerId, emotion],
  );
  const location = comicLocationLabel(levelId, dialogueIndex);
  const speakerName = characters[speakerId]?.name ?? speakerId;
  const slides = presentation && presentation.length > 0 ? presentation : chapter2Presentation();

  const castMode = config.castMode ?? 'overlay';
  const embedded = castMode === 'embedded';

  return (
    <main
      className={`comic-scene ${reduced ? '' : 'comic-scene-enter'}`}
      data-testid="comic-scene"
      data-level={levelId}
      data-cast={castMode}
    >
      <CompactHUD coinRef={coinRef} caseButtonRef={caseRef} />
      <div className="comic-stage">
        <SceneBackground asset={config.background} />
        <div className="comic-cast">
          <header className="comic-chapter">
            <p>{chapterLabel} · {location}</p>
            <h1>{chapterTitle}</h1>
          </header>
          {!embedded && config.characters.map((placement) => (
            <CharacterLayer
              key={`${placement.characterId}-${placement.side}-${placement.anchorX}`}
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
          {showPrologueTable && <PrologueTable onReadyChange={handleGate} />}
          {showYieldCalc && <YieldCalcTask onReadyChange={handleGate} />}
          {showSiteCompare && <ComicSiteCompare onComplete={() => handleGate(true)} />}
          {showOfferObjects && (
            <InteractiveEvidence
              phoneText={chapter2OfferText()}
              slides={slides}
              redFlags={redFlags}
              collectOnLeafletClose={Boolean(presentation)}
              onCollectPresentation={onCollectPresentation}
              onRedFlag={onRedFlag}
            />
          )}
          {!pendingChoice && (
            <ChoicePanel
              question={question}
              choices={choices}
              disabled={Boolean(nextDisabled)}
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
              compact
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
