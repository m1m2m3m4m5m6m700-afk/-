#!/usr/bin/env node
import assert from "node:assert/strict";
import QRCode from "qrcode";
import { PNG } from "pngjs";
import { createRequire } from "node:module";
import { buildQrPayload } from "../src/lib/qr/payload.mjs";

const require = createRequire(import.meta.url);
const jsQR = require("jsqr");

const longUnicode = "مرحبا Flixo — QR ✓ اختبار ".repeat(12);
const extremeLongUnicode = "مرحبا Flixo — QR ✓ اختبار ".repeat(40);

const cases = [
  { id: "url", options: { mode: "url", input: "https://example.com/flixo?qr=1&lang=ar" }, expected: "https://example.com/flixo?qr=1&lang=ar" },
  { id: "text", options: { mode: "text", input: "مرحبا Flixo QR ✓ — تحقق من الناتج" }, expected: "مرحبا Flixo QR ✓ — تحقق من الناتج" },
  { id: "wifi", options: { mode: "wifi", wifiSsid: "Office;WiFi\\5G", wifiPass: "p@ss:word,42", wifiEncryption: "WPA" }, expected: "WIFI:T:WPA;S:Office\\;WiFi\\\\5G;P:p@ss\\:word\\,42;;" },
  { id: "email", options: { mode: "email", emailTo: "test@example.com", emailSubject: "Hello Flixo ✓" }, expected: "mailto:test@example.com?subject=Hello%20Flixo%20%E2%9C%93" },
  { id: "phone", options: { mode: "phone", phoneNumber: "+201001234567" }, expected: "tel:+201001234567" },
  { id: "long-unicode", options: { mode: "text", input: longUnicode }, expected: longUnicode },
  { id: "long-unicode-capacity", options: { mode: "text", input: extremeLongUnicode }, expected: extremeLongUnicode, width: 1000, errorCorrectionLevel: "L" },
  { id: "empty", options: { mode: "url", input: "" }, expected: "", skipGeneration: true },
  { id: "custom-color", options: { mode: "url", input: "https://example.com/color-variant" }, expected: "https://example.com/color-variant", color: { dark: "#123456", light: "#ffffff" } },
];

const startedAt = performance.now();
const results = [];
for (const testCase of cases) {
  const payload = buildQrPayload(testCase.options);
  assert.equal(payload, testCase.expected, `${testCase.id}: payload mismatch`);
  if (testCase.skipGeneration) {
    results.push({ id: testCase.id, status: "PASS", generated: false });
    continue;
  }

  const width = testCase.width ?? 300;
  const errorCorrectionLevel = testCase.errorCorrectionLevel ?? "M";
  const options = { width, margin: 2, errorCorrectionLevel, ...(testCase.color ? { color: testCase.color } : {}) };
  const pngDataUrl = await QRCode.toDataURL(payload, options);
  const pngBuffer = Buffer.from(pngDataUrl.split(",")[1], "base64");
  assert.deepEqual([...pngBuffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${testCase.id}: invalid PNG signature`);
  const image = PNG.sync.read(pngBuffer);
  const decoded = jsQR(new Uint8ClampedArray(image.data), image.width, image.height, { inversionAttempts: "attemptBoth" });
  assert.equal(decoded?.data, testCase.expected, `${testCase.id}: independent PNG decode mismatch`);

  const svg = await QRCode.toString(payload, { type: "svg", width, margin: 2, errorCorrectionLevel, ...(testCase.color ? { color: testCase.color } : {}) });
  assert.match(svg, /^<svg[\s>]/i, `${testCase.id}: invalid SVG root`);
  assert.match(svg, /xmlns=/i, `${testCase.id}: SVG namespace missing`);
  assert.doesNotMatch(svg, /<script|javascript:|on[a-z]+\s*=/i, `${testCase.id}: unsafe SVG markup`);

  results.push({ id: testCase.id, status: "PASS", generated: true, pngBytes: pngBuffer.length, pngWidth: image.width, pngHeight: image.height, decoded: decoded?.data, width, errorCorrectionLevel });
}

const durationMs = Math.round(performance.now() - startedAt);
console.log(JSON.stringify({ status: "PASS", decoder: "jsqr@1.4.0", pngDecoder: "pngjs", cases: results, durationMs }, null, 2));
