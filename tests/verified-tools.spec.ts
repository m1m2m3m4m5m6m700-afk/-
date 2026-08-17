import { test, expect } from "playwright/test";
import { VERIFIED_TOOL_SLUGS } from "../src/lib/tool-runtime/readyTools";

const verifiedTools = [
  { slug: "zip-creator", marker: "Create a ZIP archive" },
  { slug: "archive-extractor", marker: "Archive Extractor" },
  { slug: "file-splitter", marker: "File Splitter" },
  { slug: "metadata-viewer", marker: "Inspect file metadata" },
] as const;

test.describe("verified desktop tool registry", () => {
  test("publishes desktop/file tools only", () => {
    expect(VERIFIED_TOOL_SLUGS).toEqual(verifiedTools.map(({ slug }) => slug));
    expect(VERIFIED_TOOL_SLUGS).toHaveLength(verifiedTools.length);
  });

  for (const tool of verifiedTools) {
    test(`${tool.slug} renders a usable desktop runtime`, async ({ page }) => {
      await page.goto(`/tools/${tool.slug}`);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.getByText(tool.marker, { exact: false })).toBeVisible();
      await expect(page.locator('input[type="file"]')).toBeVisible();
    });
  }
});
