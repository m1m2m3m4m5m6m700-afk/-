import JSZip from "jszip";
import crypto from "node:crypto";

const failures = [];
const fail = (message) => failures.push(message);
const randomInt = (max) => crypto.randomInt(0, max);
const makeRandomBytes = (size) => crypto.randomBytes(size);

function splitReference(buffer, chunkSize) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new Error("invalid chunk size");
  const chunks = [];
  for (let offset = 0; offset < buffer.length; offset += chunkSize) {
    chunks.push(buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length)));
  }
  return chunks;
}

for (let i = 0; i < 250; i += 1) {
  const size = randomInt(128 * 1024 + 1);
  const chunkSize = Math.max(1, randomInt(32 * 1024 + 1));
  const source = makeRandomBytes(size);
  const chunks = splitReference(source, chunkSize);
  const merged = Buffer.concat(chunks);
  if (!merged.equals(source)) fail(`split/merge property failed at case ${i} (size=${size}, chunk=${chunkSize})`);
  if (source.length === 0 && chunks.length !== 0) fail(`empty input produced chunks at case ${i}`);
  if (source.length > 0 && chunks.some((chunk) => chunk.length === 0)) fail(`empty chunk produced at case ${i}`);
}

for (let i = 0; i < 50; i += 1) {
  const zip = new JSZip();
  const entries = [];
  for (let j = 0; j < 1 + randomInt(8); j += 1) {
    const name = `f-${i}-${j}.bin`;
    const value = makeRandomBytes(randomInt(4096));
    zip.file(name, value);
    entries.push([name, value]);
  }
  const bytes = await zip.generateAsync({ type: "nodebuffer" });
  const loaded = await JSZip.loadAsync(bytes);
  for (const [name, expected] of entries) {
    const actual = await loaded.files[name].async("nodebuffer");
    if (!Buffer.from(actual).equals(expected)) fail(`ZIP round-trip property failed for ${name}`);
  }
}

if (failures.length) {
  console.error("PROPERTY/FUZZ CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PROPERTY/FUZZ CONTRACT: PASS (300 randomized invariants)");
