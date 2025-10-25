import { expect, test } from '@playwright/test';

test.describe('signQA search journey', () => {
  test('searches, highlights, and filters knowledge base answers', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Search the knowledge base').fill('fingerspelling speed');
    await page.getByRole('button', { name: 'Search' }).click();

    const summary = page.getByTestId('results-summary');
    await expect(summary).toContainText('result');

    const firstResult = page.getByTestId('search-result').first();
    await expect(firstResult).toContainText('fingerspelling');
    await expect(firstResult.locator('mark').first()).toHaveText(/fingerspelling/i);

    const technologyFilter = page.getByRole('checkbox', { name: 'Technology' });
    await technologyFilter.check();

    await expect(page.getByText(/Which camera setups work best/i)).toBeVisible();

    await technologyFilter.uncheck();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.locator('.pagination__status')).toContainText('Page 2 of');
  });
});
