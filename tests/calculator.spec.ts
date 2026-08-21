import { test, expect } from "@playwright/test";
import { evaluateExpression, formatResult } from "../src/tools/calculator/engine";

test.describe("calculator engine", () => {
  test("evaluates arithmetic and precedence", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
    expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
    expect(evaluateExpression("2^3^2")).toBe(512);
  });

  test("supports scientific functions and angle modes", () => {
    expect(formatResult(evaluateExpression("sin(30)", { angleMode: "deg" }))).toBe("0.5");
    expect(formatResult(evaluateExpression("sin(pi/2)", { angleMode: "rad" }))).toBe("1");
    expect(formatResult(evaluateExpression("sqrt(81) + log(100)")).toBe("11");
    expect(evaluateExpression("5!")).toBe(120);
  });

  test("rejects unsafe or invalid input", () => {
    expect(() => evaluateExpression("alert(1)")).toThrow();
    expect(() => evaluateExpression("1/0")).toThrow();
    expect(() => evaluateExpression("(")).toThrow();
  });
});

test("calculator page performs a real calculation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Scientific calculator" })).toBeVisible();
  const expression = page.getByLabel("calculator expression");
  await expression.fill("2 + 3 * 4");
  await expect(page.getByLabel("calculator result")).toHaveText("14");
  await page.getByRole("button", { name: "=" }).click();
  await expect(page.getByText("2 + 3 * 4", { exact: true })).toBeVisible();
});
