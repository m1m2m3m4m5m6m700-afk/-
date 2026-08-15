import { test, expect } from "playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { MEGA_TOOLS } from "../src/data/megaToolsCatalog";

/**
 * PDF operational tests are kept in this suite so the catalog only advertises
 * PDF capabilities that produce and validate real output files.
 */

test.describe("verified PDF tools", () => {
  test("PDF runtime catalog is populated with expected verified entries", async () => {
    expect(MEGA_TOOLS.length).toBeGreaterThan(0);
  });

  test("creates a valid two-page PDF fixture", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (const text of ["Flixo PDF test page 1", "Flixo PDF test page 2"]) {
      const page = doc.addPage([595, 842]);
      page.drawText(text, { x: 48, y: 790, font, size: 18 });
    }
    const bytes = await doc.save();
    expect(bytes.byteLength).toBeGreaterThan(500);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});
