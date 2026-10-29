import { EVIDENCE_CATALOG, type EvidenceDefinition } from '../data/evidence';
import type { Choice } from '../data/gameData';

export interface AppliedAftermath {
  coinsDelta: number;
  reputationDelta: number;
  overflowDelta: number;
  newEvidenceIds: string[];
}

export interface ChoiceAftermath {
  happened: string;
  signal: string;
  confirms: string;
  doesNotProve: string;
  nextStep: string;
  relation?: string;
  evidenceTitles: string[];
}

const NEXT_STEP: Record<NonNullable<Choice['consequence']>, string> = {
  loss: 'Не делать новых переводов. Сохранить чат, связаться с банком, написать в Банк России.',
  risky: 'Зафиксировать, что уже ушло. Дальше не переводить без договора и получателя.',
  safe: 'Сохранить переписку и улики. Проверка ещё может понадобиться в следующей главе.',
  pause: 'Не отвечать сегодня. Сверить источник, реквизиты и независимое слово.',
  check: 'Записать, чего не хватает: механизм, документы, получатель.',
};

const SIGNAL_BY_CONSEQUENCE: Record<NonNullable<Choice['consequence']>, string> = {
  loss: 'Деньги уже ушли до независимой проверки.',
  risky: 'Часть суммы ушла, пока не было договора и получателя.',
  safe: 'Ты не перевёл деньги под давлением.',
  pause: 'Ты остановился до перевода.',
  check: 'Ты спросил то, чего не было в слайде.',
};

const CONFIRMS_BY_CONSEQUENCE: Record<NonNullable<Choice['consequence']>, string> = {
  loss: 'Перевод из игры уже не вернуть.',
  risky: 'Часть суммы уже не у тебя.',
  safe: 'Деньги остались при тебе.',
  pause: 'Пауза состоялась. Проверка ещё не закончена.',
  check: 'Вопрос зафиксировал дыру в данных.',
};

const RELATION: Partial<Record<string, Partial<Record<NonNullable<Choice['consequence']>, string>>>> = {
  karabas: {
    risky: 'Карабас считает, что на тебя легко давить.',
    loss: 'Карабас считает, что на тебя легко давить.',
    safe: 'Карабас теряет рычаг «только сегодня».',
    pause: 'Карабас теряет рычаг «только сегодня».',
    check: 'Карабас меняет тему, когда спрашивают про получателя.',
  },
  fox_alice: {
    loss: 'Лиса исчезает из чата. Писать уже некому.',
    safe: 'Лиса уже пишет «всем остальным» — это улика, не победа.',
    pause: 'Давление осталось, пауза ещё не проверка.',
    check: 'Лиса не даёт независимый контакт.',
  },
  cat_basilio: {
    check: 'Базилио теряет удобный туман терминов.',
    risky: 'Базилио рад, что можно не говорить про получателя.',
    loss: 'Базилио рад, что можно не говорить про получателя.',
  },
};

function defaultHappened(choice: Choice): string {
  if (choice.wisdom && choice.wisdom < 0) {
    return 'Этот выбор слабее защищает деньги. Дальше разберём, какой факт стоит проверить.';
  }
  const action = [choice.text, choice.detail].filter(Boolean).join('. ');
  return action || 'Шаг записан. Дальше смотрим, каких данных не хватает.';
}

function evidenceById(id: string): EvidenceDefinition | undefined {
  return EVIDENCE_CATALOG.find((item) => item.id === id);
}

function pickSignalEvidence(ids: string[] | undefined): EvidenceDefinition | undefined {
  const items = (ids ?? []).map(evidenceById).filter((item): item is EvidenceDefinition => Boolean(item));
  return items.find((item) => item.kind === 'clue' || item.kind === 'document') ?? items[0];
}

export function buildChoiceAftermath(
  choice: Choice,
  characterId?: string,
  applied?: Pick<AppliedAftermath, 'newEvidenceIds'>
): ChoiceAftermath {
  const clue = pickSignalEvidence(choice.evidence);
  const override = choice.aftermath;
  const consequence = choice.consequence;
  const relation = override?.relation
    ?? (consequence && characterId ? RELATION[characterId]?.[consequence] : undefined);
  const newIds = applied?.newEvidenceIds ?? [];

  return {
    happened: choice.feedback || defaultHappened(choice),
    signal: override?.signal ?? clue?.whyItMatters ?? (consequence ? SIGNAL_BY_CONSEQUENCE[consequence] : (choice.detail || 'Важно, каких данных не хватает.')),
    confirms: override?.confirms ?? clue?.confirms ?? (consequence ? CONFIRMS_BY_CONSEQUENCE[consequence] : 'Этот шаг показывает, как ты действуешь под давлением.'),
    doesNotProve: override?.doesNotProve ?? clue?.doesNotProve ?? 'Один шаг не доказывает состав преступления и не закрывает расследование.',
    nextStep: override?.nextStep ?? (consequence ? NEXT_STEP[consequence] : 'Записать шаг и смотреть, каких данных не хватает.'),
    relation,
    evidenceTitles: newIds
      .map(evidenceById)
      .filter((item): item is EvidenceDefinition => Boolean(item))
      .map((item) => item.title),
  };
}

export function formatCoinDelta(delta: number): string | null {
  if (delta === 0) return null;
  const abs = Math.abs(delta);
  const noun = abs === 1 ? 'монета' : abs < 5 ? 'монеты' : 'монет';
  return delta < 0 ? `Потеряно: ${abs} ${noun}` : `Монеты: +${abs}`;
}

export function formatReputationDelta(delta: number, overflowDelta = 0): string | null {
  if (delta === 0 && overflowDelta === 0) return null;
  if (delta === 0 && overflowDelta > 0) {
    return `Репутация на максимуме, опыт сверх шкалы: +${overflowDelta}`;
  }
  return `Репутация: ${delta > 0 ? '+' : ''}${delta}`;
}
