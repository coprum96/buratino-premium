const EMOTION_MAP: Record<string, string> = {
  sneaky: 'suspicious',
  aggressive: 'angry',
  teaching: 'thinking',
  wise: 'neutral',
  kind: 'friendly',
  happy: 'friendly',
  sad: 'pressured',
  worried: 'pressured',
  proud: 'friendly',
  suspicious: 'suspicious',
  persuasive: 'friendly',
  angry: 'angry',
  impatient: 'pressured',
  surprised: 'surprised',
  thinking: 'thinking',
  pressured: 'pressured',
  friendly: 'friendly',
  neutral: 'neutral',
};

export function comicEmotion(raw?: string): string {
  if (!raw) return 'neutral';
  return EMOTION_MAP[raw] ?? 'neutral';
}
