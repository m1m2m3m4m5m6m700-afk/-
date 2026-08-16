import { expect, test } from "playwright/test";

test.describe("Flex interactive chat", () => {
  test("supports multi-turn conversation and session persistence", async ({ page }) => {
    test.setTimeout(60_000);
    const requests: Array<{ message?: unknown; history?: unknown; locale?: unknown }> = [];
    let responseNumber = 0;

    await page.route("**/api/chat", async (route) => {
      const request = route.request();
      requests.push(request.postDataJSON() as { message?: unknown; history?: unknown; locale?: unknown });
      responseNumber += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: responseNumber === 1 ? "أهلًا! كيف أساعدك؟" : "نعم، أتذكر رسالتك السابقة داخل هذه المحادثة.",
          model: "playwright-mock",
          provider: "test",
        }),
      });
    });

    await page.goto("/");

    const chat = page.getByTestId("flex-chat");
    await expect(chat).toHaveAttribute("data-hydrated", "true", { timeout: 30_000 });

    const composer = chat.getByTestId("flex-composer");
    await expect(composer).toBeVisible();
    await expect(composer).toBeEnabled();

    await composer.fill("مرحبا");
    const firstResponse = page.waitForResponse(
      (response) => response.url().includes("/api/chat") && response.status() === 200,
    );
    await composer.press("Enter");
    await firstResponse;

    await expect.poll(() => requests.length, { timeout: 10_000 }).toBe(1);
    await expect(chat.getByText("أهلًا! كيف أساعدك؟")).toBeVisible();
    expect(requests[0]?.message).toBe("مرحبا");
    expect(Array.isArray(requests[0]?.history)).toBe(true);

    await composer.fill("هل تتذكرني؟");
    const secondResponse = page.waitForResponse(
      (response) => response.url().includes("/api/chat") && response.status() === 200,
    );
    await composer.press("Enter");
    await secondResponse;

    await expect.poll(() => requests.length, { timeout: 10_000 }).toBe(2);
    await expect(chat.getByText("نعم، أتذكر رسالتي السابقة داخل هذه المحادثة.").or(chat.getByText("نعم، أتذكر رسالتك السابقة داخل هذه المحادثة."))).toBeVisible();

    const secondHistory = requests[1]?.history;
    expect(secondHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "مرحبا" }),
        expect.objectContaining({ role: "assistant", content: "أهلًا! كيف أساعدك؟" }),
      ]),
    );

    await page.reload();

    const reloadedChat = page.getByTestId("flex-chat");
    await expect(reloadedChat).toHaveAttribute("data-hydrated", "true", { timeout: 30_000 });
    await expect(reloadedChat.getByText("مرحبا")).toBeVisible();
    await expect(reloadedChat.getByText("أهلًا! كيف أساعدك؟")).toBeVisible();
    await expect(reloadedChat.getByText("هل تتذكرني؟")).toBeVisible();
  });

  test("supports quick prompts and a clean new conversation", async ({ page }) => {
    test.setTimeout(60_000);
    let responseNumber = 0;

    await page.route("**/api/chat", async (route) => {
      responseNumber += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: `mock-reply-${responseNumber}`,
          model: "playwright-mock",
          provider: "test",
        }),
      });
    });

    await page.goto("/");

    const chat = page.getByTestId("flex-chat");
    await expect(chat).toHaveAttribute("data-hydrated", "true", { timeout: 30_000 });

    const quickPrompt = chat.getByTestId("flex-quick-prompt-0");
    await expect(quickPrompt).toBeVisible({ timeout: 10_000 });
    await expect(quickPrompt).toBeEnabled();

    const quickPromptResponse = page.waitForResponse(
      (response) => response.url().includes("/api/chat") && response.status() === 200,
    );
    await quickPrompt.click();
    await quickPromptResponse;
    await expect.poll(() => responseNumber, { timeout: 10_000 }).toBe(1);
    await expect(chat.getByText("mock-reply-1")).toBeVisible();

    const newChat = chat.getByTestId("flex-new-chat");
    await expect(newChat).toBeEnabled();
    await newChat.click();
    await expect(chat.getByText(/suggestion|translate|writing|utility/i).first()).toBeVisible();
    await expect(chat.getByText("mock-reply-1")).not.toBeVisible();
  });
});
