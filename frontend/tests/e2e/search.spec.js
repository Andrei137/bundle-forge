import { test, expect } from '@playwright/test';
import { fetchFirstGame } from './helpers/api.js';

test.describe('Search', () => {
  test('searches from the header and lands on the search page with results', async ({ page, request }) => {
    const game = await fetchFirstGame(request);
    const queryTerm = game.title.split(' ')[0];

    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search PC, Mac, Linux Games');
    await searchInput.fill(queryTerm);
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/search\?search=/);
    await expect(page.getByRole('heading', { name: /search results/i })).toBeVisible();
    await expect(page.locator('.sp-card').first()).toBeVisible();
    await expect(page.locator('.sp-card-name').first()).toContainText(queryTerm, { ignoreCase: true });
  });

  test('shows live suggestions in the header dropdown', async ({ page, request }) => {
    const game = await fetchFirstGame(request);
    const queryTerm = game.title.split(' ')[0];

    await page.goto('/');
    await page.getByPlaceholder('Search PC, Mac, Linux Games').fill(queryTerm);

    const suggestion = page.locator('.search-suggestions .suggestion-item').first();
    await suggestion.waitFor({ state: 'visible', timeout: 5000 });
    await expect(suggestion).toContainText(queryTerm, { ignoreCase: true });

    await suggestion.click();
    await expect(page).toHaveURL(/\/(game|bundle)\/\d+/);
  });

  test('changing sort updates the URL query', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: /search results/i })).toBeVisible();

    const sortSelect = page.locator('select.sp-select').nth(1);
    await sortSelect.selectOption('price_asc');

    await expect(page).toHaveURL(/sort=price_asc/);
  });
});
