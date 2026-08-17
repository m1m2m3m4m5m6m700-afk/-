import { test, expect } from "playwright/test";
import { VERIFIED_TOOL_SLUGS } from "../src/lib/tool-runtime/readyTools";

const verifiedTools = [
  { slug: "word-counter", input: /Start typing or paste your document content here/i, expected: /Total Words/i },
  { slug: "json-formatter", input: /Input Raw JSON/i, expected: /Prettify JSON/i },
  { slug: "base64-converter", input: /Input String or File/i, expected: /Convert Now/i },
  { slug: "uuid-generator", input: /Quantity \(1 - 100\)/i, expected: /Generate UUIDs/i },
  { slug: "url-encoder", input: /Raw URL or Query Parameter/i, expected: /URL Encode/i },
  { slug: "case-converter", input: /Type or paste text here/i, expected: /Converted Variations/i },
  { slug: "timestamp-converter", input: /Unix Timestamp → Human Date/i, expected: /Use now/i },
  { slug: "text-compare", input: /Paste the original text here/i, expected: /Compare Texts/i },
] as const;

test.describe("verified public tool registry", () => {
  test("publishes only the intentionally promoted tool set", () => {
    expect(VERIFIED_TOOL_SLUGS).toEqual(verifiedTools.map(({ slug }) => slug));
    expect(VERIFIED_TOOL_SLUGS).toHaveLength(verifiedTools.length);
  });

  for (const tool of verifiedTools) {
    test(`${tool.slug} renders a usable runtime`, async ({ page }) => {
      await page.goto(`/tools/${tool.slug}`);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.getByText(tool.input)).toBeVisible();
      await expect(page.getByText(tool.expected)).toBeVisible();
    });
  }
});
