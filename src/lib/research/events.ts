import { researchConfig } from '../../config/research';
import type { AssessmentWave } from '../../config/research';
import {
  GAME_VERSION,
  ITEM_BANK_VERSION,
  RESEARCH_CONSENT_KEY,
  RESEARCH_EVENTS_KEY,
  SCENARIO_VERSION,
} from '../versions';

export type ResearchEventType =
  | 'session_start'
  | 'session_end'
  | 'choice'
  | 'quiz_answer'
  | 'assessment_answer'
  | 'chapter_complete'
  | 'calculator_result'
  | 'achievement_unlock'
  | 'error';

export interface ResearchEvent {
  participantId: string;
  timestamp: string;
  gameVersion: string;
  scenarioVersion: string;
  itemBankVersion: string;
  type: ResearchEventType;
  chapterId?: number;
  activityId?: string;
  itemId?: string;
  shownOptions?: string[];
  selectedAnswer?: string | number;
  isCorrect?: boolean;
  responseMs?: number;
  answerChanges?: number;
  confidence?: number;
  choseIndependentCheck?: boolean;
  score?: number;
  completed?: boolean;
  technicalError?: string;
  wave?: AssessmentWave;
}

function canStore(): boolean {
  return typeof localStorage !== 'undefined' && researchConfig.enabled && hasResearchConsent();
}

export function hasResearchConsent(): boolean {
  if (!researchConfig.enabled) return false;
  if (!researchConfig.requireConsent) return true;
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(RESEARCH_CONSENT_KEY) === 'granted';
}

export function setResearchConsent(granted: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (granted) {
    localStorage.setItem(RESEARCH_CONSENT_KEY, 'granted');
  } else {
    localStorage.removeItem(RESEARCH_CONSENT_KEY);
  }
}

export function readResearchEvents(): ResearchEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RESEARCH_EVENTS_KEY);
    return raw ? JSON.parse(raw) as ResearchEvent[] : [];
  } catch {
    return [];
  }
}

export function recordResearchEvent(
  participantId: string,
  type: ResearchEventType,
  payload: Partial<ResearchEvent> = {}
): void {
  if (!canStore()) return;

  const event: ResearchEvent = {
    participantId,
    timestamp: new Date().toISOString(),
    gameVersion: GAME_VERSION,
    scenarioVersion: SCENARIO_VERSION,
    itemBankVersion: ITEM_BANK_VERSION,
    type,
    ...payload,
  };

  const events = readResearchEvents();
  events.push(event);
  localStorage.setItem(RESEARCH_EVENTS_KEY, JSON.stringify(events));
}

export function exportResearchEvents(): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    gameVersion: GAME_VERSION,
    scenarioVersion: SCENARIO_VERSION,
    itemBankVersion: ITEM_BANK_VERSION,
    minimization: [
      'Нет ФИО, email, телефона и адреса.',
      'Есть только случайный participant ID.',
      'События не отправляются, пока не включены режим исследования и согласие.',
    ],
    events: readResearchEvents(),
  }, null, 2);
}

export function clearResearchEvents(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(RESEARCH_EVENTS_KEY);
}
