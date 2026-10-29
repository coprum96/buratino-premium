export type EvidenceReliability = 'weak' | 'medium' | 'strong';
export type EvidenceKind = 'person' | 'company' | 'document' | 'clue';
export type EvidenceZone = 'people' | 'companies' | 'sites' | 'documents' | 'payments' | 'events';
export type EvidenceLinkKind = 'confirmed' | 'hypothesis' | 'contradiction';

export const EVIDENCE_ZONES: { id: EvidenceZone; label: string }[] = [
  { id: 'people', label: 'Персонажи' },
  { id: 'companies', label: 'Компании' },
  { id: 'sites', label: 'Сайты и контакты' },
  { id: 'documents', label: 'Документы' },
  { id: 'payments', label: 'Платежи' },
  { id: 'events', label: 'События' },
];

export interface EvidenceDefinition {
  id: string;
  title: string;
  kind: EvidenceKind;
  zone: EvidenceZone;
  chapter: number;
  unlockHint: string;
  source: string;
  whyItMatters: string;
  reliability: EvidenceReliability;
  confirms: string;
  doesNotProve: string;
  links: string[];
}

export const EVIDENCE_CATALOG: EvidenceDefinition[] = [
  {
    id: 'promised-yield',
    title: 'Обещание 900% за месяц',
    kind: 'clue',
    zone: 'events',
    chapter: 2,
    unlockHint: 'Запиши цифру, которую называют вслух.',
    source: 'Презентация Карабаса',
    whyItMatters: 'Такая цифра не сравнивается с вкладом. Это повод считать и проверять механизм, а не верить слайду.',
    reliability: 'strong',
    confirms: 'Предложение использует нереалистичную доходность как крючок.',
    doesNotProve: 'Само число ещё не юридическое доказательство мошенничества.',
    links: ['karabas', 'golden-stage'],
  },
  {
    id: 'fake-urgency',
    title: '«Только сегодня»',
    kind: 'clue',
    zone: 'events',
    chapter: 2,
    unlockHint: 'Обрати внимание, можно ли подождать до завтра.',
    source: 'Разговор с Карабасом',
    whyItMatters: 'Искусственная срочность отключает проверку. Настоящая возможность обычно переживает ночь.',
    reliability: 'medium',
    confirms: 'Давят, чтобы не дали времени сверить факты.',
    doesNotProve: 'Срочность бывает и у легальной акции. Нужны документы.',
    links: ['karabas'],
  },
  {
    id: 'swapped-domain',
    title: 'Подменённый домен',
    kind: 'clue',
    zone: 'sites',
    chapter: 3,
    unlockHint: 'Сравни два адреса, не красивую вывеску.',
    source: 'Сравнение сайтов',
    whyItMatters: 'Одна буква или дефис меняет владельца сайта. Деньги уходят не туда.',
    reliability: 'strong',
    confirms: 'Адрес не совпадает с заявленным брендом «Золотая сцена».',
    doesNotProve: 'Поддельный сайт не доказывает, что одноимённый театр не существует.',
    links: ['golden-stage', 'karabas'],
  },
  {
    id: 'hidden-fee',
    title: 'Скрытая комиссия',
    kind: 'clue',
    zone: 'payments',
    chapter: 4,
    unlockHint: 'Посчитай платежи, не процент на слайде.',
    source: 'Калькулятор условий',
    whyItMatters: 'Красивый процент ничего не значит, пока не посчитаны платежи, lock-up и вывод.',
    reliability: 'strong',
    confirms: 'После комиссий «доход» может стать минусом.',
    doesNotProve: 'Комиссия сама по себе бывает у легального продукта.',
    links: ['contract'],
  },
  {
    id: 'personal-card',
    title: 'Перевод на карту физлица',
    kind: 'clue',
    zone: 'payments',
    chapter: 6,
    unlockHint: 'Сверь, на чей счёт просят перевод.',
    source: 'Проверка реквизитов',
    whyItMatters: 'Компания с лицензией принимает деньги на свой счёт, а не на карту «Ивана».',
    reliability: 'strong',
    confirms: 'Реквизиты не выглядят как расчётный счёт организации.',
    doesNotProve: 'Ошибка в платёжке возможна. Нужно сверка с официальным источником.',
    links: ['fox-club', 'karabas'],
  },
  {
    id: 'license-gap',
    title: 'Лицензия не на эту услугу',
    kind: 'document',
    zone: 'documents',
    chapter: 6,
    unlockHint: 'Проверь, на какую услугу выдан документ.',
    source: 'Реестр и список ЦБ',
    whyItMatters: 'Компания может быть в реестре и всё равно не иметь права на предлагаемую услугу.',
    reliability: 'strong',
    confirms: 'Документ не покрывает «инвестиции в театр».',
    doesNotProve: 'Отсутствие нужной лицензии — красный флаг, не приговор суда.',
    links: ['golden-stage', 'uncle-bank'],
  },
  {
    id: 'lockup-clause',
    title: 'Lock-up в мелком шрифте',
    kind: 'document',
    zone: 'documents',
    chapter: 7,
    unlockHint: 'Найди в бумаге пункт про вывод денег.',
    source: 'Договор',
    whyItMatters: 'Вывод «в любой момент» часто запрещён скрытым пунктом.',
    reliability: 'strong',
    confirms: 'В договоре есть ограничение вывода, о котором не сказали вслух.',
    doesNotProve: 'Lock-up бывает и у легальных фондов. Смотри, скрыли ли его.',
    links: ['contract', 'hidden-fee'],
  },
  {
    id: 'shared-phone',
    title: 'Один телефон на две фирмы',
    kind: 'clue',
    zone: 'sites',
    chapter: 8,
    unlockHint: 'Сравни контакты двух разных вывесок.',
    source: 'Сравнение карточек компаний',
    whyItMatters: 'Разные вывески с одним контактом часто значат одну схему.',
    reliability: 'medium',
    confirms: '«Золотая сцена» и клуб Лисы пользуются одним номером.',
    doesNotProve: 'Общий колл-центр бывает у группы компаний. Нужна ещё связь.',
    links: ['golden-stage', 'fox-club', 'karabas'],
  },
  {
    id: 'victim-note',
    title: 'Записка пострадавшего',
    kind: 'document',
    zone: 'documents',
    chapter: 8,
    unlockHint: 'Сохрани переписку с последним предложением.',
    source: 'Финальное предложение',
    whyItMatters: 'Чужая история не доказательство в суде, но показывает повторяющийся сценарий.',
    reliability: 'weak',
    confirms: 'Тот же домен, та же срочность, тот же перевод «другу».',
    doesNotProve: 'Один рассказ можно подделать. Сверяй с своими уликами.',
    links: ['fox-club', 'swapped-domain'],
  },
  {
    id: 'karabas',
    title: 'Карабас Барабас',
    kind: 'person',
    zone: 'people',
    chapter: 2,
    unlockHint: 'Появится, когда кто-то предложит вложить монеты.',
    source: 'Глава 2',
    whyItMatters: 'Он запускает офер. Дальше схема может идти через других людей.',
    reliability: 'medium',
    confirms: 'Карабас предлагает вложить монеты в «революционный театр».',
    doesNotProve: 'Его вина за все следующие конторы ещё не собрана.',
    links: ['golden-stage'],
  },
  {
    id: 'golden-stage',
    title: '«Золотая сцена»',
    kind: 'company',
    zone: 'companies',
    chapter: 2,
    unlockHint: 'Вывеска всплывёт из презентации или сайта.',
    source: 'Презентация и сайт',
    whyItMatters: 'Вывеска, с которой начинается цепочка платежей.',
    reliability: 'medium',
    confirms: 'Под этим именем просят деньги и показывают слайды.',
    doesNotProve: 'Название не равно лицензии и не равно одному человеку.',
    links: ['karabas', 'swapped-domain'],
  },
  {
    id: 'fox-club',
    title: 'Клуб «Все уже внутри»',
    kind: 'company',
    zone: 'companies',
    chapter: 8,
    unlockHint: 'Новая вывеска появится ближе к финалу.',
    source: 'Финал, Лиса',
    whyItMatters: 'Новая вывеска той же срочности и тех же реквизитов.',
    reliability: 'medium',
    confirms: 'Лиса продаёт «другой» проект с теми же приёмами.',
    doesNotProve: 'Пока нет связи улик, это только похожий стиль.',
    links: ['shared-phone', 'personal-card'],
  },
  {
    id: 'uncle-bank',
    title: 'Вклад Дяди',
    kind: 'company',
    zone: 'companies',
    chapter: 6,
    unlockHint: 'Сверь соседнее предложение отдельно.',
    source: 'Проверка контрагента',
    whyItMatters: 'Есть легальные продукты рядом со схемой. Их нельзя автоматически назвать обманом.',
    reliability: 'medium',
    confirms: 'Есть предложение с проверяемыми реквизитами банка.',
    doesNotProve: 'Агрессивная продажа не делает вклад мошенничеством.',
    links: ['license-gap'],
  },
  {
    id: 'contract',
    title: 'Договор на «пай»',
    kind: 'document',
    zone: 'documents',
    chapter: 4,
    unlockHint: 'Открой бумагу до подписи.',
    source: 'Микроскоп',
    whyItMatters: 'Слова вслух и пункты на бумаге часто расходятся.',
    reliability: 'strong',
    confirms: 'Есть документ, который можно разобрать по условиям.',
    doesNotProve: 'Подпись ещё не поставлена — решение за игроком.',
    links: ['lockup-clause', 'hidden-fee'],
  },
];

