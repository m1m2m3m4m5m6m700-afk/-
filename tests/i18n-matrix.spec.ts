import { expect, test } from '@playwright/test';

const languages = [
  ['en', 'ltr'], ['zh', 'ltr'], ['hi', 'ltr'], ['es', 'ltr'], ['fr', 'ltr'], ['ar', 'rtl'], ['bn', 'ltr'], ['pt', 'ltr'], ['ru', 'ltr'], ['ur', 'rtl'],
  ['id', 'ltr'], ['de', 'ltr'], ['ja', 'ltr'], ['sw', 'ltr'], ['mr', 'ltr'], ['te', 'ltr'], ['tr', 'ltr'], ['ta', 'ltr'], ['ko', 'ltr'], ['vi', 'ltr'],
] as const;

const tools = [
  'image-compressor', 'background-remover', 'image-upscaler', 'image-converter', 'ai-image-generator',
  'object-remover', 'watermark-remover', 'image-cropper', 'image-to-svg', 'image-ocr', 'photo-colorizer',
  'background-blur', 'passport-photo-maker', 'watermark-adder', 'meme-generator', 'collage-maker',
  'image-effects', 'exif-cleaner', 'svg-optimizer', 'mockup-generator', 'seed', 'pix',
] as const;

const expectedHreflang = 21;

for (const [locale, dir] of languages) {
  test(`${locale} validates all 22 localized tool routes`, async ({ page }) => {
    for (const tool of tools) {
      const response = await page.goto(`/${locale}/${tool}`, { waitUntil: 'domcontentloaded' });
      expect(response?.ok(), `${locale}/${tool} should return 2xx`).toBeTruthy();
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);
      await expect.poll(() => page.locator('html').getAttribute('dir')).toBe(dir);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      expect(await canonical.getAttribute('href')).toContain(`/${locale}/${tool}`);

      const alternateCount = await page.locator('link[rel="alternate"][hreflang]').count();
      expect(alternateCount, `${locale}/${tool} must expose 20 locales + x-default`).toBe(expectedHreflang);
      expect(await page.locator('link[rel="alternate"][hreflang="x-default"]').count()).toBe(1);

      const schema = page.locator('script[type="application/ld+json"]');
      await expect(schema).toHaveCount(1);
      const json = JSON.parse((await schema.textContent()) ?? '{}') as Record<string, unknown>;
      expect(json['@type']).toBe('WebApplication');
      expect(json.inLanguage).toBe(locale);
      expect(json.applicationCategory).toBe('MultimediaApplication');
      expect(json.offers).toMatchObject({ price: '0', priceCurrency: 'USD' });

      await expect(page.locator('[aria-label="Privacy notice"]')).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
    }
  });
}

test('matrix size is exactly 440 localized routes', () => {
  expect(languages.length * tools.length).toBe(440);
});
