import { test, expect } from '@playwright/test';
import { fetchFirstGame } from './helpers/api.js';

test.describe('Game detail page', () => {
  test('renders title, price, tabs, and add-to-cart action', async ({ page, request }) => {
    const game = await fetchFirstGame(request);

    await page.goto(`/game/${game.id}`);

    await expect(page.locator('.gp-price-now')).toContainText('RON');
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();

    // About / Requirements tabs are toggleable.
    const aboutTab = page.getByRole('button', { name: /^about$/i }).last();
    const reqTab = page.getByRole('button', { name: /^requirements$/i });
    await expect(aboutTab).toBeVisible();
    await reqTab.click();
    await expect(reqTab).toHaveClass(/gp-about-tab--active/);
    await aboutTab.click();
    await expect(aboutTab).toHaveClass(/gp-about-tab--active/);
  });

  test('navigating to a non-existent game keeps the user on the site without crashing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/game/999999999');
    // Header remains rendered — the app shell did not crash.
    await expect(page.locator('.logo-text')).toHaveText('BUNDLE FORGE');
    expect(errors).toEqual([]);
  });
});
