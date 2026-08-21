import { expect, test } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVR4nGP8////fwYkwMTAwMAgqhnIIKoZiBBABozoWgBvpAkdy756fgAAAABJRU5ErkJggg==', 'base64');

test('Seed: WebGL preview and direct PNG export', async ({ page }) => {
  await page.goto('/en/seed');
  await expect(page.getByRole('heading', { level: 1, name: 'Seed' })).toBeVisible();

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'seed-fixture.png',
    mimeType: 'image/png',
    buffer: PNG,
  });

  const canvas = page.locator('canvas[aria-label="Seed preview"]');
  await expect(canvas).toBeVisible();

  const dimensions = await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }));
  expect(dimensions.width).toBe(4);
  expect(dimensions.height).toBe(4);

  await page.locator('input[type="range"]').first().fill('25');
  await expect(page.getByText('25', { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('seed-edited.png');
  expect(download.suggestedFilename()).not.toContain('undefined');
});

test('Seed: shows a clear error when GPU rendering is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: any[]) {
      if (contextId === 'webgl') return null;
      return originalGetContext.call(this, contextId as never, ...args) as never;
    };
  });

  await page.goto('/en/seed');
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'seed-fixture.png',
    mimeType: 'image/png',
    buffer: PNG,
  });

  await expect(page.getByRole('alert')).toContainText('WebGL is not supported');
});
