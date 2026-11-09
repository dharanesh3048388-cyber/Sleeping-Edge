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
    await page.getByRole('button', { name: /I plan to sleep at/ }).click();
    await expect(page.getByLabel('Bed hour')).toHaveValue('23');

    await page.getByRole('button', { name: 'Adjust sleep parameters' }).click();
    await page.getByRole('button', { name: 'Toggle 24-hour clock format' }).click();
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    await expect(page.getByLabel('Bed hour')).toHaveValue('11');
    await expect(page.getByRole('button', { name: 'PM', exact: true })).toHaveClass(/bg-sky-600/);
    await page.getByRole('button', { name: /I need to wake up at/ }).click();
    await expect(page.getByLabel('Wake hour')).toHaveValue('7');
    await expect(page.getByRole('button', { name: 'AM', exact: true })).toHaveClass(/bg-sky-600/);
  });

  test('fixed header stays visible and its spacer prevents content overlap on mobile and desktop', async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1365, height: 900 }]) {
      await page.setViewportSize(viewport);
      await page.goto(baseURL + '/');

      const header = page.locator('header').first();
      await expect(header).toBeVisible();
      const initialLayout = await page.evaluate(() => {
        const headerElement = document.querySelector('header');
        const spacer = headerElement?.nextElementSibling as HTMLElement | null;
        const main = document.querySelector('main');
        if (!headerElement || !spacer || !main) return null;
        return {
          position: getComputedStyle(headerElement).position,
          headerHeight: headerElement.getBoundingClientRect().height,
          spacerHeight: spacer.getBoundingClientRect().height,
          mainTop: main.getBoundingClientRect().top
        };
      });

      expect(initialLayout).not.toBeNull();
      expect(initialLayout?.position).toBe('fixed');
      expect(initialLayout!.spacerHeight).toBeGreaterThanOrEqual(initialLayout!.headerHeight - 1);
      expect(initialLayout!.mainTop).toBeGreaterThanOrEqual(initialLayout!.headerHeight - 1);

      await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
      await expect.poll(() => header.evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0);
    }
  });

  test('a fresh visit defaults to dark mode even when the device prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(baseURL + '/');

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByRole('switch', { name: 'Switch to Light Mode' })).toHaveAttribute('aria-checked', 'true');
  });

  test('normal page text remains selectable and theme choice survives a reload', async ({ page }) => {
    await page.goto(baseURL + '/');
    await expect(page.getByRole('heading', { name: /Plan your sleep timing/i })).toBeVisible();

    const selectionMode = await page.locator('body').evaluate(element => getComputedStyle(element).userSelect);
    expect(selectionMode).not.toBe('none');

    await page.getByRole('switch', { name: 'Switch to Light Mode' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.getByRole('switch', { name: 'Switch to Dark Mode' })).toBeVisible();
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


test.describe('ambient sound SEO landing pages and deep links', () => {
  const soundPages = [
    '/sleep-sounds/',
    '/white-noise-for-sleep/',
    '/pink-noise-for-sleep/',
    '/brown-noise-for-sleep/',
    '/rain-sounds-for-sleep/',
    '/ocean-sounds-for-sleep/',
    '/wind-sounds-for-sleep/'
  ];

  for (const path of soundPages) {
    test('loads indexable ambient sound page ' + path, async ({ page }) => {
      const response = await page.goto(baseURL + path);
      expect(response?.ok(), 'page response should be successful').toBeTruthy();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
      await expect(page.locator('h1')).toBeVisible();
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain(path);
    });
  }


  test('sleep sounds hub links to every other available player preset', async ({ page }) => {
    await page.goto(baseURL + '/sleep-sounds/');
    for (const preset of ['arctic_wind', 'solar_storm', 'celestial_drone', 'binaural_delta']) {
      await expect(page.locator('a[href="../?sound=' + preset + '#ambient-sounds"]')).toBeVisible();
    }
  });
  test('white-noise search landing page opens the selected player without autoplay', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL + '/white-noise-for-sleep/');
    await page.getByRole('link', { name: /Open white noise player/i }).click();

    const player = page.getByRole('region', { name: 'Ambient noise and sleep soundscape player' });
    await expect(player).toBeVisible();
    await expect(player.getByText('Pure White Noise')).toBeVisible();
    await expect(player.getByRole('button', { name: 'Play ambient sound' })).toBeVisible();
    await expect(player.getByRole('button', { name: 'Pause ambient sound' })).toHaveCount(0);

    await player.getByRole('button', { name: 'Play ambient sound' }).click();
    await expect(player.getByRole('button', { name: 'Pause ambient sound' })).toBeVisible();
    await player.getByRole('button', { name: 'Pause ambient sound' }).click();
    await player.getByRole('button', { name: 'Close ambient sound player' }).click();
    await expect(player).toHaveCount(0);
  });

  test('pink-noise query parameter preselects the matching sound without autoplay', async ({ page }) => {
    await page.goto(baseURL + '/?sound=pink_noise#ambient-sounds');
    const player = page.getByRole('region', { name: 'Ambient noise and sleep soundscape player' });
    await expect(player).toBeVisible();
    await expect(player.getByText('Pure Pink Noise')).toBeVisible();
    await expect(player.getByRole('button', { name: 'Play ambient sound' })).toBeVisible();
  });
});

test.describe('indexable sleep tool landing pages', () => {
  const pages = [
    '/sleep-tools/',
    '/sleep-calculator/',
    '/nap-calculator/',
    '/caffeine-calculator/',
    '/sleep-debt-calculator/',
    '/sleep-stages/'
  ];

  for (const path of pages) {
    test('loads complete SEO landing page ' + path, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(baseURL + path);
      expect(response?.ok(), 'landing page response should be successful').toBeTruthy();

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{70,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(path.replaceAll('/', '\\/') + '
  const pages = [
    '/about/', '/methodology/', '/privacy/', '/terms/', '/contact/', '/affiliate-disclosure/'
  ];

  for (const path of pages) {
    test('loads production information page ' + path, async ({ page }) => {
      const response = await page.goto(baseURL + path);
      expect(response?.ok(), 'page response should be successful').toBeTruthy();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(path.replaceAll('/', '\\/') + '$'));
    });
  }

  test('public-facing production pages do not advertise repository or issue-tracker destinations', async ({ page }) => {
    await page.goto(baseURL + '/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: /repository|github|source code/i })).toHaveCount(0);
    await expect(page.locator('a[href*="github.com/"]')).toHaveCount(0);
    await page.goto(baseURL + '/contact/');
    await expect(page.locator('a[href*="github.com/"]')).toHaveCount(0);
    await expect(page.getByText(/issue tracker/i)).toHaveCount(0);
  });

  test('footer exposes all production trust links', async ({ page }) => {
    await page.goto(baseURL + '/');
    const footer = page.getByRole('navigation', { name: 'Legal and information' });
    for (const label of ['Sleep tools', 'Sleep sounds', 'About', 'Methodology', 'Privacy', 'Terms', 'Advertising & affiliates', 'Contact']) {
      await expect(footer.getByRole('link', { name: label })).toBeVisible();
    }
  });
});
));
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();

      const structuredData = await page.locator('script[type="application/ld+json"]').first().textContent();
      const parsed = JSON.parse(structuredData || '{}');
      const types = (parsed['@graph'] || []).map((item: { ['@type']?: string }) => item['@type']);
      expect(types).toContain('WebPage');
      expect(types).toContain('BreadcrumbList');
      expect(errors, 'uncaught browser errors').toEqual([]);
    });
  }

  test('tool directory links to every calculator guide and the sound library', async ({ page }) => {
    await page.goto(baseURL + '/sleep-tools/');
    for (const path of [
      'sleep-calculator', 'nap-calculator', 'caffeine-calculator',
      'sleep-debt-calculator', 'sleep-stages', 'sleep-sounds'
    ]) {
      await expect(page.locator('a[href="../' + path + '/"]').first()).toBeVisible();
    }
  });

  const directToolLinks = [
    { path: '/sleep-calculator/', name: 'Open sleep calculator', section: '#calculator', hash: '#sleep-calculator' },
    { path: '/nap-calculator/', name: 'Open nap optimizer', section: '#naps', hash: '#nap-optimizer' },
    { path: '/caffeine-calculator/', name: 'Open caffeine calculator', section: '#caffeine', hash: '#caffeine-calculator' },
    { path: '/sleep-debt-calculator/', name: 'Open 7-day sleep tracker', section: '#recovery', hash: '#sleep-debt' },
    { path: '/sleep-stages/', name: 'Explore sleep stages', section: '#science', hash: '#sleep-stages' }
  ];

  for (const tool of directToolLinks) {
    test('landing-page CTA opens the correct live app section ' + tool.path, async ({ page }) => {
      await page.goto(baseURL + tool.path);
      await page.getByRole('link', { name: tool.name, exact: true }).click();
      await expect(page.locator(tool.section)).toBeVisible();
      await expect.poll(() => new URL(page.url()).hash).toBe(tool.hash);
    });
  }
});

