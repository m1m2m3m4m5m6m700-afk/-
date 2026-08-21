import { expect, test } from '@playwright/test';

test('application boots with image-first homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Image tools built for real search intent' })).toBeVisible();
  await expect(page.locator('a[href="/en/image-compressor"]')).toBeVisible();
});
