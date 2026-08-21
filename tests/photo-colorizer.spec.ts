import { expect, test } from '@playwright/test';

test('photo-colorizer: refuses to fake AI when endpoint is missing', async ({ page }) => {
  await page.goto('/en/photo-colorizer');
  await expect(page.getByRole('heading', { level: 1, name: 'Photo Colorizer' })).toBeVisible();
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from([137,80,78,71]) });
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('VITE_PHOTO_COLORIZER_ENDPOINT');
});
