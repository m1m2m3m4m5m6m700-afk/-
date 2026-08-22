import { expect, test } from '@playwright/test';

test('homepage resolves a product goal to a QuickFlow', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Describe your goal' });
  await search.fill('make this product photo ready for my store');
  const recommendation = page.locator('.home-intent-result');
  await expect(recommendation).toBeVisible();
  await expect(recommendation.locator('strong')).toHaveText('Product Ready');
  await expect(recommendation.getByText('Remove background', { exact: true })).toBeVisible();
  await recommendation.getByRole('link', { name: /Start/ }).click();
  await expect(page).toHaveURL(/\/en\/quickflow\/product-ready$/);
  await expect(page.getByRole('heading', { name: 'Product Ready' })).toBeVisible();
});

test('homepage resolves a direct compression goal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Describe your goal' }).fill('make this image smaller');
  const recommendation = page.locator('.home-intent-result');
  await expect(recommendation).toBeVisible();
  await expect(recommendation.getByText('Image Compressor', { exact: true })).toBeVisible();
  await expect(recommendation.getByRole('link', { name: /Start/ })).toBeVisible();
});

test('all deterministic workflow routes resolve without AI', async ({ page }) => {
  for (const workflow of ['product-ready', 'social-ready', 'profile-ready', 'web-ready', 'print-ready', 'improve-image']) {
    await page.goto(`/en/quickflow/${workflow}`);
    await expect(page).not.toHaveTitle(/404|Not Found/i);
    await expect(page.locator('main')).toBeVisible();
  }
});

test('Arabic homepage routes intent search to Arabic QuickFlow', async ({ page }) => {
  await page.goto('/ar');
  const search = page.getByRole('textbox', { name: 'اكتب ما تريد إنجازه' });
  await search.fill('جهز صورة المنتج للمتجر');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/ar\/quickflow\/product-ready$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
