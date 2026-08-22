import { access, readFile } from 'node:fs/promises';

const failures = [];
const read = async (path) => readFile(path, 'utf8').catch(() => '');
const exists = async (path) => access(path).then(() => true).catch(() => false);

const workerClient = await read('src/lib/image/image-worker-client.ts');
const worker = await read('src/lib/image/image-processing.worker.ts');
const browserImage = await read('src/tools/_shared/browser-image.tsx');
const playwright = await read('playwright.config.ts');

if (!workerClient || !worker) failures.push('image worker contract is missing');
if (!browserImage.includes("from '../../lib/image/image-worker-client'")) failures.push('BrowserImageTool is not connected to the image worker');
if (!browserImage.includes('runImageWorker(files[0]')) failures.push('heavy image operations are not delegated to the worker');
if (!worker.includes('OffscreenCanvas')) failures.push('worker must use OffscreenCanvas for supported operations');
if (!worker.includes('createImageBitmap')) failures.push('worker must decode images with createImageBitmap');
if (!workerClient.includes("new Worker(new URL('./image-processing.worker.ts', import.meta.url)")) failures.push('worker client must use a Vite code-split Worker entry');
if (!playwright.includes("trace: 'retain-on-failure'")) failures.push('Playwright trace retention contract is missing');
if (!(await exists('tests/helpers/home-page.ts'))) failures.push('homepage Page Object contract is missing');

if (failures.length) {
  console.error(JSON.stringify({ stage: 'performance-contracts', status: 'failed', failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ stage: 'performance-contracts', status: 'ok' }, null, 2));
