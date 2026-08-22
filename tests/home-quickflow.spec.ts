import { expect, test } from '@playwright/test';

test('homepage resolves a product goal to a QuickFlow', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Describe your goal' });
  await search.fill('make this product photo ready for my store');
  await expect(page.getByText('Product Ready', { exact: true })).toBeVisible();
  await expect(page.getByText('Remove background', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Start/ }).click();
  await expect(page).toHaveURL(/\/en\/quickflow\/product-ready$/);
  await expect(page.getByRole('heading', { name: 'Product Ready' })).toBeVisible();
});

test('homepage resolves a direct compression goal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Describe your goal' }).fill('make this image smaller');
  await expect(page.getByText('Image Compressor', { exact: true })).toBeVisible();
});
