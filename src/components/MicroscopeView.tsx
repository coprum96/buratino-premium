import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Modal } from './ui/Modal';

interface MicroscopeViewProps {
  title: string;
  smallPrintText: string;
  dangerousTerms?: { term: string; explanation: string }[];
  onClose: () => void;
}

export function MicroscopeView({ title, smallPrintText, dangerousTerms = [], onClose }: MicroscopeViewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);

  const chunks = useMemo(() => {
    if (dangerousTerms.length === 0) return [{ type: 'text' as const, value: smallPrintText }];
    const pattern = new RegExp(`(${dangerousTerms.map((item) => item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return smallPrintText.split(pattern).filter(Boolean).map((value) => {
      const index = dangerousTerms.findIndex((item) => item.term.toLowerCase() === value.toLowerCase());
      return index >= 0 ? { type: 'term' as const, value, index } : { type: 'text' as const, value };
    });
  }, [dangerousTerms, smallPrintText]);

  return (
    <Modal title={title} onClose={onClose} wide>
      <p className="mb-4 text-white/80">
        Выделенные условия — кнопки. Их можно открыть с клавиатуры. Lock-up, комиссия или ограничение ответственности сами по себе не доказывают мошенничество: смотри совокупность и прозрачность.
      </p>
      <button type="button" className="btn mb-4" onClick={() => setIsZoomed((value) => !value)}>
        {isZoomed ? 'Обычный размер' : 'Увеличить текст'}
      </button>
      <div className={`bg-white/5 rounded-xl p-4 mb-4 leading-relaxed ${isZoomed ? 'text-lg' : 'text-sm'}`}>
        {chunks.map((chunk, index) => (
          chunk.type === 'term' ? (
            <button
              key={`${chunk.value}-${index}`}
              type="button"
              className="mx-1 px-1 underline decoration-dotted min-h-11"
              onClick={() => {
                useGameStore.getState().noteFinePrintOpen();
                setSelectedTerm(chunk.index);
              }}
            >
              {chunk.value}
            </button>
          ) : (
            <span key={`${chunk.value}-${index}`}>{chunk.value}</span>
          )
        ))}
      </div>
      {selectedTerm !== null && dangerousTerms[selectedTerm] && (
        <div className="p-4 bg-white/10 rounded-xl" role="status">
          <p className="font-bold mb-2">{dangerousTerms[selectedTerm].term}</p>
          <p>{dangerousTerms[selectedTerm].explanation}</p>
        </div>
      )}
    </Modal>
  );
}
