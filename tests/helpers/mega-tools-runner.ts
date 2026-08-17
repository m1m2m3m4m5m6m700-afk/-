import type { Page } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { MEGA_TOOLS, MEGA_TOOL_COUNT } from "../../src/data/megaToolsCatalog";

const BATCH_COUNT = 6;
const BATCH_SIZE = Math.ceil(MEGA_TOOL_COUNT / BATCH_COUNT);
const DEFAULT_VARIANT_TIMEOUT_MS = 15_000;
const VIDEO_VARIANT_TIMEOUT_MS = 30_000;

type MegaVariant = (typeof MEGA_TOOLS)[number];

type MegaRunResult = {
  success: boolean;
  type?: string;
  reason?: string;
};

function getVariantTimeoutMs(variant: MegaVariant): number {
  return variant.category === "video" ? VIDEO_VARIANT_TIMEOUT_MS : DEFAULT_VARIANT_TIMEOUT_MS;
}

function validateCatalog(): void {
  if (MEGA_TOOL_COUNT !== MEGA_TOOLS.length) {
    throw new Error(`Mega-tool catalog count export mismatch: ${MEGA_TOOL_COUNT} !== ${MEGA_TOOLS.length}.`);
  }

  const seenSlugs = new Set<string>();
  const supportedCategories = new Set(["images", "video", "audio", "pdf"]);
  for (const variant of MEGA_TOOLS) {
    validateInput(variant);
    if (seenSlugs.has(variant.slug)) {
      throw new Error(`Duplicate mega-tool variant slug: ${variant.slug}`);
    }
    seenSlugs.add(variant.slug);
    if (!supportedCategories.has(variant.category)) {
      throw new Error(`Unsupported mega-tool category: ${variant.category}`);
    }
  }
}

function validateInput(variant: MegaVariant): void {
  if (!variant || !variant.slug || !variant.name || !variant.category || !variant.handler || !variant.preset) {
    throw new Error("Invalid variant metadata");
  }
}

export function getVariantsBatch(batch: number): readonly MegaVariant[] {
  validateCatalog();

  if (!Number.isInteger(batch) || batch < 1 || batch > BATCH_COUNT) {
    throw new Error(`Mega-tool batch must be between 1 and ${BATCH_COUNT}.`);
  }

  const start = (batch - 1) * BATCH_SIZE;
  return MEGA_TOOLS.slice(start, Math.min(start + BATCH_SIZE, MEGA_TOOL_COUNT));
}

export async function prepareMegaToolPage(page: Page): Promise<void> {
  validateCatalog();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const pdfDocument = await PDFDocument.create();
  const pdfPage = pdfDocument.addPage([400, 300]);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  pdfPage.drawText("Flixo operational test", { x: 30, y: 240, size: 16, font });
  const pdfBase64 = Buffer.from(await pdfDocument.save()).toString("base64");

  await page.evaluate(async (pdfBase64Value) => {
    const writeAscii = (view: DataView, offset: number, value: string) => {
      [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
    };

    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = 64;
    imageCanvas.height = 48;
    const imageContext = imageCanvas.getContext("2d");
    if (!imageContext) throw new Error("Image canvas unavailable.");
    imageContext.fillStyle = "rgb(30, 90, 160)";
    imageContext.fillRect(0, 0, 64, 48);
    imageContext.fillStyle = "white";
    imageContext.fillRect(16, 12, 32, 24);

    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      imageCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image fixture failed."))), "image/png");
    });

    const sampleRate = 16_000;
    const frames = Math.floor(sampleRate * 0.15);
    const wav = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(wav);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, wav.byteLength - 8, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, frames * 2, true);
    for (let index = 0; index < frames; index += 1) view.setInt16(44 + index * 2, Math.sin(index / 12) * 0x2fff, true);

    const videoCanvas = document.createElement("canvas");
    videoCanvas.width = 64;
    videoCanvas.height = 48;
    const videoContext = videoCanvas.getContext("2d");
    if (!videoContext) throw new Error("Video fixture canvas unavailable.");
    videoContext.fillStyle = "black";
    videoContext.fillRect(0, 0, 64, 48);
    videoContext.fillStyle = "white";
    videoContext.fillRect(20, 15, 24, 18);

    const stream = videoCanvas.captureStream(12);
    if (!MediaRecorder.isTypeSupported("video/webm")) throw new Error("Chromium does not support video/webm MediaRecorder fixtures.");
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const videoPromise = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => { if (event.data.size > 0) chunks.push(event.data); });
      recorder.addEventListener("error", () => reject(new Error("Video fixture recording failed.")));
      recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: "video/webm" })));
    });
    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 300));
    recorder.stop();

    const videoBlob = await videoPromise;
    const pdfBinary = Uint8Array.from(atob(pdfBase64Value), (char) => char.charCodeAt(0));
    (window as unknown as { __flixoMegaFixtures: Record<string, File> }).__flixoMegaFixtures = {
      images: new File([imageBlob], "fixture.png", { type: "image/png" }),
      audio: new File([wav], "fixture.wav", { type: "audio/wav" }),
      video: new File([videoBlob], "fixture.webm", { type: "video/webm" }),
      pdf: new File([pdfBinary], "fixture.pdf", { type: "application/pdf" }),
    };
  }, pdfBase64);
}

export async function runMegaToolVariant(page: Page, variant: MegaVariant): Promise<MegaRunResult> {
  validateInput(variant);
  const label = `${variant.slug} [${variant.category}/${variant.handler}/${variant.preset}]`;
  const startedAt = Date.now();
  const timeoutMs = getVariantTimeoutMs(variant);
  console.info(`[mega-tool] START ${label} timeout=${timeoutMs}ms`);

  try {
    const outcome = await page.evaluate(
      async ({ definition, timeoutMs }) => {
        const run = async () => {
          const { runMegaTool } = await import("/src/lib/megaToolsEngine.ts");
          const fixtures = (window as unknown as { __flixoMegaFixtures: Record<string, File> }).__flixoMegaFixtures;
          const fixture = fixtures[definition.category];
          if (!fixture) throw new Error(`Missing fixture for ${definition.category}`);
          const result = await runMegaTool(definition, fixture);

          if (result.type === "text") {
            if (!result.text.trim()) throw new Error("Tool returned empty text.");
            return { success: true, type: result.type };
          }
          if (result.type === "download") {
            if (!result.filename || !result.url) throw new Error("Tool returned an invalid download result.");
            URL.revokeObjectURL(result.url);
            return { success: true, type: result.type };
          }
          if (result.type === "video") {
            if (result.element.tagName !== "VIDEO") throw new Error("Tool returned an invalid video result.");
            result.cleanup();
            return { success: true, type: result.type };
          }
          throw new Error("Unknown result type.");
        };

        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          return await Promise.race([
            run(),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(new Error(`Variant timed out after ${timeoutMs}ms.`)), timeoutMs);
            }),
          ]);
        } finally {
          if (timer) clearTimeout(timer);
        }
      },
      { definition: variant, timeoutMs },
    );

    console.info(`[mega-tool] PASS ${label} (${Date.now() - startedAt}ms)`);
    return outcome;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[mega-tool] FAIL ${label} (${Date.now() - startedAt}ms): ${reason}`);
    return { success: false, reason: `${label}: ${reason}` };
  }
}
