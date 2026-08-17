import type { Page } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { MEGA_TOOLS } from "../../src/data/megaToolsCatalog";

const BATCH_COUNT = 6;
const BATCH_SIZE = Math.ceil(MEGA_TOOLS.length / BATCH_COUNT);
const VARIANT_TIMEOUT_MS = 30_000;

type MegaVariant = (typeof MEGA_TOOLS)[number];

type MegaRunResult = {
  success: boolean;
  type?: string;
  reason?: string;
};

export function getVariantsBatch(batch: number): readonly MegaVariant[] {
  if (!Number.isInteger(batch) || batch < 1 || batch > BATCH_COUNT) {
    throw new Error(`Mega-tool batch must be between 1 and ${BATCH_COUNT}.`);
  }
  const start = (batch - 1) * BATCH_SIZE;
  return MEGA_TOOLS.slice(start, Math.min(start + BATCH_SIZE, MEGA_TOOLS.length));
}

export async function prepareMegaToolPage(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const pdfDocument = await PDFDocument.create();
  const pdfPage = pdfDocument.addPage([400, 300]);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  pdfPage.drawText("Flixo operational test", { x: 30, y: 240, size: 16, font });
  const pdfBase64 = Buffer.from(await pdfDocument.save()).toString("base64");

  await page.evaluate(async (pdfBase64Value) => {
    const writeText = (view: DataView, offset: number, value: string) => {
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
      imageCanvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Image fixture failed."))),
        "image/png",
      );
    });

    const sampleRate = 16000;
    const frames = Math.floor(sampleRate * 0.15);
    const wav = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(wav);
    writeText(view, 0, "RIFF");
    view.setUint32(4, wav.byteLength - 8, true);
    writeText(view, 8, "WAVE");
    writeText(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(view, 36, "data");
    view.setUint32(40, frames * 2, true);
    for (let index = 0; index < frames; index += 1) {
      view.setInt16(44 + index * 2, Math.sin(index / 12) * 0x2fff, true);
    }

    const chunks: Blob[] = [];
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
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const videoPromise = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) chunks.push(event.data);
      });
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

  if (MEGA_TOOLS.length !== 528) {
    throw new Error(`Expected 528 mega-tool variants, found ${MEGA_TOOLS.length}.`);
  }
}

export async function runMegaToolVariant(page: Page, variant: MegaVariant): Promise<MegaRunResult> {
  const label = `${variant.slug} [${variant.category}/${variant.handler}/${variant.preset}]`;
  const startedAt = Date.now();
  console.info(`[mega-tool] START ${label}`);

  try {
    const outcome = await page.evaluate(async ({ definition, timeoutMs }) => {
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
    }, { definition: variant, timeoutMs: VARIANT_TIMEOUT_MS });

    console.info(`[mega-tool] PASS ${label} (${Date.now() - startedAt}ms)`);
    return outcome;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[mega-tool] FAIL ${label} (${Date.now() - startedAt}ms): ${reason}`);
    return { success: false, reason: `${label}: ${reason}` };
  }
}
