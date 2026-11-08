import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { PresentationSlide, RedFlagDetail } from '../../data/gameData';

type InspectKind = 'phone' | 'leaflet' | null;

interface InteractiveEvidenceProps {
  phoneText: string;
  slides: PresentationSlide[];
  redFlags?: RedFlagDetail[];
  collectOnLeafletClose: boolean;
  onCollectPresentation: () => void;
  onRedFlag: (flag: RedFlagDetail) => void;
}

export function InteractiveEvidence({
  phoneText,
  slides,
  redFlags,
  collectOnLeafletClose,
  onCollectPresentation,
  onRedFlag,
}: InteractiveEvidenceProps) {
  const [open, setOpen] = useState<InspectKind>(null);
  const [marked, setMarked] = useState(false);
  const [leafletSeen, setLeafletSeen] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = () => {
    if (open === 'leaflet' && collectOnLeafletClose && leafletSeen) {
      onCollectPresentation();
    }
    setOpen(null);
    lastFocus.current?.focus();
  };

  const openKind = (kind: Exclude<InspectKind, null>) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    if (kind === 'leaflet') setLeafletSeen(true);
    setOpen(kind);
  };

  return (
    <>
      <div className="comic-objects">
        <button type="button" className="comic-object" onClick={() => openKind('phone')}>
          <strong>Телефон</strong>
          <span>Сообщение с предложением</span>
        </button>
        <button type="button" className="comic-object" onClick={() => openKind('leaflet')}>
          <strong>Листовка</strong>
          <span>План «революционного театра»</span>
        </button>
      </div>

      {open === 'phone' && (
        <InspectDialog title="Сообщение Карабаса" onClose={close}>
          <p className="comic-phone-msg">{phoneText}</p>
        </InspectDialog>
      )}

      {open === 'leaflet' && (
        <InspectDialog title="Листовка «Золотая сцена»" onClose={close}>
          {slides.map((slide) => (
            <article key={slide.title} className="comic-leaflet-page">
              <h3>{slide.title.replace(/^[^\p{L}\p{N}]+/u, '')}</h3>
              <p className="whitespace-pre-line">{slide.content}</p>
              {slide.redFlags && (
                <ul className="comic-leaflet-flags">
                  {slide.redFlags.map((flag) => <li key={flag}>{flag}</li>)}
                </ul>
              )}
            </article>
          ))}

          <div className="comic-contradiction" data-marked={marked}>
            <p>Слова «пять монет станут пятьюдесятью за месяц» рядом с пунктом «только сегодня».</p>
            <button
              type="button"
              className="comic-text-btn"
              onClick={() => setMarked(true)}
            >
              {marked ? 'Противоречие отмечено' : 'Отметить противоречие'}
            </button>
          </div>

          {redFlags && redFlags.length > 0 && (
            <div>
              <p className="font-semibold mt-4 mb-2">На что ещё посмотреть</p>
              <ul className="space-y-2">
                {redFlags.map((flag) => (
                  <li key={flag.title}>
                    <button type="button" className="comic-object" onClick={() => onRedFlag(flag)}>
                      {flag.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </InspectDialog>
      )}
    </>
  );
}

function InspectDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((node) => !node.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[lastIndex(focusable)];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="comic-inspect">
      <div className="comic-inspect-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="comic-inspect-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{title}</h2>
        <button
          ref={closeRef}
          type="button"
          className="comic-inspect-close"
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function lastIndex<T>(items: T[]): number {
  return items.length - 1;
}
