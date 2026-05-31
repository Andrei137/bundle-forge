import { test, expect } from '@playwright/test';
import { fetchFirstGame } from './helpers/api.js';

test.describe('Shopping cart', () => {
  test('adding a game from the detail page updates the cart badge and total', async ({ page, request }) => {
    const game = await fetchFirstGame(request);

    await page.goto(`/game/${game.id}`);
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();

    // The cart starts empty.
    await expect(page.locator('.cart-total')).toHaveText('RON 0.00');
    await expect(page.locator('.cart-badge')).toHaveCount(0);

    await page.getByRole('button', { name: /add to cart/i }).click();

    await expect(page.locator('.cart-badge')).toHaveText('1');
    await expect(page.locator('.cart-total')).not.toHaveText('RON 0.00');
  });

  test('cart page shows the game and lets the user change quantity and remove it', async ({ page, request }) => {
    const game = await fetchFirstGame(request);

    await page.goto(`/game/${game.id}`);
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.locator('.cart-badge')).toHaveText('1');

    await page.locator('.cart-btn').click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { name: /your secure cart/i })).toBeVisible();
    await expect(page.locator('.cp-game-title').first()).toContainText(game.title);

    await page.getByRole('button', { name: /increase quantity/i }).click();
    await expect(page.locator('.cp-qty-val')).toHaveText('2');
    await expect(page.locator('.cart-badge')).toHaveText('2');

    await page.getByRole('button', { name: /^remove /i }).click();
    await expect(page.locator('.cp-empty-headline')).toBeVisible();
    await expect(page.locator('.cart-badge')).toHaveCount(0);
  });

  test('checkout button redirects unauthenticated users to the sign-in page', async ({ page, request }) => {
    const game = await fetchFirstGame(request);
    await page.goto(`/game/${game.id}`);
    await page.getByRole('button', { name: /add to cart/i }).click();

    await page.locator('.cart-btn').click();
    await expect(page).toHaveURL(/\/cart$/);

    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    await expect(page).toHaveURL(/\/account\/login$/);
  });

  test('rejects an invalid coupon code', async ({ page, request }) => {
    const game = await fetchFirstGame(request);
    await page.goto(`/game/${game.id}`);
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.locator('.cart-btn').click();
    await expect(page).toHaveURL(/\/cart$/);

    // The coupon box is expanded by default.
    const couponInput = page.locator('.cp-coupon-input');
    await expect(couponInput).toBeVisible();
    await couponInput.fill('TOTALLYFAKECODE');
    await page.locator('.cp-coupon-apply').click();

    await expect(page.locator('.cp-coupon-feedback--error')).toBeVisible();
  });
});
