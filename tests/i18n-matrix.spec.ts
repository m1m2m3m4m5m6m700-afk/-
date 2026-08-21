import { expect, test } from '@playwright/test';

const languages = [
  ['en', 'ltr'], ['zh', 'ltr'], ['hi', 'ltr'], ['es', 'ltr'], ['fr', 'ltr'], ['ar', 'rtl'], ['bn', 'ltr'], ['pt', 'ltr'], ['ru', 'ltr'], ['ur', 'rtl'],
  ['id', 'ltr'], ['de', 'ltr'], ['ja', 'ltr'], ['sw', 'ltr'], ['mr', 'ltr'], ['te', 'ltr'], ['tr', 'ltr'], ['ta', 'ltr'], ['ko', 'ltr'], ['vi', 'ltr'],
] as const;

const ogLocales: Record<(typeof languages)[number][0], string> = {
  en: 'en_US', zh: 'zh_CN', hi: 'hi_IN', es: 'es_ES', fr: 'fr_FR', ar: 'ar_SA', bn: 'bn_BD', pt: 'pt_PT', ru: 'ru_RU', ur: 'ur_PK',
  id: 'id_ID', de: 'de_DE', ja: 'ja_JP', sw: 'sw_KE', mr: 'mr_IN', te: 'te_IN', tr: 'tr_TR', ta: 'ta_IN', ko: 'ko_KR', vi: 'vi_VN',
};

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
      expect(await canonical.getAttribute('href')).toMatch(/^https:\/\//);

      const alternates = page.locator('link[rel="alternate"][hreflang]');
      expect(await alternates.count(), `${locale}/${tool} must expose 20 locales + x-default`).toBe(expectedHreflang);
      expect(await page.locator('link[rel="alternate"][hreflang="x-default"]').count()).toBe(1);
      expect(await page.locator(`link[rel="alternate"][hreflang="${locale}"]`).count()).toBe(1);

      const schema = page.locator('script[type="application/ld+json"]');
      await expect(schema).toHaveCount(1);
      const json = JSON.parse((await schema.textContent()) ?? '{}') as Record<string, unknown>;
      expect(json['@type']).toBe('WebApplication');
      expect(json.inLanguage).toBe(locale);
      expect(json.applicationCategory).toBe('MultimediaApplication');
      expect(json.offers).toMatchObject({ price: '0', priceCurrency: 'USD' });

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`/og/${locale}/${tool}\\.svg$`));
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', ogLocales[locale]);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator('[aria-label="Privacy notice"]')).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
    }
  });
}

test('matrix size is exactly 440 localized routes', () => {
  expect(languages.length * tools.length).toBe(440);
});

test('invalid localized tool is not indexable', async ({ page }) => {
  const response = await page.goto('/ar/not-a-real-tool', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
