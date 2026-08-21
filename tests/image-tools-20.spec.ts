import { expect, test } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVR4nGP8////fwYkwMTAwMAgqhnIIKoZiBBABozoWgBvpAkdy756fgAAAABJRU5ErkJggg==', 'base64');
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>');

const tools = [
  ['background-blur', '/en/background-blur', 'Background Blur'],
  ['passport-photo-maker', '/en/passport-photo-maker', 'Passport Photo Maker'],
  ['watermark-adder', '/en/watermark-adder', 'Watermark Adder'],
  ['meme-generator', '/en/meme-generator', 'Meme Generator'],
  ['collage-maker', '/en/collage-maker', 'Collage Maker'],
  ['image-effects', '/en/image-effects', 'Image Effects'],
  ['exif-cleaner', '/en/exif-cleaner', 'EXIF Cleaner'],
  ['svg-optimizer', '/en/svg-optimizer', 'SVG Optimizer'],
  ['mockup-generator', '/en/mockup-generator', 'Mockup Generator'],
  ['image-to-svg', '/en/image-to-svg', 'Image to SVG'],
] as const;

for (const [id, path, title] of tools) {
  test(`${id}: real output + direct download`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    if (id === 'svg-optimizer') {
      await page.locator('input[type="file"]').setInputFiles({ name: 'input.svg', mimeType: 'image/svg+xml', buffer: SVG });
    } else if (id === 'collage-maker') {
      await page.locator('input[type="file"]').setInputFiles([
        { name: 'one.png', mimeType: 'image/png', buffer: PNG },
        { name: 'two.png', mimeType: 'image/png', buffer: PNG },
      ]);
    } else {
      await page.locator('input[type="file"]').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });
    }
    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByText('RESULT', { exact: true })).toBeVisible();
    if (id === 'svg-optimizer' || id === 'image-to-svg') {
      await expect(page.getByText('<svg', { exact: false })).toBeVisible();
    } else {
      const result = page.locator('img[alt="Tool result"]');
      await expect(result).toBeVisible();
      await expect(result).toHaveJSProperty('naturalWidth', expect.any(Number));
      const width = await result.evaluate((img) => img.naturalWidth);
      const height = await result.evaluate((img) => img.naturalHeight);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    }
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download now' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).not.toContain('undefined');
  });
}

test('photo-colorizer: blocks silently fake AI when endpoint is missing', async ({ page }) => {
  await page.goto('/en/photo-colorizer');
  await page.locator('input[type="file"]').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.getByRole('alert')).toContainText('VITE_PHOTO_COLORIZER_ENDPOINT');
});
