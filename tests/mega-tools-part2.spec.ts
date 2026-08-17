import { test, expect } from "@playwright/test";
import { getVariantsBatch, prepareMegaToolPage, runMegaToolVariant } from "./helpers/mega-tools-runner";

test("mega-tool batch 2 executes successfully", async ({ page }) => {
  await prepareMegaToolPage(page);
  for (const variant of getVariantsBatch(2)) {
    const result = await runMegaToolVariant(page, variant);
    expect(result.success, `${variant.slug}: ${result.reason ?? "unknown failure"}`).toBeTruthy();
  }
});
