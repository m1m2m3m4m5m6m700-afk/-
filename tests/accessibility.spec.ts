import { test, expect } from "@playwright/test";

const publicRoutes = ["/", "/tools/translator"];

test.describe("public accessibility baseline", () => {
  for (const route of publicRoutes) {
    test(`${route} exposes language direction and usable controls`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
      await expect(page.locator("html")).toHaveAttribute("dir", /^(ltr|rtl)$/);

      // Check user-facing controls only. Component libraries such as Radix may
      // render intentionally hidden native controls to support form semantics.
      const controls = page.locator(
        'button:not([aria-hidden="true"]), input:not([aria-hidden="true"]), textarea:not([aria-hidden="true"]), select:not([aria-hidden="true"]), [role="button"]:not([aria-hidden="true"])',
      );
      const count = await controls.count();
      for (let index = 0; index < count; index += 1) {
        const control = controls.nth(index);
        if (!(await control.isVisible().catch(() => false))) continue;
        const disabled = await control.isDisabled().catch(() => false);
        if (disabled) continue;
        const aria = (await control.getAttribute("aria-label"))?.trim();
        const labelledBy = await control.getAttribute("aria-labelledby");
        const text = (await control.innerText().catch(() => "")).trim();
        const name = (await control.getAttribute("name"))?.trim();
        expect(Boolean(aria || labelledBy || text || name)).toBeTruthy();
      }

      const focused = page.locator(":focus-visible");
      await page.keyboard.press("Tab");
      if (await focused.count()) await expect(focused.first()).toBeVisible();
    });

    test(`${route} has no horizontal overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
    });
  }
});
