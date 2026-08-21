import { expect, test } from '@playwright/test';
import { uploadFixture } from './helpers/image-tool-fixture';

test('image-to-svg: creates valid SVG output and download', async ({ page }) => {
  await page.goto('/en/image-to-svg');
  await expect(page.getByRole('heading', { level: 1, name: 'Image to SVG' })).toBeVisible();
  await uploadFixture(page);
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByText('<svg', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download now' })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download now' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});
