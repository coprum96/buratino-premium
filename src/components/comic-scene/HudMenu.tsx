import { useEffect, useId, useRef } from 'react';

interface HudMenuProps {
  open: boolean;
  soundMuted: boolean;
  onClose: () => void;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
  onOpenMap: () => void;
}

export function HudMenu({
  open,
  soundMuted,
  onClose,
  onToggleSound,
  onOpenAchievements,
  onOpenHelp,
  onOpenMap,
}: HudMenuProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('button');
    first?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="comic-hud-menu"
      role="menu"
      aria-labelledby={titleId}
      data-testid="hud-menu"
    >
      <p id={titleId} className="sr-only">Меню сцены</p>
      <button
        type="button"
        role="menuitem"
        aria-pressed={soundMuted}
        onClick={onToggleSound}
      >
        {soundMuted ? 'Звук выключен' : 'Звук включён'}
      </button>
      <button type="button" role="menuitem" onClick={onOpenAchievements}>
        Достижения
      </button>
      <button type="button" role="menuitem" onClick={onOpenHelp}>
        Справка
      </button>
      <button type="button" role="menuitem" onClick={onOpenMap}>
        На карту
      </button>
    </div>
  );
}
