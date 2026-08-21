import { expect, test } from '@playwright/test';

const locales = [
  ['en','ltr'],['zh','ltr'],['hi','ltr'],['es','ltr'],['fr','ltr'],['ar','rtl'],['bn','ltr'],['pt','ltr'],['ru','ltr'],['ur','rtl'],
  ['id','ltr'],['de','ltr'],['ja','ltr'],['sw','ltr'],['mr','ltr'],['te','ltr'],['tr','ltr'],['ta','ltr'],['ko','ltr'],['vi','ltr'],
] as const;

test.describe('FLIXO i18n', () => {
  for (const [locale, dir] of locales) {
    test(`${locale} home is localized and has correct direction`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('main')).toBeVisible();
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);
      await expect.poll(() => page.locator('html').getAttribute('dir')).toBe(dir);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('title')).toHaveText(/FLIXO/);
    });
  }
});
