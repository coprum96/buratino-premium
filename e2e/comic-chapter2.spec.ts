import { expect, test } from '@playwright/test';

test('chapter 2 comic slice is playable on desktop and mobile', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gold-detector-save', JSON.stringify({
      state: {
        schemaVersion: 2,
        coins: 5,
        wisdom: 20,
        currentLevel: 1,
        currentDialogue: 0,
        completedChapters: [0],
        completedActivities: ['ch0-story', 'ch0-quiz'],
        accessStatus: 'promo',
        phase: 'dialogue',
        hasSeenOnboarding: true,
        participantId: 'p_comic',
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

  await expect(page.getByTestId('comic-scene')).toBeVisible();
  await expect(page.getByTestId('compact-hud')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Дело' })).toBeVisible();
  await page.getByRole('button', { name: /Телефон/ }).click();
  await expect(page.getByRole('dialog', { name: 'Сообщение Карабаса' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Это обман, ухожу/ }).click();
  await expect(page.getByRole('heading', { name: 'Что произошло' })).toBeVisible();
  await expect(page.getByText('Новая улика: Карабас Барабас')).toBeVisible();
  const next = page.getByRole('button', { name: 'Далее' });
  await expect(next).toBeInViewport();
});
