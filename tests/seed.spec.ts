import { expect, test } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVR4nGP8////fwYkwMTAwMAgqhnIIKoZiBBABozoWgBvpAkdy756fgAAAABJRU5ErkJggg==', 'base64');

async function canvasPixels(page: import('@playwright/test').Page) {
  return page.locator('canvas[aria-label="Seed preview"]').evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable for verification.');
    return Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
  });
}

test('Seed: WebGL preview changes pixels and exports a non-empty PNG', async ({ page }) => {
  await page.goto('/en/seed');
  await expect(page.getByRole('heading', { level: 1, name: 'Seed' })).toBeVisible();
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'seed-fixture.png', mimeType: 'image/png', buffer: PNG });

  const canvas = page.locator('canvas[aria-label="Seed preview"]');
  await expect(canvas).toBeVisible();
  await expect.poll(() => canvas.evaluate((element) => Boolean((element as HTMLCanvasElement).getContext('webgl')))).toBe(true);

  const baseline = await canvasPixels(page);
  await page.locator('input[type="range"]').first().fill('50');
  await expect(page.getByText('50', { exact: true })).toBeVisible();
  await page.waitForTimeout(80);
  const adjusted = await canvasPixels(page);
  expect(adjusted).not.toEqual(baseline);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('seed-edited.png');
  const path = await download.path();
  expect(path).toBeTruthy();
});

test('Seed: Undo and Redo restore and reapply a change', async ({ page }) => {
  await page.goto('/en/seed');
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'seed-fixture.png', mimeType: 'image/png', buffer: PNG });
  const canvas = page.locator('canvas[aria-label="Seed preview"]');
  await expect(canvas).toBeVisible();

  const baseline = await canvasPixels(page);
  await page.locator('input[type="range"]').first().fill('35');
  await page.waitForTimeout(80);
  const edited = await canvasPixels(page);
  expect(edited).not.toEqual(baseline);

  await page.getByRole('button', { name: 'Undo' }).click();
  await page.waitForTimeout(80);
  expect(await canvasPixels(page)).toEqual(baseline);

  await page.getByRole('button', { name: 'Redo' }).click();
  await page.waitForTimeout(80);
  expect(await canvasPixels(page)).toEqual(edited);
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
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'seed-fixture.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('alert')).toContainText('WebGL is not supported');
});
