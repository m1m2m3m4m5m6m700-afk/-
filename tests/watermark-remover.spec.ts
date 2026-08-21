import { expect, test } from '@playwright/test';
import { assertDownload, assertImageResult, uploadFixture } from './helpers/image-tool-fixture';

test('watermark-remover: produces a valid cleaned PNG', async ({ page }) => {
  await page.goto('/en/watermark-remover');
  await expect(page.getByRole('heading', { level: 1, name: 'Watermark Remover' })).toBeVisible();
  await uploadFixture(page);
  for (const [name, value] of [['X', '1'], ['Y', '1'], ['Width', '2'], ['Height', '2']] as const) {
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Run tool' }).click();
  const result = await assertImageResult(page);
  expect(result.type).toBe('image/png');
  await assertDownload(page, /\.png$/);
});
