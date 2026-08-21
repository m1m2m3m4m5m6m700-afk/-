import { test, expect, type Download, type Page } from "playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function openTool(page: Page, slug: string) {
  await page.goto(`/tools/${slug}`);
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("h1")).toHaveCount(1);
}

async function readDownload(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download did not provide a readable stream.");
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function createVideoFixture(page: Page): Promise<Buffer> {
  return page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");

    const stream = canvas.captureStream(10);
    const mimeTypes = ["video/webm;codecs=vp8", "video/webm"];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error("CI browser cannot record WebM fixtures.");

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    const done = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("error", () => reject(new Error("Video fixture recording failed.")));
      recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: mimeType })));
    });

    recorder.start();
    for (let frame = 0; frame < 12; frame += 1) {
      ctx.fillStyle = frame % 2 === 0 ? "#111827" : "#2563eb";
      ctx.fillRect(0, 0, 160, 120);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(20 + frame * 6, 35, 40, 40);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    recorder.stop();

    const blob = await done;
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
}

async function setRange(locator: ReturnType<Page["locator"]>, value: number) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function assertMp4(buffer: Buffer) {
  expect(buffer.length).toBeGreaterThan(500);
  expect(buffer.subarray(4, 8).toString("ascii")).toBe("ftyp");
}

async function assertWebm(buffer: Buffer) {
  expect(buffer.length).toBeGreaterThan(100);
  expect(buffer.subarray(0, 4).toString("hex")).toBe("1a45dfa3");
}

test.describe("ready tools — real output verification", () => {
  test("Background Remover produces a real PNG download", async ({ page }) => {
    await openTool(page, "background-remover");
    await page.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: onePixelPng,
    });

    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download/i }).click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/^no-bg-.*\.png$/i);

    const output = await readDownload(download);
    expect(output.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(output.length).toBeGreaterThan(50);
  });

  test("Video Compressor performs a real FFmpeg conversion and downloads MP4", async ({ page }) => {
    await openTool(page, "video-compressor");
    const fixture = await createVideoFixture(page);
    await page.locator("#vid-comp-upload").setInputFiles({
      name: "fixture.webm",
      mimeType: "video/webm",
      buffer: fixture,
    });

    const button = page.getByRole("button", { name: /Compress Video/i });
    await expect(button).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/-compressed\.mp4$/i);
    await assertMp4(await readDownload(download));
  });

  test("Video Trimmer performs a real FFmpeg trim and downloads WebM", async ({ page }) => {
    await openTool(page, "video-trimmer");
    const fixture = await createVideoFixture(page);
    await page.locator("#vid-trim-upload").setInputFiles({
      name: "fixture.webm",
      mimeType: "video/webm",
      buffer: fixture,
    });

    await expect(page.getByText(/fixture\.webm/)).toBeVisible({ timeout: 30_000 });
    const ranges = page.locator('input[type="range"]');
    await expect(ranges).toHaveCount(2);
    const durationText = page.getByText(/fixture\.webm/).locator(".." );
    await setRange(ranges.nth(0), 0);
    await setRange(ranges.nth(1), 0.5);

    const button = page.getByRole("button", { name: /Trim Video/i });
    await expect(button).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/-trimmed\.webm$/i);
    await assertWebm(await readDownload(download));
  });

  test("Video to GIF performs real FFmpeg conversion and downloads GIF", async ({ page }) => {
    await openTool(page, "video-to-gif");
    const fixture = await createVideoFixture(page);
    await page.locator("#vid2gif-upload").setInputFiles({
      name: "fixture.webm",
      mimeType: "video/webm",
      buffer: fixture,
    });

    const button = page.getByRole("button", { name: /Convert to GIF/i });
    await expect(button).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.gif$/i);

    const output = await readDownload(download);
    expect(output.length).toBeGreaterThan(100);
    expect(output.subarray(0, 6).toString("ascii")).toMatch(/^GIF8[79]a$/);
  });
});
