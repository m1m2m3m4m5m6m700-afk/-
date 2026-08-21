import { expect, test } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const tools = [
  ['background-remover', '/en/background-remover', 'Background Remover'],
  ['ai-image-generator', '/en/ai-image-generator', 'AI Image Generator'],
  ['image-upscaler', '/en/image-upscaler', 'AI Image Upscaler'],
  ['image-converter', '/en/image-converter', 'Image Converter'],
  ['image-to-text', '/en/image-to-text', 'Image to Text OCR'],
  ['object-remover', '/en/object-remover', 'Object Remover'],
  ['crop-resize', '/en/crop-resize', 'Crop & Resize'],
  ['watermark-remover', '/en/watermark-remover', 'Watermark Remover'],
  ['raster-to-svg', '/en/raster-to-svg', 'Raster to SVG'],
] as const;

for (const [id, path, title] of tools) {
  test(`${id}: dedicated route and processing contract`, async ({ page }) => {
    if (id === 'image-to-text') {
      await page.addInitScript(() => {
        (window as typeof window & { Tesseract?: unknown }).Tesseract = { recognize: async () => ({ data: { text: 'FLIXO OCR OK' } }) };
      });
    }
    if (id === 'ai-image-generator') {
      await page.route('**/api/ai/image', async (route) => {
        await route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
      });
    }

    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

    if (id === 'ai-image-generator') {
      await page.getByPlaceholder('A cinematic sunset over Cairo...').fill('FLIXO test image');
      await page.getByRole('button', { name: 'Generate image' }).click();
    } else {
      await page.locator('#image-tool-file').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });
      if (id === 'crop-resize') {
        await page.getByLabel('Output width').fill('1');
        await page.getByLabel('Output height').fill('1');
      }
      await page.getByRole('button', { name: 'Run tool' }).click();
    }

    await expect(page.getByText('RESULT', { exact: true })).toBeVisible();
    if (id === 'image-to-text') await expect(page.getByText('FLIXO OCR OK')).toBeVisible();
    else await expect(page.getByRole('link', { name: /Download/ })).toBeVisible();
  });
}

test('image-compressor remains green while the new image tools are isolated', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await expect(page.getByRole('heading', { level: 1, name: 'Compress Images Online' })).toBeVisible();
  await expect(page.locator('#image-file')).toBeVisible();
});
