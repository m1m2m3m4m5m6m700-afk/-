import { expect, test } from "playwright/test";

test.describe("Flex interactive chat", () => {
  test("supports multi-turn conversation and session persistence", async ({ page }) => {
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

    const chat = page.getByRole("region", { name: "Flex AI chat" });
    await expect(chat).toBeVisible();

    const composer = chat.getByRole("textbox");
    await expect(composer).toBeVisible();

    await composer.fill("مرحبا");
    await composer.press("Enter");

    await expect(chat.getByText("أهلًا! كيف أساعدك؟")).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.message).toBe("مرحبا");
    expect(Array.isArray(requests[0]?.history)).toBe(true);

    await composer.fill("هل تتذكرني؟");
    await composer.press("Enter");

    await expect(chat.getByText("نعم، أتذكر رسالتك السابقة داخل هذه المحادثة.")).toBeVisible();
    expect(requests).toHaveLength(2);

    const secondHistory = requests[1]?.history;
    expect(secondHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "مرحبا" }),
        expect.objectContaining({ role: "assistant", content: "أهلًا! كيف أساعدك؟" }),
      ]),
    );

    await page.reload();

    const reloadedChat = page.getByRole("region", { name: "Flex AI chat" });
    await expect(reloadedChat.getByText("مرحبا")).toBeVisible();
    await expect(reloadedChat.getByText("أهلًا! كيف أساعدك؟")).toBeVisible();
    await expect(reloadedChat.getByText("هل تتذكرني؟")).toBeVisible();
    await expect(reloadedChat.getByText("نعم، أتذكر رسالتك السابقة داخل هذه المحادثة.")).toBeVisible();
  });

  test("supports quick prompts and a clean new conversation", async ({ page }) => {
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

    const chat = page.getByRole("region", { name: "Flex AI chat" });
    const quickPrompt = chat.getByRole("button", { name: "It looks like you want to translate text. The AI Translator is ready for you." });
    await expect(quickPrompt).toBeVisible();
    await quickPrompt.click();
    await expect(chat.getByText("mock-reply-1")).toBeVisible();

    await chat.getByTitle("New chat").click();
    await expect(chat.getByText("Your suggestion appears here")).toBeVisible();
    await expect(chat.getByText("mock-reply-1")).not.toBeVisible();
  });
});
