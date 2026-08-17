import { expect, test } from "playwright/test";

test.describe("Flex interactive chat", () => {
  test.setTimeout(60_000);

  test("supports multi-turn conversation and session persistence", async ({ page }) => {
    const requests: Array<{ message?: unknown; history?: unknown; locale?: unknown }> = [];

    await page.route("**/api/chat**", async (route) => {
      const request = route.request();
      requests.push(request.postDataJSON() as { message?: unknown; history?: unknown; locale?: unknown });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "deterministic test reply", model: "playwright-mock", provider: "test" }),
      });
    });

    await page.goto("/");

    const chat = page.getByTestId("flex-chat");
    await expect(chat).toHaveAttribute("data-chat-ready", "true");
    const composer = chat.getByRole("textbox");
    const submitButton = chat.locator('button[type="submit"]');
    const aiMessages = chat.locator('[data-testid="chat-message"][data-sender="assistant"]');
    const allMessages = chat.locator('[data-testid="chat-message"]');

    await composer.fill("مرحبا");
    await expect(submitButton).toBeEnabled();
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/chat") && res.status() === 200),
      submitButton.click(),
    ]);

    await expect(aiMessages).toHaveCount(1, { timeout: 15_000 });
    await expect(aiMessages.first()).not.toHaveText("");
    expect(requests).toHaveLength(1);
    expect(requests[0]?.message).toBe("مرحبا");
    expect(Array.isArray(requests[0]?.history)).toBe(true);

    await composer.fill("هل تتذكرني؟");
    await expect(submitButton).toBeEnabled();
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/chat") && res.status() === 200),
      submitButton.click(),
    ]);

    await expect(aiMessages).toHaveCount(2, { timeout: 15_000 });
    await expect(aiMessages.nth(1)).not.toHaveText("");
    await expect(allMessages).toHaveCount(4);
    expect(requests).toHaveLength(2);

    const secondHistory = requests[1]?.history;
    expect(secondHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "مرحبا" }),
        expect.objectContaining({ role: "assistant", content: "deterministic test reply" }),
      ]),
    );

    await page.reload();
    const reloadedChat = page.getByTestId("flex-chat");
    await expect(reloadedChat).toHaveAttribute("data-chat-ready", "true");
    await expect(reloadedChat.locator('[data-testid="chat-message"]')).toHaveCount(4);
    await expect(reloadedChat.getByText("مرحبا")).toBeVisible();
    await expect(reloadedChat.getByText("هل تتذكرني؟")).toBeVisible();
    await expect(reloadedChat.locator('[data-testid="chat-message"][data-sender="assistant"]').first()).not.toHaveText("");
  });

  test("supports quick prompts and a clean new conversation", async ({ page }) => {
    await page.route("**/api/chat**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "deterministic quick-prompt reply", model: "playwright-mock", provider: "test" }),
      });
    });

    await page.goto("/");

    const chat = page.getByTestId("flex-chat");
    await expect(chat).toHaveAttribute("data-chat-ready", "true");
    const quickPrompt = chat.getByTestId("chat-quick-prompt").first();
    await expect(quickPrompt).toBeVisible();
    await expect(quickPrompt).not.toHaveText("");

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/chat") && res.status() === 200),
      quickPrompt.click(),
    ]);

    const aiMessages = chat.locator('[data-testid="chat-message"][data-sender="assistant"]');
    await expect(aiMessages).toHaveCount(1, { timeout: 15_000 });
    await expect(aiMessages.first()).not.toHaveText("");

    await chat.getByTitle("New chat").click();
    await expect(chat.locator('[data-testid="chat-message"]')).toHaveCount(0);
    await expect(chat.getByTestId("chat-quick-prompt").first()).toBeVisible();
  });
});
