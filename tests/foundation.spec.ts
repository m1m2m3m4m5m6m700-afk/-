import { test, expect } from '@playwright/test';

test('application boots with the registered calculator', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Scientific calculator' })).toBeVisible();
  await expect(page.getByLabel('calculator expression')).toBeVisible();
  await expect(page.getByLabel('calculator result')).toHaveText('0');
});
