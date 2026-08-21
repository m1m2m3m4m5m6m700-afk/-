import { test, expect } from "playwright/test";

type ImageResult = {
  slug: string;
  handler: string;
  preset: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  sample: [number, number, number, number];
};

const SOURCE_WIDTH = 2048;
const SOURCE_HEIGHT = 1024;

const MAX_DIM: Record<string, number> = {
  quick: 640,
  small: 960,
  medium: 1280,
  large: 1600,
  social: 1080,
  web: 1440,
  mobile: 1170,
  print: 2400,
  hd: 1920,
  pro: 2560,
  max: 4096,
};

function expectedMime(handler: string) {
  if (handler === "compress" || handler === "convert-jpg") return "image/jpeg";
  if (handler === "convert-webp") return "image/webp";
  return "image/png";
}

function expectedDimensions(handler: string, preset: string) {
  const target = MAX_DIM[preset] ?? SOURCE_WIDTH;
  if (["resize", "compress", "convert-png", "convert-jpg", "convert-webp"].includes(handler)) {
    const scale = Math.min(1, target / Math.max(SOURCE_WIDTH, SOURCE_HEIGHT));
    return {
      width: Math.max(1, Math.round(SOURCE_WIDTH * scale)),
      height: Math.max(1, Math.round(SOURCE_HEIGHT * scale)),
    };
  }
  if (handler === "rotate") return { width: SOURCE_HEIGHT, height: SOURCE_WIDTH };
  return { width: SOURCE_WIDTH, height: SOURCE_HEIGHT };
}

function assertPixelSemantics(result: ImageResult) {
  const [r, g, b] = result.sample;
  switch (result.handler) {
    case "grayscale":
      expect(Math.abs(r - g)).toBeLessThanOrEqual(3);
      expect(Math.abs(g - b)).toBeLessThanOrEqual(3);
      break;
    case "invert":
      expect(r).toBeGreaterThan(180);
      expect(g).toBeGreaterThan(180);
      expect(b).toBeGreaterThan(180);
      break;
    case "brightness":
      expect(Math.max(r, g, b)).toBeGreaterThan(120);
      break;
    case "contrast":
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeGreaterThan(20);
      break;
    case "saturation":
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeGreaterThan(30);
      break;
    default:
      break;
  }
}

test("Image Mega Catalog: all 132 variants produce valid expected outputs", async ({ page }) => {
  test.setTimeout(20 * 60 * 1000);
  await page.goto("/");
  await expect(page.locator('[data-hydrated="true"]')).toHaveCount(1, { timeout: 30_000 });

  const results = await page.evaluate(
    async ({ width, height }) => {
      const { MEGA_TOOLS } = await import("/src/data/megaToolsCatalog.ts");
      const { runMegaTool } = await import("/src/lib/megaToolsEngine.ts");
      const imageTools = MEGA_TOOLS.filter((tool) => tool.category === "images");

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable in browser.");

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#ff143d");
      gradient.addColorStop(0.5, "#18d9ff");
      gradient.addColorStop(1, "#1924ff");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#f8f9ff";
      context.fillRect(0, Math.floor(height * 0.25), Math.floor(width * 0.35), Math.floor(height * 0.5));
      context.fillStyle = "#101018";
      context.fillRect(Math.floor(width * 0.65), Math.floor(height * 0.25), Math.floor(width * 0.35), Math.floor(height * 0.5));

      const sourceBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!sourceBlob) throw new Error("Could not create the source image fixture.");
      const sourceBytes = new Uint8Array(await sourceBlob.arrayBuffer());

      const output: Array<{
        slug: string;
        handler: string;
        preset: string;
        mime: string;
        size: number;
        width: number;
        height: number;
        sample: [number, number, number, number];
      }> = [];

      for (const tool of imageTools) {
        const file = new File([sourceBytes], "mega-fixture.png", { type: "image/png" });
        const result = await runMegaTool(tool, file);
        if (result.type !== "download") throw new Error(`${tool.slug}: expected a download result.`);

        const response = await fetch(result.url);
        if (!response.ok) throw new Error(`${tool.slug}: output blob could not be fetched.`);
        const blob = await response.blob();
        if (!blob.size) throw new Error(`${tool.slug}: output blob is empty.`);

        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = url;
        await image.decode();

        const sampleCanvas = document.createElement("canvas");
        sampleCanvas.width = 1;
        sampleCanvas.height = 1;
        const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
        if (!sampleContext) throw new Error(`${tool.slug}: sample canvas unavailable.`);
        sampleContext.drawImage(image, Math.max(0, Math.floor(image.width / 2)), Math.max(0, Math.floor(image.height / 2)), 1, 1, 0, 0, 1, 1);
        const pixel = sampleContext.getImageData(0, 0, 1, 1).data;

        output.push({
          slug: tool.slug,
          handler: tool.handler,
          preset: tool.preset,
          mime: blob.type || "unknown",
          size: blob.size,
          width: image.width,
          height: image.height,
          sample: [pixel[0], pixel[1], pixel[2], pixel[3]],
        });
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(result.url);
      }

      return output;
    },
    { width: SOURCE_WIDTH, height: SOURCE_HEIGHT },
  );

  expect(results).toHaveLength(132);

  const failures: string[] = [];
  for (const result of results) {
    try {
      expect(result.mime).toBe(expectedMime(result.handler));
      expect(result.size).toBeGreaterThan(100);
      const expected = expectedDimensions(result.handler, result.preset);
      expect(result.width).toBe(expected.width);
      expect(result.height).toBe(expected.height);
      expect(result.sample[3]).toBeGreaterThan(0);
      assertPixelSemantics(result);
    } catch (error) {
      failures.push(`${result.slug}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  expect(failures, `Image Mega Catalog failures (${failures.length})`).toEqual([]);
});
