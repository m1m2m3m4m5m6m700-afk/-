// Generate valid test fixtures (PDF, PNG, JPG, GIF) for performance testing.
// Run with: node tests/perf/fixtures/gen-fixtures.mjs
import { PDFDocument, rgb } from "pdf-lib";
import { writeFileSync } from "fs";
import { deflateSync, crc32 } from "zlib";

const out = "tests/perf/fixtures";

// 1. PDF — multi-page text PDF
async function makePdf() {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 5; i++) {
    const page = doc.addPage([595, 842]); // A4
    page.drawText(
      `Flixo Performance Test — Page ${i + 1}\nLorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      {
        x: 50,
        y: 800,
        size: 14,
        color: rgb(0, 0, 0),
      },
    );
  }
  const bytes = await doc.save();
  writeFileSync(`${out}/sample.pdf`, bytes);
  console.log(`sample.pdf: ${bytes.length} bytes`);
}

// 2. PNG — minimal valid PNG (solid color, 100x100)
function makePng() {
  // Build a PNG via minimal encoder: signature + IHDR + IDAT + IEND
  const w = 100,
    h = 100;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0; // 8-bit RGB
  // IDAT: each row = filter byte (0) + w*3 bytes
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = 200;
    row[2 + x * 3] = 100;
    row[3 + x * 3] = 50;
  }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  const idatData = deflateSync(raw);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, c]);
  };
  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(`${out}/sample.png`, png);
  console.log(`sample.png: ${png.length} bytes`);
}

makePdf()
  .then(() => makePng())
  .then(() => console.log("fixtures done"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
