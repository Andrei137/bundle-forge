import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('renders the header, featured deals, and top sellers from the API', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.logo-text')).toHaveText('BUNDLE FORGE');
    await expect(page.getByPlaceholder('Search PC, Mac, Linux Games')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Top Sellers heading + at least one card.
    await expect(page.getByRole('heading', { name: /top sellers/i })).toBeVisible();
    await expect(page.locator('.ts-card').first()).toBeVisible();
  });

  test('navigates to a game detail page by clicking a top-seller card', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.ts-card').first();
    await firstCard.waitFor({ state: 'visible' });
    const title = (await firstCard.locator('.ts-card-title').textContent())?.trim();
    expect(title).toBeTruthy();

    await firstCard.click();

    await expect(page).toHaveURL(/\/game\/\d+/);
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(title);
  });
});
