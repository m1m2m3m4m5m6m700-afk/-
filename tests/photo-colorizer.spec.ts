import { expect, test } from '@playwright/test';

test('photo-colorizer: unavailable tools return a real 404 and noindex', async ({ page }) => {
  const response = await page.goto('/en/photo-colorizer');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
