import { expect, test } from '@playwright/test';
import { assertDownload, assertImageResult, uploadFixture } from './helpers/image-tool-fixture';

test('image-converter: converts to WebP with valid output', async ({ page }) => {
  await page.goto('/en/image-converter');
  await expect(page.getByRole('heading', { level: 1, name: 'Image Converter' })).toBeVisible();
  await uploadFixture(page);
  await page.getByLabel('Output format').selectOption('image/webp');
  await page.getByRole('button', { name: 'Run tool' }).click();
  const result = await assertImageResult(page);
  expect(result.type).toBe('image/webp');
  expect(result.width).toBe(4);
  expect(result.height).toBe(4);
  await assertDownload(page, /\.webp$/);
});
