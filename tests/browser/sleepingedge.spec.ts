import { test, expect } from '@playwright/test';

const baseURL = process.env.SLEEPINGEDGE_BASE_URL ?? 'http://127.0.0.1:4173/Sleeping-Edge';

test.describe('SleepingEdge production app', () => {
  test('in-page navigation does not leave a section hash; refresh returns to top', async ({ page }) => {
    await page.setViewportSize({ width: 1365, height: 900 });
    await page.goto(baseURL + '/');
    await expect(page.getByRole('heading', { name: /Plan your sleep timing/i })).toBeVisible();

    await page.getByRole('link', { name: 'Caffeine Calculator' }).first().click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    expect(new URL(page.url()).hash).toBe('');

    await page.reload();
    await expect(page.getByRole('heading', { name: /Plan your sleep timing/i })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(2);
  });


  test('switching clock formats preserves the selected wake and bedtime', async ({ page }) => {
    await page.setViewportSize({ width: 1365, height: 900 });
    await page.goto(baseURL + '/');

    await page.getByRole('button', { name: 'Adjust sleep parameters' }).click();
    await page.getByRole('button', { name: 'Toggle 24-hour clock format' }).click();
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await expect(page.getByLabel('Wake hour')).toHaveValue('7');
    await expect(page.getByLabel('Bed hour')).toHaveValue('23');

    await page.getByRole('button', { name: 'Adjust sleep parameters' }).click();
    await page.getByRole('button', { name: 'Toggle 24-hour clock format' }).click();
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await expect(page.getByLabel('Wake hour')).toHaveValue('7');
    await expect(page.getByLabel('Bed hour')).toHaveValue('11');
    await expect(page.getByRole('button', { name: 'PM' })).toHaveClass(/bg-sky-600/);
  });

  test('mobile layout does not introduce horizontal page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL + '/');
    await expect(page.getByRole('heading', { name: /Plan your sleep timing/i })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
});

test.describe('static preview', () => {
  const previewURL = baseURL + '/preview';
  const pages = [
    '/', '/sleep-calculator/', '/caffeine-calculator/', '/nap-calculator/',
    '/sleep-debt-calculator/', '/sleep-stages/', '/about/', '/privacy/',
    '/terms/', '/contact/'
  ];

  for (const path of pages) {
    test('loads preview page ' + path, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(previewURL + path);
      expect(response?.ok(), 'page response should be successful').toBeTruthy();
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
      expect(errors, 'uncaught browser errors').toEqual([]);
    });
  }

  test('sleep calculator accepts a valid time and renders results', async ({ page }) => {
    await page.goto(previewURL + '/sleep-calculator/');
    await page.locator('#sleep-time').fill('07:00');
    await page.locator('#sleep-calc-form button[type="submit"]').click();
    await expect(page.locator('#sleep-calc-results .result-card').first()).toBeVisible();
  });

  test('caffeine calculator accepts valid inputs and renders results', async ({ page }) => {
    await page.goto(previewURL + '/caffeine-calculator/');
    await page.locator('#caffeine-mg').fill('150');
    await page.locator('#caffeine-bedtime').fill('23:00');
    await page.locator('#caffeine-intake').fill('15:00');
    await page.locator('#caffeine-calc-form button[type="submit"]').click();
    await expect(page.locator('#caffeine-results .result-card').first()).toBeVisible();
  });
});
