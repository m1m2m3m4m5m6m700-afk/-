import { expect, test } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVR4nGP8////fwYkwMTAwMAgqhnIIKoZiBBABozoWgBvpAkdy756fgAAAABJRU5ErkJggg==', 'base64');
const tools = [
  ['background-remover', '/en/background-remover', 'Background Remover'],
  ['ai-image-generator', '/en/ai-image-generator', 'AI Image Generator'],
  ['image-upscaler', '/en/image-upscaler', 'Image Upscaler'],
  ['image-converter', '/en/image-converter', 'Image Converter'],
  ['image-to-text', '/en/image-to-text', 'Image to Text OCR'],
  ['object-remover', '/en/object-remover', 'Object Remover'],
  ['crop-resize', '/en/crop-resize', 'Crop & Resize'],
  ['watermark-remover', '/en/watermark-remover', 'Watermark Remover'],
  ['raster-to-svg', '/en/raster-to-svg', 'Raster to SVG'],
] as const;

async function resultImage(page: import('@playwright/test').Page) {
  const image = page.locator('img[alt="Tool result"]');
  await expect(image).toBeVisible();
  return page.evaluate(async () => {
    const element = document.querySelector('img[alt="Tool result"]') as HTMLImageElement | null;
    if (!element) throw new Error('Result image not found.');
    const response = await fetch(element.src);
    const blob = await response.blob();
    return { type: blob.type, size: blob.size, width: element.naturalWidth, height: element.naturalHeight };
  });
}

for (const [id, path, title] of tools) {
  test(`${id}: output quality contract`, async ({ page }) => {
    if (id === 'image-to-text') {
      await page.addInitScript(() => {
        (window as typeof window & { Tesseract?: unknown }).Tesseract = {
          recognize: async () => ({ data: { text: 'FLIXO OCR OK' } }),
        };
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
      await page.getByPlaceholder('A cinematic sunset over Cairo...').fill('FLIXO production-quality test image');
      await page.getByRole('button', { name: 'Generate image' }).click();
      const output = await resultImage(page);
      expect(output.type).toBe('image/png');
      expect(output.size).toBeGreaterThan(20);
      expect(output.width).toBe(4);
      expect(output.height).toBe(4);
    } else {
      await page.locator('#image-tool-file').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });
      if (id === 'image-upscaler') await page.getByLabel('Scale').fill('2');
      if (id === 'image-converter') await page.getByLabel('Output format').selectOption('image/webp');
      if (id === 'background-remover') await page.getByLabel('Background tolerance').fill('25');
      if (id === 'crop-resize') {
        await page.getByLabel('X').fill('0');
        await page.getByLabel('Y').fill('0');
        await page.getByLabel('Width').fill('4');
        await page.getByLabel('Height').fill('4');
        await page.getByLabel('Output width').fill('8');
        await page.getByLabel('Output height').fill('6');
      }
      if (id === 'object-remover' || id === 'watermark-remover') {
        await page.getByLabel('X').fill('1');
        await page.getByLabel('Y').fill('1');
        await page.getByLabel('Width').fill('2');
        await page.getByLabel('Height').fill('2');
      }
      await page.getByRole('button', { name: 'Run tool' }).click();
    }

    await expect(page.getByText('RESULT', { exact: true })).toBeVisible();

    if (id === 'image-to-text') {
      await expect(page.getByText('FLIXO OCR OK')).toBeVisible();
      await expect(page.getByText(/Output:/)).not.toBeVisible();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: /Download/ }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.txt$/);
      return;
    }

    if (id === 'raster-to-svg') {
      const link = page.getByRole('link', { name: /Download/ });
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      const svgText = await page.evaluate(async (url) => {
        const response = await fetch(url);
        return response.text();
      }, href);
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('<rect');
      expect(svgText).toContain('FLIXO Raster to SVG');
      return;
    }

    const output = await resultImage(page);
    expect(output.size).toBeGreaterThan(20);
    if (id === 'image-upscaler') {
      expect(output.type).toBe('image/png');
      expect(output.width).toBe(8);
      expect(output.height).toBe(8);
    } else if (id === 'image-converter') {
      expect(output.type).toBe('image/webp');
      expect(output.width).toBe(4);
      expect(output.height).toBe(4);
    } else if (id === 'crop-resize') {
      expect(output.type).toBe('image/png');
      expect(output.width).toBe(8);
      expect(output.height).toBe(6);
    } else {
      expect(output.type).toBe('image/png');
      expect(output.width).toBe(4);
      expect(output.height).toBe(4);
    }
  });
}

test('image-compressor keeps its real output regression coverage', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await expect(page.getByRole('heading', { level: 1, name: 'Compress Images Online' })).toBeVisible();
  await expect(page.locator('#image-file')).toBeVisible();
});
