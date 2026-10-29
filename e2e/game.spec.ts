import { expect, test, type Page } from '@playwright/test';

async function startGame(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Начать приключение|Продолжить/ }).first().click();
  if (await page.getByRole('heading', { name: 'Как устроена игра' }).isVisible()) {
    await page.getByRole('button', { name: 'Понятно, к карте' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Карта приключений' })).toBeVisible();
}

async function revealText(page: Page) {
  const skip = page.getByRole('button', { name: 'Показать весь текст' });
  if (await skip.isVisible() && await skip.isEnabled()) {
    await skip.click({ timeout: 1500 }).catch(() => undefined);
  }
  await expect(page.getByText('Что ты сделаешь?')).toBeVisible();
}

test('restores progress after reload in the middle of a chapter', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Начать главу' }).first().click();
  await expect(page.getByRole('heading', { name: 'Пять золотых монет' })).toBeVisible();
  await revealText(page);
  await page.getByRole('button', { name: /Выяснить, как их не отдать/ }).click();
  await page.getByRole('button', { name: 'Далее' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Сверчок Джимини' })).toBeVisible();
});

test('wrong story choice shows feedback before continuing', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Начать главу' }).first().click();
  await revealText(page);
  await page.getByRole('button', { name: /Потратить одну монету сразу/ }).click();
  await expect(page.getByRole('heading', { name: 'Что произошло' })).toBeVisible();
  await expect(page.getByText(/слабее защищает деньги|Этот выбор/).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Что это значит' })).toBeVisible();
  await expect(page.getByText(/Пока не доказывает/)).toBeVisible();
  await expect(page.getByText('Репутация: -3')).toHaveCount(0);
  await expect(page.getByText(/плохое решение/)).toHaveCount(0);
});

test('map never shows more than 8 completed chapters', async ({ page }) => {
  await startGame(page);
  await expect(page.getByText(/Пройдено глав: 0 из 8/)).toBeVisible();
});

test('calculator rejects negative values and explains a loan', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 5,
        wisdom: 20,
        currentLevel: 3,
        currentDialogue: 3,
        completedChapters: [0, 1, 2],
        completedActivities: ['ch0-story', 'ch0-quiz', 'ch1-story', 'ch1-quiz', 'ch2-story', 'ch2-quiz'],
        accessStatus: 'promo',
        phase: 'dialogue',
        hasSeenOnboarding: true,
        participantId: 'p_test',
        chapterQuizScores: {},
        postTestScore: 0,
        storyChoices: [],
        finaleDecision: null,
        achievements: [],
        pendingLevel: null,
      },
      version: 2,
    }));
  });
  await page.reload();
  await revealText(page);
  await expect(page.getByRole('heading', { name: 'Калькулятор условий' })).toBeVisible();
  await page.getByLabel('Сумма, ₽').fill('-1000');
  await page.getByLabel('Срок, месяцы').fill('-3');
  await expect(page.getByText('Сумма должна быть больше нуля.')).toBeVisible();
  await expect(page.getByText(/Срок — от 1 до 60/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Посчитать условия и идти дальше/ })).toBeDisabled();
  await page.getByLabel('Сумма, ₽').fill('');
  await page.getByLabel('Сумма, ₽').fill('не число');
  await expect(page.getByText('Введи сумму числом больше нуля.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Посчитать условия и идти дальше/ })).toBeDisabled();
  await page.getByLabel('Сумма, ₽').fill('10000');
  await page.getByLabel('Срок, месяцы').fill('12');
  await expect(page.getByText('Сумма долга', { exact: true })).toBeVisible();
  await expect(page.getByText('Переплата', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Посчитать условия и идти дальше/ })).toBeEnabled();
});

test('map keeps later chapters locked until the first unfinished one is done', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 4,
        wisdom: 20,
        currentLevel: 5,
        currentDialogue: 0,
        completedChapters: [0, 1, 2, 3],
        completedActivities: [],
        accessStatus: 'promo',
        phase: 'chapterMap',
        hasSeenOnboarding: true,
        participantId: 'p_test',
        chapterQuizScores: {},
        postTestScore: 0,
        storyChoices: [],
        finaleDecision: null,
        achievements: [],
        pendingLevel: null,
      },
      version: 2,
    }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Карта приключений' })).toBeVisible();
  const chapter5 = page.locator('article').filter({ hasText: 'Глава 5' });
  const chapter6 = page.locator('article').filter({ hasText: 'Глава 6' });
  await expect(chapter5.getByRole('button', { name: 'Начать главу' })).toBeVisible();
  await expect(chapter6.getByRole('button')).toHaveCount(0);
  await expect(chapter6.getByText('Сначала заверши предыдущую главу.')).toBeVisible();
});

