import { expect } from "playwright/test";

/** Assert that a downloaded buffer is a structurally valid PNG with known dimensions. */
export function assertPngArtifact(buffer: Buffer, expectedWidth: number, expectedHeight: number) {
  expect(buffer.length).toBeGreaterThan(24);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(buffer.subarray(12, 16).toString("ascii")).toBe("IHDR");
  expect(buffer.readUInt32BE(16)).toBe(expectedWidth);
  expect(buffer.readUInt32BE(20)).toBe(expectedHeight);
}
