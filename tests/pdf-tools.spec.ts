import { test, expect } from "playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { MEGA_TOOLS } from "../src/data/megaToolsCatalog";

test.use({ serviceWorkers: "block" });

const IMPLEMENTED_PDF_HANDLERS = new Set([
  "inspect",
  "extract-text",
  "rotate",
  "remove-metadata",
  "flatten",
]);

/**
 * Dedicated regression coverage for the currently implemented PDF mega-tool variants.
 * Roadmap-only catalog entries are intentionally excluded until their runtime handlers exist.
 */
test("implemented PDF mega-tool variants return a real result", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const pdfDocument = await PDFDocument.create();
  const first = pdfDocument.addPage([600, 400]);
  const second = pdfDocument.addPage([600, 400]);
  const font = await pdfDocument.embedFont(StandardFonts.Helvetica);
  first.drawText("Flixo PDF verification fixture", { x: 40, y: 340, size: 20, font });
  first.drawText("Page one", { x: 40, y: 300, size: 14, font });
  second.drawText("Page two", { x: 40, y: 340, size: 20, font });
  second.drawText("Second page for split/extract/rotate tests", { x: 40, y: 300, size: 14, font });
  const pdfBase64 = Buffer.from(await pdfDocument.save()).toString("base64");

  const pdfTools = MEGA_TOOLS.filter(
    (tool) => tool.category === "pdf" && IMPLEMENTED_PDF_HANDLERS.has(tool.handler),
  );
  expect(pdfTools).toHaveLength(55);

  const failures: Array<{ slug: string; handler: string; preset: string; reason: string }> = [];

  await page.evaluate((pdfBase64Value) => {
    const pdfBinary = Uint8Array.from(atob(pdfBase64Value), (char) => char.charCodeAt(0));
    (window as unknown as { __flixoPdfFixture: File }).__flixoPdfFixture = new File(
      [pdfBinary],
      "flixo-pdf-verification.pdf",
      { type: "application/pdf" },
    );
  }, pdfBase64);

  for (const tool of pdfTools) {
    try {
      const outcome = await page.evaluate(async (definition) => {
        const { runMegaTool } = await import("/src/lib/megaToolsEngine.ts");
        const fixture = (window as unknown as { __flixoPdfFixture: File }).__flixoPdfFixture;
        const result = await runMegaTool(definition, fixture);

        if (result.type === "text") {
          if (!result.text.trim()) throw new Error("Tool returned empty text.");
          return { type: result.type, ok: true };
        }
        if (result.type === "download") {
          if (!result.filename || !result.filename.toLowerCase().endsWith(".pdf")) {
            throw new Error(`Invalid PDF download filename: ${result.filename}`);
          }
          if (!result.url) throw new Error("Tool returned an empty download URL.");
          const response = await fetch(result.url);
          if (!response.ok) throw new Error(`Download URL returned HTTP ${response.status}.`);
          const blob = await response.blob();
          if (blob.size === 0) throw new Error("Tool returned an empty PDF blob.");
          URL.revokeObjectURL(result.url);
          return { type: result.type, ok: true, bytes: blob.size };
        }
        throw new Error(`Unexpected PDF result type: ${result.type}`);
      }, tool);

      expect(outcome.ok).toBe(true);
    } catch (error) {
      failures.push({
        slug: tool.slug,
        handler: tool.handler,
        preset: tool.preset,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
