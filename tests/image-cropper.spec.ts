import { expect, test } from '@playwright/test';
import { assertDownload, assertImageResult, uploadFixture } from './helpers/image-tool-fixture';

test('image-cropper: creates a valid resized crop', async ({ page }) => {
  await page.goto('/en/image-cropper');
  await expect(page.getByRole('heading', { level: 1, name: 'Crop & Resize' })).toBeVisible();
  await uploadFixture(page);
  await page.getByRole('button', { name: 'Run tool' }).click();
  const result = await assertImageResult(page);
  expect(result.type).toMatch(/^image\//);
  expect(result.width).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
  await assertDownload(page, /\.png$/);
});
