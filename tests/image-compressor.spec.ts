import { expect, test } from '@playwright/test';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#223344"/><circle cx="300" cy="220" r="180" fill="#67e8f9"/><circle cx="850" cy="560" r="260" fill="#164e63"/><text x="600" y="430" text-anchor="middle" fill="white" font-size="110" font-family="sans-serif">FLIXO</text></svg>`;

test('English image compressor produces a real WebP output', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await expect(page.getByRole('heading', { name: 'Compress Images Online' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'العربية' })).toHaveAttribute('href', '/ar/image-compressor');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Compress JPG, PNG, and WebP images online in your browser\./,
  );

  await page.locator('#image-file').setInputFiles({ name: 'source.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) });
  await page.getByRole('button', { name: 'Compress image' }).click();

  const download = page.getByRole('link', { name: 'Download image' });
  await expect(download).toHaveAttribute('download', 'flixo-compressed.webp', { timeout: 15000 });
  await expect(page.getByText(/smaller file size/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('complementary').getByText('WebP', { exact: true })).toBeVisible({ timeout: 15000 });

  const href = await download.getAttribute('href');
  expect(href).toMatch(/^blob:/);
});

test('Arabic image compressor exposes localized SEO and output controls', async ({ page }) => {
  await page.goto('/ar/image-compressor');
  await expect(page.getByRole('heading', { name: 'ضغط الصور أونلاين' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/image-compressor');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /اضغط صور JPG وPNG وWebP/);
});

test('runtime diagnostics capture an application error without breaking the page', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await page.evaluate(() => {
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'diagnostic-smoke-test',
        error: new Error('diagnostic-smoke-test'),
      }),
    );
  });

  const diagnostic = await page.evaluate(() => {
    const raw = localStorage.getItem('flixo:runtime-diagnostics');
    return raw ? JSON.parse(raw).at(-1) : null;
  });

  expect(diagnostic).toMatchObject({
    kind: 'error',
    message: 'diagnostic-smoke-test',
  });
  await expect(page.getByRole('heading', { name: 'Compress Images Online' })).toBeVisible();
});
