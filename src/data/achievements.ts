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
    description: 'Ты открыл несколько карточек признаков риска, а не одну случайную.',
    condition: 'Открыть три карточки признаков риска',
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
    id: 'trail-finder',
    title: 'Следопыт',
    description: 'Ты нашёл подменённый домен, а не купился на вывеску.',
    condition: 'Найти отличие в адресе сайта',
    asset: '/img/item_tablet_karabas_presentation.png',
    rarity: 'rare',
    reward: 'Одна буква меняет получателя денег',
  },
  {
    id: 'count-myself',
    title: 'Считаю сам',
    description: 'Ты посчитал комиссию и увидел, что обещание не сходится.',
    condition: 'Завершить корректный расчёт калькулятора',
    asset: '/img/item_gold_coins_5.png',
    rarity: 'rare',
    reward: 'Итог важнее красивого процента',
  },
  {
    id: 'not-all-gold',
    title: 'Не всё золото',
    description: 'Ты отказался от яркого предложения после проверки.',
    condition: 'Сделать независимую проверку и затем безопасный отказ',
    asset: '/img/character_buratino_cautious.png',
    rarity: 'legendary',
    reward: 'Красивая сцена не равна безопасной сделке',
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
];

export function getAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((item) => item.id === id);
}
