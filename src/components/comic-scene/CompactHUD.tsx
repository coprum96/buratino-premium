import { useEffect, useRef, useState, type Ref } from 'react';
import { EVIDENCE_CATALOG } from '../../data/evidence';
import { reputationRank } from '../../lib/evidence';
import { describeScoreEvent } from '../../lib/scoring';
import { useGameStore } from '../../store/gameStore';
import { LiveRegion } from '../ui/LiveRegion';
import { HudMenu } from './HudMenu';

interface CompactHUDProps {
  coinRef?: Ref<HTMLSpanElement>;
  caseButtonRef?: Ref<HTMLButtonElement>;
}

export function CompactHUD({ coinRef, caseButtonRef }: CompactHUDProps) {
  const {
    coins,
    wisdom,
    wisdomOverflow,
    lastScoreEvent,
    evidenceFound,
    soundMuted,
    toggleSoundMuted,
    toggleAchievementGallery,
    toggleMaterialsPanel,
    setPhase,
  } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const rank = reputationRank(wisdom);
  const clues = evidenceFound.length;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuButtonRef.current?.contains(target)) return;
      if ((event.target as HTMLElement).closest('.comic-hud-menu')) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [menuOpen]);

  return (
    <header className="comic-hud" data-testid="compact-hud">
      <LiveRegion message={lastScoreEvent ? describeScoreEvent(lastScoreEvent) : ''} />
      <div
        className="comic-hud-stat"
        data-kind="coins"
        title="Учебные монеты. Их можно потерять сюжетным решением."
      >
        <span ref={coinRef} aria-hidden="true">●</span>
        <span>{coins}</span>
        <span className="sr-only">Монет: {coins}</span>
      </div>
      <div
        className="comic-hud-stat comic-hud-rank"
        title="Репутация следователя. Повтор главы баллы не удваивает."
      >
        <span>{rank}</span>
        {wisdomOverflow > 0 && <span>+{wisdomOverflow}</span>}
        <span className="sr-only">
          Репутация: {rank}, {wisdom} процентов
          {wisdomOverflow > 0 ? `, опыт сверх шкалы: ${wisdomOverflow}` : ''}
        </span>
      </div>
      <div
        className="comic-hud-stat"
        data-kind="clues"
        title={`Улики на доске дела: ${clues} из ${EVIDENCE_CATALOG.length}.`}
      >
        <span>{clues}/{EVIDENCE_CATALOG.length}</span>
        <span className="sr-only">Улик собрано: {clues} из {EVIDENCE_CATALOG.length}</span>
      </div>
      <button
        ref={caseButtonRef}
        type="button"
        className="comic-hud-btn"
        onClick={() => setPhase('caseBoard')}
      >
        Дело
      </button>
      <button
        ref={menuButtonRef}
        type="button"
        className="comic-hud-btn"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        Меню
      </button>
      <HudMenu
        open={menuOpen}
        soundMuted={soundMuted}
        onClose={() => {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }}
        onToggleSound={toggleSoundMuted}
        onOpenAchievements={() => {
          setMenuOpen(false);
          toggleAchievementGallery();
        }}
        onOpenHelp={() => {
          setMenuOpen(false);
          toggleMaterialsPanel();
        }}
        onOpenMap={() => {
          setMenuOpen(false);
          setPhase('chapterMap');
        }}
      />
    </header>
  );
}
