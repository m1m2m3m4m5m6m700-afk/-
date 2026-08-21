import { expect, test } from '@playwright/test';

test('application boots with image-first homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Image tools built for real search intent' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Image Compressor' })).toHaveAttribute('href', '/en/image-compressor');
});
