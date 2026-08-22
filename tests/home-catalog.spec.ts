import { expect, test } from '@playwright/test';

test('modern home exposes a searchable categorized tool catalog', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Everything you need for your images/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Find the right tool' })).toBeVisible();
  await expect(page.getByLabel('Search tools')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Creative' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Image Compressor/ }).first()).toBeVisible();

  await page.getByLabel('Search tools').fill('meme');
  await expect(page.getByRole('link', { name: /Meme Generator/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Image Compressor/ })).toHaveCount(0);

  await page.getByLabel('Search tools').fill('');
  await page.getByRole('tab', { name: 'Convert' }).click();
  await expect(page.getByRole('link', { name: /Image Converter/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /SVG Optimizer/ })).toBeVisible();
});

 test('modern home remains compact on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Everything you need for your images/i })).toBeVisible();
  await expect(page.getByLabel('Search tools')).toBeVisible();
});
