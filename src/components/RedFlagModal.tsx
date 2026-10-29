import { useState } from 'react';
import { Modal } from './ui/Modal';

export interface RedFlagData {
  title: string;
  description: string;
  example?: string;
  law?: string;
  statistics?: string;
  video?: string;
  tips?: string[];
}

interface RedFlagModalProps {
  flag: RedFlagData;
  onClose: () => void;
}

export function RedFlagModal({ flag, onClose }: RedFlagModalProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'example' | 'law' | 'statistics'>('description');

  return (
    <Modal title={flag.title} onClose={onClose}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" className="btn text-sm" onClick={() => setActiveTab('description')}>Объяснение</button>
        {flag.example && <button type="button" className="btn text-sm" onClick={() => setActiveTab('example')}>Пример</button>}
        {flag.law && <button type="button" className="btn text-sm" onClick={() => setActiveTab('law')}>Право</button>}
        {flag.statistics && <button type="button" className="btn text-sm" onClick={() => setActiveTab('statistics')}>Цифры</button>}
      </div>
      <div className="bg-white/5 rounded-xl p-4 min-h-[160px] leading-relaxed">
        {activeTab === 'description' && (
          <>
            <p className="mb-3">{flag.description}</p>
            {flag.tips && (
              <ul className="list-disc pl-5 space-y-1">
                {flag.tips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            )}
          </>
        )}
        {activeTab === 'example' && <p className="whitespace-pre-line">{flag.example}</p>}
        {activeTab === 'law' && <p className="whitespace-pre-line">{flag.law}</p>}
        {activeTab === 'statistics' && <p className="whitespace-pre-line">{flag.statistics}</p>}
      </div>
    </Modal>
  );
}
