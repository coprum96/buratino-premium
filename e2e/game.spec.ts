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
  if (await skip.isVisible()) {
    await skip.click();
  }
}

test('restores progress after reload in the middle of a chapter', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Продолжить главу' }).first().click();
  await expect(page.getByRole('heading', { name: 'Пять золотых монет' })).toBeVisible();
  await revealText(page);
  await page.getByRole('button', { name: /Да! Я готов учиться/ }).click();
  await page.getByRole('button', { name: 'Далее' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Сверчок Джимини' })).toBeVisible();
});

test('wrong story choice shows feedback before continuing', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Продолжить главу' }).first().click();
  await revealText(page);
  await page.getByRole('button', { name: /Может, сначала потрачу/ }).click();
  await expect(page.getByRole('heading', { name: 'Что это значит' })).toBeVisible();
  await expect(page.getByText(/слабее защищает деньги|Этот выбор/)).toBeVisible();
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
  await page.getByLabel('Сумма, ₽').fill('10000');
  await page.getByLabel('Срок, месяцы').fill('12');
  await expect(page.getByText('Сумма долга', { exact: true })).toBeVisible();
  await expect(page.getByText('Переплата', { exact: true })).toBeVisible();
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

test('keyboard-only can open the handbook', async ({ page }) => {
  await startGame(page);
  const handbook = page.getByRole('button', { name: 'Открыть справочник' });
  await handbook.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Справочник' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Справочник' })).toHaveCount(0);
});
