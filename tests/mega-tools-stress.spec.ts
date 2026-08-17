import { expect, test } from "@playwright/test";
import { getVariantsBatch, prepareMegaToolPage, runMegaToolVariant } from "./helpers/mega-tools-runner";

test.describe("Mega-tools stress gate", () => {
  test.setTimeout(120000);

  test("representative variants survive repeated execution", async ({ page }) => {
    await prepareMegaToolPage(page);

    const candidates = getVariantsBatch(1).filter((variant) =>
      ["images", "video", "audio", "pdf"].includes(variant.category),
    );
    const selected = [
      candidates.find((variant) => variant.category === "images"),
      candidates.find((variant) => variant.category === "video"),
      candidates.find((variant) => variant.category === "audio"),
      candidates.find((variant) => variant.category === "pdf"),
    ].filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));

    expect(selected).toHaveLength(4);

    for (const variant of selected) {
      for (let iteration = 1; iteration <= 3; iteration += 1) {
        await test.step(`${variant.slug} iteration ${iteration}`, async () => {
          const result = await runMegaToolVariant(page, variant);
          expect(result.success, `${variant.slug} iteration ${iteration}: ${result.reason ?? "unknown failure"}`).toBeTruthy();
        });
      }
    }
  });
});