test.describe('production trust and monetization readiness pages', () => {
  const pages = [
    '/about/', '/methodology/', '/privacy/', '/terms/', '/contact/', '/affiliate-disclosure/'
  ];

  for (const path of pages) {
    test('loads production information page ' + path, async ({ page }) => {
      const response = await page.goto(baseURL + path);
      expect(response?.ok(), 'page response should be successful').toBeTruthy();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(path.replaceAll('/', '\\/') + '$'));
    });
  }

  test('public-facing production pages do not advertise repository or issue-tracker destinations', async ({ page }) => {
    await page.goto(baseURL + '/');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: /repository|github|source code/i })).toHaveCount(0);
    await expect(page.locator('a[href*="github.com/"]')).toHaveCount(0);
    await page.goto(baseURL + '/contact/');
    await expect(page.locator('a[href*="github.com/"]')).toHaveCount(0);
    await expect(page.getByText(/issue tracker/i)).toHaveCount(0);
  });

  test('footer exposes all production trust links', async ({ page }) => {
    await page.goto(baseURL + '/');
    const footer = page.getByRole('navigation', { name: 'Legal and information' });
    for (const label of ['Sleep sounds', 'About', 'Methodology', 'Privacy', 'Terms', 'Advertising & affiliates', 'Contact']) {
      await expect(footer.getByRole('link', { name: label })).toBeVisible();
    }
  });
});