test('four finished chapters restore clues and continue the chapter 5 quiz', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 4,
        wisdom: 35,
        currentLevel: 4,
        currentDialogue: 3,
        completedChapters: [0, 1, 2, 3],
        completedActivities: ['ch0-story', 'ch0-quiz', 'ch1-story', 'ch1-quiz', 'ch2-story', 'ch2-quiz', 'ch3-story', 'ch3-quiz', 'ch4-story'],
        accessStatus: 'promo',
        phase: 'quiz',
        hasSeenOnboarding: true,
        participantId: 'p_test',
        chapterQuizScores: {},
        postTestScore: 0,
        storyChoices: [],
        finaleDecision: null,
        achievementUnlocks: {
          'first-red-flag': '2024-01-01',
          'cool-head': '2024-01-01',
          'check-facts': '2024-01-01',
          'fine-print': '2024-01-01',
        },
        achievements: ['first-red-flag', 'cool-head', 'check-facts', 'fine-print'],
        pendingLevel: null,
      },
      version: 2,
    }));
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Проверка главы' })).toBeVisible();
  await page.getByRole('button', { name: 'На карту' }).click();
  const chapter5 = page.locator('article').filter({ hasText: 'Глава 5' });
  await expect(chapter5.getByRole('button', { name: 'Продолжить главу' })).toBeVisible();
  await page.getByRole('button', { name: 'Открыть дело Карабаса' }).click();
  await expect(page.getByText('0 из 14 узлов')).toHaveCount(0);
  await expect(page.getByText(/из 14 узлов/)).toBeVisible();
});

test('corrupt save offers a migration choice and does not wipe the backup', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', '{not-json');
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Игра обновилась' })).toBeVisible();
  const backup = await page.evaluate(() => localStorage.getItem('gold-detector-save-backup'));
  expect(backup).toBe('{not-json');
  await page.getByRole('button', { name: 'Начать новое расследование' }).click();
  await expect(page.getByRole('heading', { name: 'Золотой Детектор' })).toBeVisible();
  const kept = await page.evaluate(() => localStorage.getItem('gold-detector-save-backup'));
  expect(kept).toBe('{not-json');
});

test('loss ending does not claim coins are safe', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 0,
        wisdom: 40,
        currentLevel: 7,
        currentDialogue: 2,
        completedChapters: [0, 1, 2, 3, 4, 5, 6],
        completedActivities: [],
        accessStatus: 'promo',
        phase: 'dialogue',
        hasSeenOnboarding: true,
        participantId: 'p_test',
        chapterQuizScores: {},
        postTestScore: 0,
        storyChoices: [],
        finaleDecision: 'loss',
        achievements: [],
        pendingLevel: null,
      },
      version: 2,
    }));
  });
  await page.reload();
  await revealText(page);
  await expect(page.getByText(/Монеты уже ушли/)).toBeVisible();
  await expect(page.getByText(/Твои монеты в безопасности/)).toHaveCount(0);
});

test('promo code unlocks sequential full access', async ({ page }) => {
  await startGame(page);
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('gold-detector-save') || '{}');
    const state = store.state ?? {};
    state.currentLevel = 3;
    state.completedChapters = [0, 1, 2];
    state.phase = 'chapterMap';
    localStorage.setItem('gold-detector-save', JSON.stringify({ ...store, state, version: 2 }));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Открыть доступ' }).first().click();
  await page.getByLabel('Промокод').fill('buratino');
  await page.getByRole('button', { name: 'Активировать промокод' }).click();
  await expect(page.getByText(/Полный контент доступен/)).toBeVisible();
});

test('case board opens from the map and stays empty until a clue is found', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Открыть дело Карабаса' }).click();
  await expect(page.getByRole('heading', { name: 'Дело Карабаса' })).toBeVisible();
  await expect(page.getByText('0 из 14 узлов')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Персонажи' })).toBeVisible();
  await expect(page.getByText('Неизвестный узел').first()).toBeVisible();
  await expect(page.getByText('Карабас Барабас')).toHaveCount(0);
});

test('keyboard-only can open the handbook', async ({ page }) => {
  await startGame(page);
  const handbook = page.getByRole('button', { name: 'Открыть справочник' });
  await handbook.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Справочник' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Справочник' })).toHaveCount(0);
});
