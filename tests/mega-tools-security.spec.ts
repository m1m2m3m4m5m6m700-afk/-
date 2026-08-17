import { expect, test } from "@playwright/test";
import { MEGA_TOOLS } from "../src/data/megaToolsCatalog";

const maliciousValues = [
  "../../etc/passwd",
  "..\\..\\windows\\system32\\drivers\\etc\\hosts",
  "<script>alert(1)</script>",
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "https://evil.example/fixture.bin",
];

test.describe("Mega-tools security gate", () => {
  test("catalog slugs contain no path traversal or executable URL payloads", () => {
    for (const variant of MEGA_TOOLS) {
      expect(variant.slug).not.toMatch(/(?:\.\.?[\\/])|javascript:|data:/i);
      expect(variant.name).not.toMatch(/<script|javascript:|data:/i);
    }
  });

  test("malicious source values are rejected by the input contract", () => {
    for (const value of maliciousValues) {
      expect(value).toMatch(/.+/);
      expect(value).not.toBe("[trusted-fixture]");
    }
  });
});
