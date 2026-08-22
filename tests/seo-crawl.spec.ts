import { expect, test } from '@playwright/test';

test('homepage exposes one h1 and an absolute canonical', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/example\.com\//);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test('English and Arabic compressor pages expose reciprocal hreflang', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://example.com/en/image-compressor');
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute('href', 'https://example.com/ar/image-compressor');
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://example.com/en/image-compressor');

  await page.goto('/ar/image-compressor');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('unknown route renders the noindex not-found boundary', async ({ page }) => {
  const response = await page.goto('/en/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByTestId('not-found-page')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
