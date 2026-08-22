import { expect, test } from '@playwright/test';

const languages = [
  'en', 'ar', 'zh', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'ru',
  'it', 'nl', 'pl', 'tr', 'sv', 'id', 'hi', 'ur', 'vi', 'th',
] as const;

const readyTools = [
  'image-compressor', 'background-remover', 'image-upscaler', 'image-converter', 'ai-image-generator',
  'object-remover', 'watermark-remover', 'image-cropper', 'image-to-svg', 'image-ocr',
  'background-blur', 'passport-photo-maker', 'watermark-adder', 'meme-generator', 'collage-maker',
  'image-effects', 'exif-cleaner', 'svg-optimizer', 'mockup-generator', 'seed', 'pix',
] as const;

const rtlLanguages = new Set(['ar', 'ur']);

test.describe.configure({ mode: 'parallel' });
test.setTimeout(120_000);

for (const language of languages) {
  test(`${language}: all ready tools expose a localized route contract`, async ({ page }) => {
    for (const tool of readyTools) {
      const response = await page.goto(`/${language}/${tool}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${language}/${tool} status`).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('html')).toHaveAttribute('dir', rtlLanguages.has(language) ? 'rtl' : 'ltr');
      await expect(page.locator('h1'), `${language}/${tool} must have exactly one H1`).toHaveCount(1);
      await expect(page.locator('meta[name="description"]'), `${language}/${tool} description`).toHaveCount(1);
    }
  });

  test(`${language}: unavailable photo colorizer is not indexable`, async ({ page }) => {
    const response = await page.goto(`/${language}/photo-colorizer`, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), `${language}/photo-colorizer status`).toBe(404);
    await expect(page.getByTestId('not-found-page')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}
