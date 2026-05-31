import { test, expect } from '@playwright/test';
import { buildCustomer, signUpCustomer, fetchPayableGame } from './helpers/api.js';

test.describe('Checkout', () => {
  test('a signed-in customer reaches the checkout page with the Stripe payment form prepared', async ({ page, request }) => {
    const customer = await signUpCustomer(request, buildCustomer());
    const game = await fetchPayableGame(request);

    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('.sim-modal')).toBeVisible();

    await page.locator('#si-email').fill(customer.email);
    await page.locator('#si-password').fill(customer.password);
    await page.locator('.sim-modal .sim-submit').click();
    await expect(page.getByRole('button', { name: /my account/i })).toBeVisible();

    await page.goto(`/game/${game.id}`);
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.locator('.cart-badge')).toHaveText('1');

    await page.locator('.cart-btn').click();
    await page.getByRole('button', { name: /proceed to checkout/i }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: /^checkout$/i })).toBeVisible();
    await expect(page.locator('.checkout-summary__line').first()).toContainText(game.title);

    // The Pay now button appears once the PaymentIntent client secret is loaded.
    await expect(page.getByRole('button', { name: /pay now/i })).toBeVisible({ timeout: 20_000 });
  });
});
