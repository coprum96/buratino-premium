export type AchievementRarity = 'common' | 'rare' | 'legendary';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  condition: string;
  asset: string;
  rarity: AchievementRarity;
  reward: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-red-flag',
    title: 'Первый красный флаг',
    description: 'Ты открыл первый признак риска и не пролистал его мимо.',
    condition: 'Открыть карточку красного флага',
    asset: '/img/item_tablet_karabas_presentation.png',
    rarity: 'common',
    reward: 'Мудрость: привычка смотреть на признаки, а не на тон рекламы',
  },
  {
    id: 'cool-head',
    title: 'Холодная голова',
    description: 'Ты поставил паузу вместо решения под давлением.',
    condition: 'Выбрать паузу или независимую проверку в сюжете',
    asset: '/img/character_buratino_cautious.png',
    rarity: 'rare',
    reward: 'Решение без спешки',
  },
  {
    id: 'check-facts',
    title: 'Проверяю факты',
    description: 'Ты выбрал проверку документов и механизма дохода.',
    condition: 'Выбрать вариант с независимой проверкой',
    asset: '/img/item_detector_mirror_golden.png',
    rarity: 'rare',
    reward: 'Золотой Детектор в работе',
  },
  {
    id: 'fine-print',
    title: 'Читаю мелкий шрифт',
    description: 'Ты открыл условие договора и прочитал, что оно значит.',
    condition: 'Открыть термин в договоре',
    asset: '/img/item_letter_tortila_sealed.png',
    rarity: 'common',
    reward: 'Lock-up и комиссии больше не невидимы',
  },
  {
    id: 'not-one-basket',
    title: 'Не кладу всё в одну корзину',
    description: 'Глава про распределение денег завершена.',
    condition: 'Завершить главу «Три корзины»',
    asset: '/img/item_gold_coins_5.png',
    rarity: 'common',
    reward: 'Подушка важнее одного яркого желания',
  },
  {
    id: 'golden-detector',
    title: 'Золотой Детектор',
    description: 'Независимая проверка пройдена с высоким результатом.',
    condition: '8 и больше верных ответов в финальной проверке',
    asset: '/img/item_detector_mirror_golden.png',
    rarity: 'legendary',
    reward: 'Сертификат навыка, не автоматическая победа',
  },
  {
    id: 'no-false-alarm',
    title: 'Без ложной тревоги',
    description: 'Ты не назвал мошенничеством добросовестное предложение.',
    condition: 'Верно оценить легальный кейс в независимой проверке',
    asset: '/img/character_cricket_wise.png',
    rarity: 'rare',
    reward: 'Сложное ≠ обман',
  },
  {
    id: 'calibrated-confidence',
    title: 'Уверенность под контролем',
    description: 'Высокая уверенность совпала с верным ответом.',
    condition: 'Уверенность 4 или 5 при верном независимом ответе',
    asset: '/img/item_envelope_golden_emblem.png',
    rarity: 'rare',
    reward: 'Уверенность больше не пустая',
  },
];

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((item) => item.id === id);
}
