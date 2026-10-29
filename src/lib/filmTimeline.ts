export const FILM_FPS = 30;
export const FILM_DURATION_MS = 40000;
export const FILM_WIDTH = 1920;
export const FILM_HEIGHT = 1080;

export interface FilmSceneCue {
  id: string;
  component: string;
  startMs: number;
  endMs: number;
  caption: string;
}

export const FILM_SCENES: FilmSceneCue[] = [
  { id: 'hook', component: 'HookScene', startMs: 0, endMs: 3000, caption: 'Мошеннику нужны несколько секунд. Тебе нужна одна пауза.' },
  { id: 'reveal', component: 'ProductRevealScene', startMs: 3000, endMs: 8000, caption: 'Золотой Детектор. Учебная игра о проверке денежных предложений.' },
  { id: 'detect', component: 'FraudOfferScene', startMs: 8000, endMs: 11000, caption: 'Лиса: 5 монет сегодня — 100 через месяц. Осталось 2 места.' },
  { id: 'scan', component: 'DetectorScanScene', startMs: 11000, endMs: 14000, caption: 'Срочность, сверхдоходность и давление группы — красные флаги.' },
  { id: 'verify', component: 'VerificationToolsScene', startMs: 14000, endMs: 20000, caption: 'Реестр ЦБ, лицензия, реквизиты, договор, расчёт.' },
  { id: 'decide', component: 'DecisionScene', startMs: 20000, endMs: 26000, caption: 'Небезопасный путь теряет монеты. Пауза сохраняет их.' },
  { id: 'badge', component: 'BadgeUnlockScene', startMs: 26000, endMs: 32000, caption: 'Холодная голова. Решение принято без давления.' },
  { id: 'montage', component: 'ProgressMontageScene', startMs: 32000, endMs: 37000, caption: 'Главы, договор, калькулятор, проверка и галерея достижений.' },
  { id: 'payoff', component: 'FinalPayoffScene', startMs: 37000, endMs: 40000, caption: 'Золотой Детектор. Сначала проверь. Потом решай.' },
];

export function filmDurationSeconds(): number {
  return FILM_DURATION_MS / 1000;
}

export function sceneAt(ms: number): FilmSceneCue {
  return FILM_SCENES.find((scene) => ms >= scene.startMs && ms < scene.endMs) ?? FILM_SCENES[FILM_SCENES.length - 1];
}

export function sceneOpacity(t: number, start: number, end: number, fade = 180): number {
  if (t < start || t >= end) return 0;
  const into = t - start;
  const out = end - t;
  if (into < fade) return into / fade;
  if (out < fade) return out / fade;
  return 1;
}
