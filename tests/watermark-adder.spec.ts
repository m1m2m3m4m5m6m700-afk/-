import { expect, test } from '@playwright/test';
import { assertDownload, assertImageResult, uploadFixture } from './helpers/image-tool-fixture';

test('watermark-adder: renders a downloadable image', async ({ page }) => {
  await page.goto('/en/watermark-adder');
  await expect(page.getByRole('heading', { level: 1, name: 'Watermark Adder' })).toBeVisible();
  await uploadFixture(page);
  await page.getByRole('button', { name: 'Run tool' }).click();
  const result = await assertImageResult(page);
  expect(result.size).toBeGreaterThan(20);
  await assertDownload(page, /\.(png|jpg|webp)$/);
});
