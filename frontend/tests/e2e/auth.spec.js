import { test, expect } from '@playwright/test';
import { buildCustomer, signUpCustomer } from './helpers/api.js';

const openSignInModal = async (page) => {
  await page.goto('/');
  await page.locator('header').getByRole('button', { name: /sign in/i }).click();
  await expect(page.locator('.sim-modal')).toBeVisible();
};

test.describe('Authentication', () => {
  test('shows a clear error for invalid credentials', async ({ page }) => {
    await openSignInModal(page);

    await page.locator('#si-email').fill('nope@example.test');
    await page.locator('#si-password').fill('wrongpassword');
    await page.locator('.sim-modal .sim-submit').click();

    await expect(page.locator('.sim-form')).toContainText(/(Sign in failed|credentials|Bad credentials|Server error)/i);
    await expect(page.getByRole('heading', { name: 'SIGN IN' })).toBeVisible();
  });

  test('a newly registered customer can sign in and sees their email in the account menu', async ({ page, request }) => {
    const customer = await signUpCustomer(request, buildCustomer());

    await openSignInModal(page);
    await page.locator('#si-email').fill(customer.email);
    await page.locator('#si-password').fill(customer.password);
    await page.locator('.sim-modal .sim-submit').click();

    const myAccount = page.getByRole('button', { name: /my account/i });
    await expect(myAccount).toBeVisible();

    await myAccount.click();
    await expect(page.locator('.account-menu')).toContainText(customer.email);

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.locator('header').getByRole('button', { name: /^sign in$/i })).toBeVisible();
  });

  test('the create-account flow validates email and switches user type', async ({ page }) => {
    await openSignInModal(page);
    // The right-panel "CREATE ACCOUNT" CTA flips the modal into register mode.
    await page.locator('.sim-create-btn').click();

    await expect(page.getByRole('heading', { name: 'CREATE ACCOUNT' })).toBeVisible();

    // Switch to developer; the secondary step should ask for a website.
    await page.locator('.sim-modal').getByRole('button', { name: /^developer$/i }).click();
    await page.locator('#reg-email').fill(`e2e-dev-${Date.now()}@example.test`);
    await page.locator('#reg-password').fill('Passw0rd!');
    await page.locator('.sim-modal .sim-submit').click();

    await expect(page.getByRole('heading', { name: 'DEVELOPER INFO' })).toBeVisible();
    await expect(page.locator('#reg-website')).toBeVisible();
    await expect(page.locator('#reg-displayname')).toBeVisible();
  });
});
