import { test, expect } from '@playwright/test';

test.describe('404 not-found page', () => {
  test('renders the custom 404 for an unknown URL', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Custom design (not an nginx/browser default) — the 404 code and message
    // should both render, alongside the global header (so site chrome stays).
    await expect(page.getByText('404', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    await expect(page.locator('.logo-text')).toHaveText('BUNDLE FORGE');
  });

  test('renders the custom 404 for a deeply nested unknown URL', async ({ page }) => {
    await page.goto('/account/login/extra/unknown/segments');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });

  test('"Back to homepage" link returns the user to the homepage', async ({ page }) => {
    await page.goto('/totally-bogus');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    await page.getByRole('link', { name: /back to homepage/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /top sellers/i })).toBeVisible();
  });

  test('navigating from a real page to an unknown URL still renders the 404', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /top sellers/i })).toBeVisible();

    await page.goto('/not-a-real-section');
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });
});

test.describe('Backend error responses', () => {
  test('unknown API endpoint returns 401 unauthenticated (security blocks before dispatcher)', async ({ request }) => {
    // The catch-all 404 from the dispatcher only fires for authenticated
    // requests; unauthenticated traffic is rejected by the security filter
    // first. This verifies the unauthenticated case so a future regression
    // (e.g. permitAll on a wildcard) shows up.
    const response = await request.get('http://localhost:8080/this-endpoint-does-not-exist');
    expect(response.status()).toBe(401);
  });

  test('GET an unknown charity-founder returns JSON 404 with an error body', async ({ request }) => {
    const response = await request.get('http://localhost:8080/charity-founders/99999999');
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
  });

  test('bad path-variable type returns JSON 400 with an error body', async ({ request }) => {
    // /charity-founders/{id} expects an Integer; "abc" can't be coerced.
    const response = await request.get('http://localhost:8080/charity-founders/abc');
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error.toString()).toContain('Integer');
  });
});
