import { test, expect } from "playwright/test";
import { VERIFIED_TOOL_SLUGS } from "../src/lib/tool-runtime/readyTools";

const verifiedTools = [
  { slug: "word-counter", marker: "Total Words", action: "Type or Paste Your Text" },
  { slug: "json-formatter", marker: "Input Raw JSON", action: "Prettify JSON" },
  { slug: "base64-converter", marker: "Input String or File", action: "Convert Now" },
  { slug: "uuid-generator", marker: "Quantity (1 - 100)", action: "Generate UUIDs" },
  { slug: "url-encoder", marker: "Raw URL or Query Parameter", action: "URL Encode" },
  { slug: "case-converter", marker: "Source Text", action: "Converted Variations" },
  { slug: "timestamp-converter", marker: "Unix Timestamp → Human Date", action: "Use now" },
  { slug: "text-compare", marker: "Original Text", action: "Compare Texts" },
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
      await expect(page.getByText(tool.marker, { exact: false })).toBeVisible();
      await expect(page.getByText(tool.action, { exact: false })).toBeVisible();
    });
  }
});
