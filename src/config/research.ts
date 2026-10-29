export type AssessmentWave = 'immediate' | 'delayed';

export interface ResearchConfig {
  enabled: boolean;
  requireConsent: boolean;
  sendToBackend: boolean;
  allowRandomization: boolean;
  defaultWave: AssessmentWave;
}

function envFlag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export const researchConfig: ResearchConfig = {
  enabled: envFlag(import.meta.env.VITE_RESEARCH_MODE),
  requireConsent: true,
  sendToBackend: envFlag(import.meta.env.VITE_RESEARCH_SEND),
  allowRandomization: false,
  defaultWave: import.meta.env.VITE_RESEARCH_WAVE === 'delayed' ? 'delayed' : 'immediate',
};
