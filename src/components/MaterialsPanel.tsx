import { useEffect, useMemo, useState } from 'react';
import { controlQuestions, educationalMaterials, redFlags } from '../data/gameData';
import { useGameStore } from '../store/gameStore';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { Modal } from './ui/Modal';

type PanelView = 'menu' | 'materials' | 'questions' | 'flags';

export function MaterialsPanel() {
  const { showMaterialsPanel, toggleMaterialsPanel } = useGameStore();
  const [view, setView] = useState<PanelView>('menu');
  const [query, setQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(0);

  const material = educationalMaterials[selectedMaterial];

  useEffect(() => {
    if (!showMaterialsPanel || view !== 'materials') return;
    sessionAnalytics.startMaterialView(material.id);
    return () => {
      sessionAnalytics.endMaterialView(material.id, material.title);
    };
  }, [showMaterialsPanel, view, material.id, material.title]);

  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return material.sections;
    return material.sections.filter((section) => (
      section.name.toLowerCase().includes(needle) || section.content.toLowerCase().includes(needle)
    ));
  }, [material, query]);

  if (!showMaterialsPanel) {
    return (
      <button
        type="button"
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 btn-icon bg-secondary/90"
        onClick={toggleMaterialsPanel}
        aria-label="Открыть справочник"
      >
        ?
      </button>
    );
  }

  return (
    <Modal title="Справочник" onClose={toggleMaterialsPanel} wide>
      {view === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button type="button" className="choice-card flex-col items-start" onClick={() => setView('materials')}>
            <strong>Темы</strong>
            <span className="text-sm text-white/75">Короткие карточки вместо одного полотна</span>
          </button>
          <button type="button" className="choice-card flex-col items-start" onClick={() => setView('questions')}>
            <strong>Контрольные вопросы</strong>
            <span className="text-sm text-white/75">10 вопросов Золотого Детектора</span>
          </button>
          <button type="button" className="choice-card flex-col items-start" onClick={() => setView('flags')}>
            <strong>Признаки риска</strong>
            <span className="text-sm text-white/75">Что проверять в предложении</span>
          </button>
        </div>
      )}

      {view !== 'menu' && (
        <button type="button" className="btn mb-4" onClick={() => setView('menu')}>Назад к разделам</button>
      )}

      {view === 'materials' && (
        <div>
          <label className="block mb-4">
            <span className="sr-only">Поиск по справочнику</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти тему"
              className="w-full min-h-11 px-4 rounded-xl bg-white/10 border-2 border-white/30"
            />
          </label>
          <nav className="flex flex-wrap gap-2 mb-5" aria-label="Темы справочника">
            {educationalMaterials.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="btn text-sm"
                data-state={selectedMaterial === index ? 'selected' : 'default'}
                onClick={() => setSelectedMaterial(index)}
              >
                {item.title.replace(/^📖\s*/, '')}
              </button>
            ))}
          </nav>
          <h3 className="text-2xl font-bold mb-4">{material.title.replace(/^📖\s*/, '')}</h3>
          <div className="space-y-4">
            {filteredSections.map((section) => (
              <article key={section.name} className="p-4 bg-white/10 rounded-xl">
                <h4 className="font-bold mb-2">{section.name}</h4>
                <p className="leading-relaxed whitespace-pre-line">{section.content}</p>
              </article>
            ))}
            {filteredSections.length === 0 && <p>Ничего не найдено. Попробуй другое слово.</p>}
          </div>
        </div>
      )}

      {view === 'questions' && (
        <ol className="space-y-3 list-decimal pl-5">
          {controlQuestions.map((question) => <li key={question}>{question}</li>)}
        </ol>
      )}

      {view === 'flags' && (
        <div className="space-y-4">
          {redFlags.map((flag) => (
            <article key={flag.name} className="p-4 bg-danger/10 rounded-xl">
              <h4 className="font-bold mb-2">{flag.name}</h4>
              <ul className="flex flex-wrap gap-2">
                {flag.examples.map((example) => (
                  <li key={example} className="px-3 py-2 bg-white/10 rounded-lg text-sm">{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}
