import { expect, test } from '@playwright/test';
import { HomePage } from './helpers/home-page';

test('homepage resolves a product goal to a QuickFlow', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.intentSearch().fill('make this product photo ready for my store');
  const recommendation = home.recommendation();
  await expect(recommendation).toBeVisible();
  await expect(recommendation.locator('strong')).toHaveText('Product Ready');
  await expect(recommendation.getByText('Remove background', { exact: true })).toBeVisible();
  await home.workflowLink(/Start/).click();
  await expect(page).toHaveURL(/\/en\/quickflow\/product-ready$/);
  await expect(page.getByRole('heading', { name: 'Product Ready' })).toBeVisible();
});

test('homepage resolves a direct compression goal', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.intentSearch().fill('make this image smaller');
  const recommendation = home.recommendation();
  await expect(recommendation).toBeVisible();
  await expect(recommendation.getByText('Image Compressor', { exact: true })).toBeVisible();
  await expect(home.workflowLink(/Start/)).toBeVisible();
});

test('all deterministic workflow routes resolve without AI', async ({ page }) => {
  for (const workflow of ['product-ready', 'social-ready', 'profile-ready', 'web-ready', 'print-ready', 'improve-image']) {
    await page.goto(`/en/quickflow/${workflow}`);
    await expect(page).not.toHaveTitle(/404|Not Found/i);
    await expect(page.getByRole('main')).toBeVisible();
  }
});

test('Arabic homepage routes intent search to Arabic QuickFlow', async ({ page }) => {
  const home = new HomePage(page);
  await home.open('ar');
  await home.intentSearch('ar').fill('جهز صورة المنتج للمتجر');
  await home.intentSearch('ar').press('Enter');
  await expect(page).toHaveURL(/\/ar\/quickflow\/product-ready$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
