import { expect, test } from '@playwright/test';

test.describe('signQA learner journey', () => {
  test('translates a phrase from the practice library', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Sign language').selectOption('BSL');
    await page.getByLabel('Phrase').selectOption('How are you?');
    await page.getByRole('button', { name: /show translation/i }).click();

    const translation = page.getByTestId('translation-result');
    await expect(translation).toBeVisible();
    await expect(translation).toContainText('How are you?');
    await expect(translation).toContainText('Both hands open, palms in');
    await expect(translation).toContainText('intermediate');
  });
});
