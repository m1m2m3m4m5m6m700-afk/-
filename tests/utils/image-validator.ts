import { expect } from "playwright/test";

const PNG_SIGNATURE = Buffer.from("89504e470d0a1a0a", "hex");
const CRC_TABLE = buildCrcTable();

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Assert that a downloaded buffer is a structurally valid PNG with verified chunk CRCs and dimensions. */
export function assertPngArtifact(buffer: Buffer, expectedWidth: number, expectedHeight: number) {
  expect(buffer.length).toBeGreaterThan(24);
  expect(buffer.subarray(0, 8)).toEqual(PNG_SIGNATURE);

  let offset = 8;
  let sawIHDR = false;
  let sawIEND = false;
  let chunkCount = 0;

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = offset + 8;
    const crcStart = dataStart + length;
    const chunkEnd = crcStart + 4;

    if (chunkEnd > buffer.length) {
      throw new Error(`PNG chunk exceeds buffer: ${buffer.subarray(typeStart, typeStart + 4).toString("ascii")}`);
    }

    const type = buffer.subarray(typeStart, typeStart + 4).toString("ascii");
    const data = buffer.subarray(dataStart, crcStart);
    const storedCrc = buffer.readUInt32BE(crcStart);
    const calculatedCrc = crc32(Buffer.concat([buffer.subarray(typeStart, typeStart + 4), data]));

    expect(storedCrc, `Invalid PNG CRC for ${type}`).toBe(calculatedCrc);

    chunkCount += 1;
    if (chunkCount === 1) {
      expect(type).toBe("IHDR");
      expect(length).toBe(13);
      expect(buffer.readUInt32BE(dataStart)).toBe(expectedWidth);
      expect(buffer.readUInt32BE(dataStart + 4)).toBe(expectedHeight);
      sawIHDR = true;
    }

    if (type === "IEND") {
      expect(length).toBe(0);
      sawIEND = true;
      offset = chunkEnd;
      break;
    }

    offset = chunkEnd;
  }

  expect(sawIHDR).toBe(true);
  expect(sawIEND).toBe(true);
  expect(offset).toBe(buffer.length);
}
