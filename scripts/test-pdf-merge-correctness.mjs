import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";

async function makeSource(sizes) {
  const source = await PDFDocument.create();
  for (const [width, height] of sizes) source.addPage([width, height]);
  return Buffer.from(await source.save({ useObjectStreams: false }));
}

async function mergePdfBuffers(buffers) {
  const output = await PDFDocument.create();
  for (const buffer of buffers) {
    const source = await PDFDocument.load(buffer);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return Buffer.from(await output.save({ useObjectStreams: false }));
}

const inputs = [
  await makeSource([[200, 300], [210, 310]]),
  await makeSource([[400, 500]]),
];

const merged = await mergePdfBuffers(inputs);
assert.equal(merged.subarray(0, 5).toString("ascii"), "%PDF-");

const decoded = await PDFDocument.load(merged);
assert.equal(decoded.getPageCount(), 3);
const expected = [[200, 300], [210, 310], [400, 500]];
expected.forEach(([width, height], index) => {
  assert.equal(Math.round(decoded.getPage(index).getWidth()), width);
  assert.equal(Math.round(decoded.getPage(index).getHeight()), height);
});

console.log(JSON.stringify({
  schemaVersion: 1,
  tool: "pdf-merge",
  status: "PASS",
  inputFiles: inputs.length,
  outputPages: decoded.getPageCount(),
  pageOrder: expected,
  independentDecoder: "pdf-lib",
  generatedAt: new Date().toISOString(),
}, null, 2));
