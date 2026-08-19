#!/usr/bin/env node
import assert from "node:assert/strict";
import QRCode from "qrcode";
import { buildQrPayload } from "../src/lib/qr/payload.mjs";

const cases = [
  {
    id: "url",
    options: { mode: "url", input: "https://example.com/flixo?qr=1&lang=ar" },
    expected: "https://example.com/flixo?qr=1&lang=ar",
  },
  {
    id: "text",
    options: { mode: "text", input: "مرحبا Flixo QR ✓ — تحقق من الناتج" },
    expected: "مرحبا Flixo QR ✓ — تحقق من الناتج",
  },
  {
    id: "wifi",
    options: { mode: "wifi", wifiSsid: "Office;WiFi\\5G", wifiPass: "p@ss:word,42", wifiEncryption: "WPA" },
    expected: "WIFI:T:WPA;S:Office\\;WiFi\\\\5G;P:p@ss\\:word\\,42;;",
  },
  {
    id: "email",
    options: { mode: "email", emailTo: "test@example.com", emailSubject: "Hello Flixo ✓" },
    expected: "mailto:test@example.com?subject=Hello%20Flixo%20%E2%9C%93",
  },
  {
    id: "phone",
    options: { mode: "phone", phoneNumber: "+201001234567" },
    expected: "tel:+201001234567",
  },
  {
    id: "long-unicode",
    options: { mode: "text", input: "مرحبا Flixo — QR ✓ اختبار ".repeat(40) },
    expected: "مرحبا Flixo — QR ✓ اختبار ".repeat(40),
  },
  {
    id: "empty",
    options: { mode: "url", input: "" },
    expected: "",
    skipGeneration: true,
  },
];

const startedAt = performance.now();
for (const testCase of cases) {
  const payload = buildQrPayload(testCase.options);
  assert.equal(payload, testCase.expected, `${testCase.id}: payload mismatch`);

  if (testCase.skipGeneration) continue;

  const png = await QRCode.toDataURL(payload, { width: 300, margin: 2, errorCorrectionLevel: "M" });
  assert.match(png, /^data:image\/png;base64,/i, `${testCase.id}: invalid PNG data URL`);
  const pngBuffer = Buffer.from(png.split(",")[1], "base64");
  assert.deepEqual([...pngBuffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${testCase.id}: invalid PNG signature`);

  const svg = await QRCode.toString(payload, { type: "svg", width: 300, margin: 2, errorCorrectionLevel: "M" });
  assert.match(svg, /^<svg[\s>]/i, `${testCase.id}: invalid SVG root`);
  assert.match(svg, /xmlns=/i, `${testCase.id}: SVG namespace missing`);
  assert.doesNotMatch(svg, /<script|javascript:|on[a-z]+\s*=/i, `${testCase.id}: unsafe SVG markup`);
}

const durationMs = Math.round(performance.now() - startedAt);
console.log(JSON.stringify({ status: "PASS", cases: cases.length, generatedArtifacts: cases.filter((item) => !item.skipGeneration).length, durationMs }, null, 2));
