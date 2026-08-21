import { test, expect } from "playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function openTool(page: import("playwright/test").Page, slug: string) {
  await page.goto(`/tools/${slug}`);
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("h1")).toHaveCount(1);
}

test.describe("additional ready tools", () => {
  test("Background Remover route loads and produces a downloadable PNG", async ({ page }) => {
    await openTool(page, "background-remover");

    const input = page.locator('input[type="file"]');
    await expect(input).toBeAttached();
    await input.setInputFiles({ name: "pixel.png", mimeType: "image/png", buffer: onePixelPng });

    const result = page.locator('img[alt]').filter({ has: page.locator("xpath=..") });
    await expect(page.getByRole("button", { name: /Download/i })).toBeEnabled({ timeout: 30_000 });

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download/i }).click();
    const download = await downloadPromise;
    await expect.poll(() => download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/^no-bg-.*\.png$/i);

    const stream = await download.createReadStream();
    if (!stream) throw new Error("Background Remover did not produce a readable download.");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const output = Buffer.concat(chunks);
    expect(output.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(output.length).toBeGreaterThan(50);
    expect(await result.count()).toBeGreaterThanOrEqual(1);
  });

  test("Video to GIF route loads, accepts video input, and exposes the real conversion action", async ({ page }) => {
    await openTool(page, "video-to-gif");

    const input = page.locator("#vid2gif-upload");
    const convert = page.getByRole("button", { name: /Convert to GIF/i });
    await expect(input).toBeAttached();
    await expect(convert).toBeDisabled();

    const video = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 48;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 64, 48);
      ctx.fillStyle = "white";
      ctx.fillRect(16, 12, 32, 24);
      const stream = canvas.captureStream(10);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];
      const done = new Promise<Blob>((resolve, reject) => {
        recorder.addEventListener("dataavailable", (event) => event.data.size && chunks.push(event.data));
        recorder.addEventListener("error", () => reject(new Error("Video fixture recording failed.")));
        recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: "video/webm" })));
      });
      recorder.start();
      await new Promise((resolve) => setTimeout(resolve, 450));
      recorder.stop();
      const blob = await done;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return Array.from(bytes);
    });

    await input.setInputFiles({ name: "fixture.webm", mimeType: "video/webm", buffer: Buffer.from(video) });
    await expect(convert).toBeEnabled();
    await expect(page.getByText(/fixture\.webm/)).toBeVisible();
  });
});