export function getEvidence(id: string): EvidenceDefinition | undefined {
  return EVIDENCE_CATALOG.find((item) => item.id === id);
}

export function evidenceLinkKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/** Undirected typed links. Anything else in `links` is confirmed once both ends are found. */
export const EVIDENCE_LINK_KIND: Record<string, EvidenceLinkKind> = {
  [evidenceLinkKey('golden-stage', 'swapped-domain')]: 'contradiction',
  [evidenceLinkKey('golden-stage', 'license-gap')]: 'contradiction',
  [evidenceLinkKey('karabas', 'personal-card')]: 'hypothesis',
  [evidenceLinkKey('karabas', 'shared-phone')]: 'hypothesis',
  [evidenceLinkKey('karabas', 'swapped-domain')]: 'hypothesis',
  [evidenceLinkKey('hidden-fee', 'lockup-clause')]: 'hypothesis',
  [evidenceLinkKey('swapped-domain', 'victim-note')]: 'hypothesis',
  [evidenceLinkKey('golden-stage', 'promised-yield')]: 'hypothesis',
};

export const STRONG_EVIDENCE_IDS = EVIDENCE_CATALOG
  .filter((item) => item.reliability === 'strong' && (item.kind === 'clue' || item.kind === 'document'))
  .map((item) => item.id);
