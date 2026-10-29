import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHAPTER_META } from '../data/learningStages';
import { characters, levels, type Choice, type RedFlagDetail } from '../data/gameData';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { describeScoreEvent } from '../lib/scoring';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { LieDetector } from './LieDetector';
import { LossCalculator } from './LossCalculator';
import { MatchGame } from './MatchGame';
import { MicroscopeView } from './MicroscopeView';
import { PresentationViewer } from './PresentationViewer';
import { PressureTimer } from './PressureTimer';
import { RedFlagModal } from './RedFlagModal';
import { SiteCompareTask } from './tasks/SiteCompareTask';

export function DialogueScene() {
  const {
    currentLevel,
    currentDialogue,
    addWisdom,
    addCoins,
    setCurrentDialogue,
    setPhase,
    completeStory,
    checkLevelAccess,
    setPendingLevel,
    recordStoryChoice,
    storyChoices,
    finaleDecision,
    lastScoreEvent,
    isReplayingChapter,
    collectEvidence,
    setStoryFlags,
    storyFlags,
    coins,
  } = useGameStore();
  const reducedMotion = usePrefersReducedMotion();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [selectedRedFlag, setSelectedRedFlag] = useState<RedFlagDetail | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [calculatorReady, setCalculatorReady] = useState(true);
  const [siteCompareReady, setSiteCompareReady] = useState(false);
  const handleCalculatorValidity = useCallback((ok: boolean) => {
    setCalculatorReady(ok);
  }, []);

  const level = levels[currentLevel];
  const dialogue = level?.dialogues[currentDialogue];
  const character = dialogue ? characters[dialogue.character] : undefined;
  const meta = CHAPTER_META[currentLevel];
  const visibleText = useMemo(() => {
    if (!dialogue) return '';
    if (currentLevel === 7 && finaleDecision && dialogue.variants?.[finaleDecision]) {
      return dialogue.variants[finaleDecision]!.text;
    }
    const lastConsequence = [...storyChoices]
      .reverse()
      .find((choice) => choice.chapterId === currentLevel)?.consequence;
    if (lastConsequence && dialogue.variants && lastConsequence in dialogue.variants) {
      return dialogue.variants[lastConsequence as keyof typeof dialogue.variants]!.text;
    }
    return dialogue.text;
  }, [dialogue, finaleDecision, storyChoices, currentLevel]);

  useEffect(() => {
    if (currentDialogue === 0 && level) {
      sessionAnalytics.startLevel(currentLevel);
    }
  }, [currentLevel, currentDialogue, level]);

  useEffect(() => {
    if (!dialogue) return;
    setPendingChoice(null);
    setCalculatorReady(true);
    setSiteCompareReady(false);
    setShowTimer(true);
    setTimerCompleted(false);
    if (reducedMotion) {
      setDisplayedText(visibleText);
      setIsTyping(false);
      setShowChoices(true);
      return;
    }

    setIsTyping(true);
    setShowChoices(false);
    setDisplayedText('');
    let currentIndex = 0;
    const timer = window.setInterval(() => {
      currentIndex += 1;
      setDisplayedText(visibleText.slice(0, currentIndex));
      if (currentIndex >= visibleText.length) {
        setIsTyping(false);
        setShowChoices(true);
        window.clearInterval(timer);
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [dialogue, visibleText, reducedMotion]);

  if (!level || !dialogue || !character) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  const goNext = (choice: Choice) => {
    if (choice.nextLevel) {
      completeStory(currentLevel);
      setPhase('quiz');
    } else if (choice.nextPhase === 'posttest') {
      completeStory(currentLevel);
      setPhase('postTest');
    } else if (choice.next !== undefined) {
      setCurrentDialogue(choice.next);
    } else {
      const nextDialogueIndex = currentDialogue + 1;
      if (nextDialogueIndex < level.dialogues.length) {
        setCurrentDialogue(nextDialogueIndex);
      } else if (level.quiz.length > 0) {
        completeStory(currentLevel);
        setPhase('quiz');
      } else {
        completeStory(currentLevel);
        const nextLevelId = currentLevel + 1;
        if (!checkLevelAccess(nextLevelId)) {
          setPendingLevel(nextLevelId);
          setPhase('paywall');
        } else {
          useGameStore.getState().completeChapter(currentLevel);
          useGameStore.getState().nextLevel();
        }
      }
    }
  };

  const handleChoice = (choice: Choice) => {
    if (pendingChoice) return;
    sessionAnalytics.trackDialogueChoice(
      currentLevel,
      currentDialogue,
      dialogue.character,
      choice.text,
      choice.wisdom || 0,
      choice.coins || 0
    );
    recordStoryChoice({
      chapterId: currentLevel,
      dialogueIndex: currentDialogue,
      choiceId: choice.id || choice.text,
      choiceText: choice.text,
      consequence: choice.consequence,
      wisdomChange: choice.wisdom || 0,
      coinChange: choice.coins || 0,
    });
    if (choice.wisdom) addWisdom(choice.wisdom, choice.feedback || choice.text);
    if (choice.coins) addCoins(choice.coins, choice.feedback || choice.text);
    if (choice.evidence) collectEvidence(choice.evidence);
    if (choice.flags) setStoryFlags(choice.flags);
    setPendingChoice(choice);
  };

  return (
    <main className="min-h-screen pt-24 pb-10">
      <div className="container max-w-3xl mx-auto px-4 motion-scene">
        <div className="flex justify-between items-center mb-4 gap-3">
          <button type="button" className="btn" onClick={() => setPhase('chapterMap')}>
            На карту
          </button>
          {isReplayingChapter && <p className="text-sm text-white/70">Повтор: баллы не начисляются снова</p>}
          <button type="button" className="btn" onClick={() => setPhase('caseBoard')}>Дело</button>
        </div>
        {storyFlags.includes('lost-coin-karabas') && coins < 5 && (
          <p className="mb-4 text-sm text-amber-100/90">Подушка тоньше: у Карабаса уже ушла одна монета. Часть «вложить всё» теперь бьёт больнее.</p>
        )}

        {currentDialogue === 0 && meta && (
          <section className="surface-card mb-5">
            <p className="text-sm uppercase tracking-wide text-white/70">Глава {currentLevel + 1}</p>
            <h1 className="text-2xl font-bold mb-2">{meta.title}</h1>
            <p className="mb-1"><strong>Цель:</strong> {meta.goal}</p>
            <p className="text-white/80">Около {meta.durationMin} минут</p>
          </section>
        )}

        <div className="text-center mb-5">
          {character.image ? (
            <img
              src={`/img/${character.image}`}
              alt=""
              className="w-full max-w-[180px] mx-auto rounded-xl mb-3"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="text-6xl mb-3" aria-hidden="true">{character.emoji}</div>
          )}
          <h2 className="text-2xl font-bold">{character.name}</h2>
        </div>

        <section className="surface-card mb-5">
          <p className="text-lg leading-relaxed whitespace-pre-line">{displayedText}{isTyping && '▋'}</p>
          <button
            type="button"
            className={`btn mt-4 ${isTyping ? '' : 'invisible pointer-events-none'}`}
            tabIndex={isTyping ? 0 : -1}
            aria-hidden={!isTyping}
            disabled={!isTyping}
            onClick={() => {
              setDisplayedText(visibleText);
              setIsTyping(false);
              setShowChoices(true);
            }}
          >
            Показать весь текст
          </button>

          {dialogue.redFlagsData && !isTyping && (
            <div className="mt-5 p-4 bg-danger/15 border border-danger/40 rounded-xl motion-danger">
              <h3 className="font-bold mb-3">На что обратить внимание</h3>
              <ul className="space-y-2">
                {dialogue.redFlagsData.map((flag) => (
                  <li key={flag.title}>
                    <button
                      type="button"
                      className="choice-card motion-choice"
                      onClick={() => {
                        useGameStore.getState().noteRedFlagOpen();
                        setSelectedRedFlag(flag);
                      }}
                    >
                      {flag.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {dialogue.pressureTimer && showTimer && !timerCompleted && !isTyping && (
          <PressureTimer
            initialSeconds={dialogue.pressureTimer}
            onSuccess={() => {
              addWisdom(20, 'Ты выдержал давление и не спешил');
              setTimerCompleted(true);
              setShowTimer(false);
            }}
            onTimeout={() => {
              addWisdom(-10, 'Срок вышел: в спешке решения слабее');
              setTimerCompleted(true);
            }}
          />
        )}

        {dialogue.calculator && !isTyping && (
          <div className="mb-5">
            <LossCalculator onValidityChange={handleCalculatorValidity} />
          </div>
        )}
        {dialogue.siteCompare && !isTyping && (
          <SiteCompareTask onComplete={() => {
            collectEvidence(['swapped-domain', 'golden-stage', 'personal-card']);
            setSiteCompareReady(true);
          }} />
        )}
        {dialogue.matchGame && !isTyping && (
          <div className="mb-5">
            <MatchGame onComplete={(score) => addWisdom(score * 2, 'Игра на сопоставление')} />
          </div>
        )}
        {dialogue.lieDetector && !isTyping && (
          <div className="mb-5">
            <LieDetector
              character={dialogue.lieDetector.character}
              lies={dialogue.lieDetector.segments}
              onComplete={(score) => addWisdom(score, 'Разбор сомнительных фраз')}
            />
          </div>
        )}

        {!isTyping && (dialogue.presentation || dialogue.microscope) && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {dialogue.presentation && (
              <button type="button" className="btn flex-1" onClick={() => setShowPresentation(true)}>
                Посмотреть презентацию
              </button>
            )}
            {dialogue.microscope && (
              <button type="button" className="btn flex-1" onClick={() => setShowMicroscope(true)}>
                Открыть договор
              </button>
            )}
          </div>
        )}

        {showChoices && !pendingChoice && (
          <div className="space-y-3 motion-stagger">
            {dialogue.calculator && !calculatorReady && (
              <p className="text-sm text-white/75">Сначала введи корректные сумму и срок — тогда можно продолжить.</p>
            )}
            {dialogue.siteCompare && !siteCompareReady && (
              <p className="text-sm text-white/75">Найди три отличия на витринах — тогда улика попадёт в дело.</p>
            )}
            {dialogue.choices.map((choice) => (
              <button
                key={choice.text}
                type="button"
                className="choice-card motion-choice"
                disabled={Boolean((dialogue.calculator && !calculatorReady) || (dialogue.siteCompare && !siteCompareReady))}
                onClick={() => handleChoice(choice)}
              >
                <span aria-hidden="true">{choice.icon}</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}

        {pendingChoice && (
          <section className="surface-card mt-4">
            <h3 className="font-bold mb-2">Что это значит</h3>
            <p className="mb-3 leading-relaxed">
              {pendingChoice.feedback
                || (pendingChoice.wisdom && pendingChoice.wisdom < 0
                  ? 'Этот выбор слабее защищает деньги. Дальше разберём, какой факт стоит проверить.'
                  : 'Ты выбрал более осторожный путь. Дальше закрепим, что именно здесь важно.')}
            </p>
            {lastScoreEvent && <p className="text-sm mb-4">{describeScoreEvent(lastScoreEvent)}</p>}
            <button type="button" className="btn btn-primary" onClick={() => goNext(pendingChoice)}>
              Далее
            </button>
          </section>
        )}
      </div>

      {showPresentation && dialogue.presentation && (
        <PresentationViewer
          slides={dialogue.presentation}
          onClose={() => {
            collectEvidence(['promised-yield', 'golden-stage']);
            setShowPresentation(false);
          }}
        />
      )}
      {showMicroscope && dialogue.microscope && (
        <MicroscopeView
          title={dialogue.microscope.title}
          smallPrintText={dialogue.microscope.smallPrintText}
          dangerousTerms={dialogue.microscope.dangerousTerms}
          onClose={() => {
            collectEvidence(['contract', 'lockup-clause']);
            setShowMicroscope(false);
          }}
        />
      )}
      {selectedRedFlag && (
        <RedFlagModal flag={selectedRedFlag} onClose={() => setSelectedRedFlag(null)} />
      )}
    </main>
  );
}
