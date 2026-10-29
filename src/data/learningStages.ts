import { TOTAL_CHAPTERS, TOTAL_LEARNING_STAGES } from '../lib/versions';

export interface LearningStage {
  id: string;
  chapterId: number;
  kind: 'story' | 'quiz';
  label: string;
}

export interface ChapterMeta {
  id: number;
  title: string;
  goal: string;
  durationMin: number;
}

/**
 * 14 учебных этапов: сюжет и проверка глав 1–7.
 * Глава 8 и финальный тест считаются итогом, не учебным этапом.
 */
export const LEARNING_STAGES: LearningStage[] = [
  { id: 'ch0-story', chapterId: 0, kind: 'story', label: 'Глава 1: сюжет' },
  { id: 'ch0-quiz', chapterId: 0, kind: 'quiz', label: 'Глава 1: проверка' },
  { id: 'ch1-story', chapterId: 1, kind: 'story', label: 'Глава 2: сюжет' },
  { id: 'ch1-quiz', chapterId: 1, kind: 'quiz', label: 'Глава 2: проверка' },
  { id: 'ch2-story', chapterId: 2, kind: 'story', label: 'Глава 3: сюжет' },
  { id: 'ch2-quiz', chapterId: 2, kind: 'quiz', label: 'Глава 3: проверка' },
  { id: 'ch3-story', chapterId: 3, kind: 'story', label: 'Глава 4: сюжет' },
  { id: 'ch3-quiz', chapterId: 3, kind: 'quiz', label: 'Глава 4: проверка' },
  { id: 'ch4-story', chapterId: 4, kind: 'story', label: 'Глава 5: сюжет' },
  { id: 'ch4-quiz', chapterId: 4, kind: 'quiz', label: 'Глава 5: проверка' },
  { id: 'ch5-story', chapterId: 5, kind: 'story', label: 'Глава 6: сюжет' },
  { id: 'ch5-quiz', chapterId: 5, kind: 'quiz', label: 'Глава 6: проверка' },
  { id: 'ch6-story', chapterId: 6, kind: 'story', label: 'Глава 7: сюжет' },
  { id: 'ch6-quiz', chapterId: 6, kind: 'quiz', label: 'Глава 7: проверка' },
];

export const CHAPTER_META: ChapterMeta[] = [
  { id: 0, title: 'Пять золотых монет', goal: 'Понять цель игры и зачем нужна пауза перед денежным решением.', durationMin: 7 },
  { id: 1, title: 'Карабас и инвестиционное предложение', goal: 'Найти признаки давления и нереалистичной доходности.', durationMin: 10 },
  { id: 2, title: 'Расчёт реальности', goal: 'Пересчитать обещание в понятные цифры и сравнить с обычными инструментами.', durationMin: 9 },
  { id: 3, title: 'Три корзины', goal: 'Разделить деньги по задачам и увидеть, как комиссии съедают сумму.', durationMin: 10 },
  { id: 4, title: 'Сигналы тревоги', goal: 'Использовать дискомфорт как повод остановиться и проверить факты.', durationMin: 8 },
  { id: 5, title: 'Проверка контрагента', goal: 'Пройти чек-лист: реестры, сайт, реквизиты, договор и недостаток данных.', durationMin: 12 },
  { id: 6, title: 'Документы и контракты', goal: 'Прочитать условия и отличить риск легального продукта от скрытой ловушки.', durationMin: 10 },
  { id: 7, title: 'Финальное испытание', goal: 'Принять решение по новому предложению и увидеть его последствия.', durationMin: 12 },
];

export const TOTAL_GAME_DURATION_MIN = CHAPTER_META.reduce((sum, chapter) => sum + chapter.durationMin, 0);

export function stageIdFor(chapterId: number, kind: 'story' | 'quiz'): string {
  return `ch${chapterId}-${kind}`;
}

export function assertStageCounts(): void {
  if (LEARNING_STAGES.length !== TOTAL_LEARNING_STAGES) {
    throw new Error(`Expected ${TOTAL_LEARNING_STAGES} learning stages`);
  }
  if (CHAPTER_META.length !== TOTAL_CHAPTERS) {
    throw new Error(`Expected ${TOTAL_CHAPTERS} chapters`);
  }
}
