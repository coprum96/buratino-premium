let muted = false;
let ctx: AudioContext | null = null;

export function setSoundMuted(next: boolean) {
  muted = next;
}

export function isSoundMuted() {
  return muted;
}

function context() {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  return ctx;
}

export function playCue(kind: 'evidence' | 'coins' | 'achievement' | 'ending') {
  if (muted || typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const audio = context();
  if (!audio) return;
  const now = audio.currentTime;
  const freqs = {
    evidence: [392, 523],
    coins: [330, 262],
    achievement: [523, 659, 784],
    ending: [392, 494, 587],
  }[kind];

  freqs.forEach((freq, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02 + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + index * 0.1);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now + index * 0.07);
    osc.stop(now + 0.28 + index * 0.1);
  });
}
