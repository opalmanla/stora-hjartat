import { test, expect } from '@playwright/test';

test.describe('Stora Hjärtat App', () => {
  test.setTimeout(30000);
  test('Visa startsidan', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.nav-brand h1')).toContainText('💚 Stora Hjärtat');
    await expect(page.locator('.hero h2')).toContainText('Dela dina ideella idéer');
    await expect(page.locator('#search-input')).toBeVisible();
  });
  test('Navigera till inloggningssidan', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2').first()).toContainText('Logga in');
    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });
  test('Visa sökfunktion', async ({ page }) => {
    await page.goto('/');
    await page.fill('#search-input', 'miljö');
    await page.click('#search-btn');
    await expect(page.locator('#ideas-container')).toBeVisible();
  });
  test('Ha navigeringslänkar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toBeVisible();
  });
  test('Visa idé container', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#ideas-container');
    const container = page.locator('#ideas-container');
    await expect(container).toBeVisible();
  });
});