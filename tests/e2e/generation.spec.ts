import { expect, test } from "@playwright/test";

test.describe("Generation Flow", () => {
  // Note: These tests require an authenticated user with credits and a purchased prompt.
  // In CI, use Clerk test tokens or a seeded test user.

  test("prompt detail page loads with gallery and sidebar", async ({
    page,
  }) => {
    // Visit market to find a prompt
    await page.goto("/market");
    await expect(page.getByText("السوق")).toBeVisible();

    // Click the first prompt card (if available)
    const firstCard = page.locator("a[href^='/prompt/']").first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page.getByText("عن هذا البرومبت")).toBeVisible();
    }
  });

  test("generation dialog opens from generate button", async ({ page }) => {
    // This test requires a purchased prompt with authenticated user
    // Skip if not authenticated
    test.skip(
      true,
      "Requires authenticated user with purchased prompt and credits",
    );

    // Navigate to a purchased prompt
    await page.goto("/prompt/test-prompt-id");

    // Click generate button
    await page.getByRole("button", { name: "توليد" }).click();

    // Dialog should open
    await expect(page.getByText("توليد المحتوى")).toBeVisible();

    // Should show generation type toggle
    await expect(page.getByText("نوع التوليد")).toBeVisible();

    // Should show model selector
    await expect(page.getByText("النموذج")).toBeVisible();
    await expect(page.getByText("Gemini")).toBeVisible();
    await expect(page.getByText("ChatGPT")).toBeVisible();
    await expect(page.getByText("Claude")).toBeVisible();

    // Should show credit balance
    await expect(page.getByText("رصيدك")).toBeVisible();
  });

  test("generation dialog shows no-credits message when balance is 0", async ({
    page,
  }) => {
    test.skip(
      true,
      "Requires authenticated user with 0 credits",
    );

    await page.goto("/prompt/test-prompt-id");
    await page.getByRole("button", { name: "توليد" }).click();

    // Should show no credits message
    await expect(
      page.getByText("لا يوجد لديك رصيد كافٍ للتوليد"),
    ).toBeVisible();

    // Should show subscribe and buy credits CTAs
    await expect(page.getByText("اشتراك")).toBeVisible();
    await expect(page.getByText("شراء رصيد")).toBeVisible();
  });
});
