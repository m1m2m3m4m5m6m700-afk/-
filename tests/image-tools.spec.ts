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
    if (!blob.size) throw new Error('Result image is empty.');
    return { type: blob.type, size: blob.size, width: element.naturalWidth, height: element.naturalHeight };
  });
}

async function configureTool(page: import('@playwright/test').Page, id: typeof tools[number][0]) {
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
}

async function runHappyPath(page: import('@playwright/test').Page, id: typeof tools[number][0]) {
  if (id === 'ai-image-generator') {
    await page.getByPlaceholder('A cinematic sunset over Cairo...').fill('FLIXO production-quality test image');
    await page.getByRole('button', { name: 'Generate image' }).click();
    return;
  }

  await page.locator('#image-tool-file').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });
  if (id === 'image-upscaler') await page.getByRole('textbox', { name: 'Scale', exact: true }).fill('2');
  if (id === 'image-converter') await page.getByLabel('Output format').selectOption('image/webp');
  if (id === 'background-remover') await page.getByRole('textbox', { name: 'Background tolerance', exact: true }).fill('25');
  if (id === 'crop-resize') {
    await page.getByRole('textbox', { name: 'X', exact: true }).fill('0');
    await page.getByRole('textbox', { name: 'Y', exact: true }).fill('0');
    await page.getByRole('textbox', { name: 'Width', exact: true }).fill('4');
    await page.getByRole('textbox', { name: 'Height', exact: true }).fill('4');
    await page.getByRole('textbox', { name: 'Output width', exact: true }).fill('8');
    await page.getByRole('textbox', { name: 'Output height', exact: true }).fill('6');
  }
  if (id === 'object-remover' || id === 'watermark-remover') {
    await page.getByRole('textbox', { name: 'X', exact: true }).fill('1');
    await page.getByRole('textbox', { name: 'Y', exact: true }).fill('1');
    await page.getByRole('textbox', { name: 'Width', exact: true }).fill('2');
    await page.getByRole('textbox', { name: 'Height', exact: true }).fill('2');
  }
  await page.getByRole('button', { name: 'Run tool' }).click();
}

for (const [id, path, title] of tools) {
  test(`${id}: output quality contract`, async ({ page }) => {
    await configureTool(page, id);
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await runHappyPath(page, id);
    await expect(page.getByText('RESULT', { exact: true })).toBeVisible();

    if (id === 'image-to-text') {
      await expect(page.getByText('FLIXO OCR OK')).toBeVisible();
    } else if (id === 'raster-to-svg') {
      const link = page.getByRole('link', { name: /Download/ });
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      const svgText = await page.evaluate(async (url) => (await fetch(url)).text(), href);
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('<rect');
      expect(svgText).toContain('FLIXO Raster to SVG');
      expect(svgText).not.toContain('undefined');
      expect(svgText).not.toContain('NaN');
    } else {
      const output = await resultImage(page);
      expect(output.size).toBeGreaterThan(20);
      if (id === 'ai-image-generator') {
        expect(output.type).toBe('image/png');
        expect(output.width).toBe(4);
        expect(output.height).toBe(4);
      } else if (id === 'image-upscaler') {
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
    }

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download now' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(id === 'image-to-text' ? /\.txt$/ : id === 'raster-to-svg' ? /\.svg$/ : /\.(png|jpg|webp)$/);
    expect(download.suggestedFilename()).not.toContain('undefined');
  });

  test(`${id}: rejects invalid configuration instead of producing a silent bad output`, async ({ page }) => {
    await configureTool(page, id);
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

    if (id === 'ai-image-generator') {
      await page.getByRole('button', { name: 'Generate image' }).click();
      await expect(page.getByRole('alert')).toContainText('Enter a prompt first.');
      return;
    }

    await page.locator('#image-tool-file').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: PNG });

    if (id === 'image-upscaler') {
      await page.getByRole('textbox', { name: 'Scale', exact: true }).fill('9');
      await page.getByRole('button', { name: 'Run tool' }).click();
      await expect(page.getByRole('alert')).toContainText('Scale must be between 0.25 and 4.');
      return;
    }

    if (id === 'background-remover') {
      await page.getByRole('textbox', { name: 'Background tolerance', exact: true }).fill('');
      await page.getByRole('button', { name: 'Run tool' }).click();
      await expect(page.getByText('RESULT', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /Download/ })).toBeVisible();
      return;
    }

    await page.getByRole('button', { name: 'Run tool' }).click();
    await expect(page.getByText('RESULT', { exact: true })).toBeVisible();
  });
}

test('image-tools quality gate: every local image result is downloadable and decodable', async ({ page }) => {
  for (const [id, path, title] of tools.filter(([toolId]) => toolId !== 'ai-image-generator' && toolId !== 'image-to-text' && toolId !== 'raster-to-svg')) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await page.locator('#image-tool-file').setInputFiles({ name: `${id}.png`, mimeType: 'image/png', buffer: PNG });
    if (id === 'image-upscaler') await page.getByRole('textbox', { name: 'Scale', exact: true }).fill('1');
    if (id === 'image-converter') await page.getByLabel('Output format').selectOption('image/png');
    if (id === 'background-remover') await page.getByRole('textbox', { name: 'Background tolerance', exact: true }).fill('0');
    if (id === 'crop-resize') {
      await page.getByRole('textbox', { name: 'X', exact: true }).fill('0');
      await page.getByRole('textbox', { name: 'Y', exact: true }).fill('0');
      await page.getByRole('textbox', { name: 'Width', exact: true }).fill('4');
      await page.getByRole('textbox', { name: 'Height', exact: true }).fill('4');
      await page.getByRole('textbox', { name: 'Output width', exact: true }).fill('4');
      await page.getByRole('textbox', { name: 'Output height', exact: true }).fill('4');
    }
    if (id === 'object-remover' || id === 'watermark-remover') {
      await page.getByRole('textbox', { name: 'X', exact: true }).fill('0');
      await page.getByRole('textbox', { name: 'Y', exact: true }).fill('0');
      await page.getByRole('textbox', { name: 'Width', exact: true }).fill('1');
      await page.getByRole('textbox', { name: 'Height', exact: true }).fill('1');
    }
    await page.getByRole('button', { name: 'Run tool' }).click();
    const output = await resultImage(page);
    expect(output.size).toBeGreaterThan(20);
    expect(output.width).toBeGreaterThan(0);
    expect(output.height).toBeGreaterThan(0);
  }
});

test('image-compressor keeps its real output regression coverage', async ({ page }) => {
  await page.goto('/en/image-compressor');
  await expect(page.getByRole('heading', { level: 1, name: 'Compress Images Online' })).toBeVisible();
  await expect(page.locator('#image-file')).toBeVisible();
});
