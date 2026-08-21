import { expect, test } from '@playwright/test';

const locales = [
  ['en', 'ltr'], ['zh', 'ltr'], ['hi', 'ltr'], ['es', 'ltr'], ['fr', 'ltr'], ['ar', 'rtl'], ['bn', 'ltr'], ['pt', 'ltr'], ['ru', 'ltr'], ['ur', 'rtl'],
  ['id', 'ltr'], ['de', 'ltr'], ['ja', 'ltr'], ['sw', 'ltr'], ['mr', 'ltr'], ['te', 'ltr'], ['tr', 'ltr'], ['ta', 'ltr'], ['ko', 'ltr'], ['vi', 'ltr'],
] as const;

const englishTitle = /Image|Background|Remover|Converter|Optimizer|Studio|Generator|Cleaner/i;

test.describe('FLIXO i18n', () => {
  for (const [locale, dir] of locales) {
    test(`${locale} home has localized document metadata and direction`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('main')).toBeVisible();
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);
      await expect.poll(() => page.locator('html').getAttribute('dir')).toBe(dir);
      await expect(page).toHaveTitle(/FLIXO/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test(`${locale} pix has canonical hreflang schema and privacy metadata`, async ({ page }) => {
      await page.goto(`/${locale}/pix`);
      await expect(page.locator('main')).toBeVisible();
      await expect(page).toHaveTitle(/FLIXO/);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[aria-label="Privacy notice"]')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(21);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain(`/${locale}/pix`);

      const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}') as Record<string, unknown>;
      expect(schema['@type']).toBe('WebApplication');
      expect(schema.inLanguage).toBe(locale);
      expect(schema.operatingSystem).toBe('All');
      expect(schema.applicationCategory).toBe('MultimediaApplication');

      const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('hreflang')));
      expect(alternates).toEqual(expect.arrayContaining(locales.map(([code]) => code)));
      expect(alternates).toContain('x-default');

      if (locale !== 'en') await expect(page.locator('h1')).not.toHaveText(englishTitle);
    });
  }
});
