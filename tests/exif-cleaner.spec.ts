import { expect, test } from '@playwright/test';
import { assertDownload, assertImageResult, uploadFixture } from './helpers/image-tool-fixture';

test('exif-cleaner: re-encodes the image and downloads a clean output', async ({ page }) => {
  await page.goto('/en/exif-cleaner');
  await expect(page.getByRole('heading', { level: 1, name: 'EXIF Cleaner' })).toBeVisible();
  await uploadFixture(page);
  await page.getByRole('button', { name: 'Run tool' }).click();
  const result = await assertImageResult(page);
  expect(result.type).toMatch(/^image\//);
  await assertDownload(page, /\.(png|jpg|webp)$/);
});
