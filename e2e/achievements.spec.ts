import { expect, test } from '@playwright/test';

async function seedChapter(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 5,
        wisdom: 10,
        currentLevel: 0,
        currentDialogue: 0,
        completedChapters: [],
        completedActivities: [],
        accessStatus: 'promo',
        phase: 'dialogue',
        hasSeenOnboarding: true,
        participantId: 'p_ach',
        chapterQuizScores: {},
        postTestScore: 0,
        storyChoices: [],
        finaleDecision: null,
        achievements: [],
        achievementUnlocks: {},
        redFlagOpens: 0,
        finePrintOpens: 0,
        legitimateCorrect: 0,
        calibratedCorrect: 0,
        pendingLevel: null,
      },
      version: 2,
    }));
  });
  await page.reload();
}

test('achievement unlocks once, persists, and closes from CTA or Escape', async ({ page }) => {
  await seedChapter(page);
  const skip = page.getByRole('button', { name: 'Показать весь текст' });
  if (await skip.isVisible() && await skip.isEnabled()) {
    await skip.click({ timeout: 1500 }).catch(() => undefined);
  }
  await expect(page.getByText('Что ты сделаешь?')).toBeVisible();
  await page.getByRole('button', { name: 'Импульсивные траты без плана' }).click();
  await page.getByRole('button', { name: 'Закрыть окно' }).click();
  await page.getByRole('button', { name: 'Отсутствие защиты и обучения' }).click();
  await page.getByRole('button', { name: 'Закрыть окно' }).click();
  await page.getByRole('button', { name: /Выяснить, как их не отдать/ }).click();
  await page.getByRole('button', { name: 'Далее' }).click();
  if (await skip.isVisible() && await skip.isEnabled()) {
    await skip.click({ timeout: 1500 }).catch(() => undefined);
  }
  await expect(page.getByText('Что ты сделаешь?')).toBeVisible();
  await page.getByRole('button', { name: 'Игнорирование телесных сигналов' }).click();
  const dialog = page.getByTestId('achievement-unlock');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Первый красный флаг' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeEnabled({ timeout: 5000 });
  await page.getByRole('button', { name: 'Продолжить' }).click();
  await expect(dialog).toHaveCount(0);

  await page.reload();
  await page.getByRole('button', { name: /Открыть галерею достижений/ }).click();
  await expect(page.getByRole('dialog', { name: 'Галерея достижений' })).toBeVisible();
  await expect(page.getByText('Первый красный флаг')).toBeVisible();
  await expect(page.getByText('Ещё закрыто')).toHaveCount(7);

  await page.keyboard.press('Escape');
  await page.goto('/?demo=badge');
  await expect(page.getByTestId('achievement-unlock')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('achievement-unlock')).toHaveCount(0);
});

test('reduced-motion skips particles and 3D tilt', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?demo=badge');
  const dialog = page.getByTestId('achievement-unlock');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-particles', 'idle');
  await expect(page.getByTestId('badge-3d').locator('xpath=..')).toHaveAttribute('data-tilt-disabled', 'true');
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeEnabled();
});

const viewports = [320, 375, 768, 1024, 1440];

for (const width of viewports) {
  test(`unlock screen fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/?demo=badge');
    const dialog = page.getByTestId('achievement-unlock');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeLessThanOrEqual(width);
    expect(box!.x).toBeGreaterThanOrEqual(-1);
  });
}
