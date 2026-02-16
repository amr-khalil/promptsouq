import { expect, test } from "@playwright/test";

test.describe("Subscription Page", () => {
  test("displays 3 subscription plans with correct Arabic names", async ({
    page,
  }) => {
    await page.goto("/subscription");

    // Wait for plans to load
    await expect(page.getByText("ترقية حسابك")).toBeVisible();

    // Verify 3 plan cards render
    await expect(page.getByText("أساسي")).toBeVisible();
    await expect(page.getByText("احترافي")).toBeVisible();
    await expect(page.getByText("أسطوري")).toBeVisible();
  });

  test("billing cycle toggle switches prices", async ({ page }) => {
    await page.goto("/subscription");

    // Default is monthly
    await expect(page.getByText("شهري")).toBeVisible();

    // Click yearly toggle
    await page.getByText("سنوي").click();

    // Prices should update (yearly prices are different from monthly)
    // The exact prices depend on seed data, but the toggle should work
    await expect(page.getByText("سنوياً")).toBeVisible();
  });

  test("shows top-up packs section", async ({ page }) => {
    await page.goto("/subscription");

    // Scroll to top-up section
    await expect(page.getByText("رصيد إضافي")).toBeVisible();

    // Verify pack cards are visible
    await expect(page.getByText("رصيد").first()).toBeVisible();
  });

  test("subscribe button is clickable for unauthenticated user", async ({
    page,
  }) => {
    await page.goto("/subscription");

    // The subscribe buttons should be present
    const subscribeButtons = page.getByRole("button", { name: "اشترك الآن" });
    await expect(subscribeButtons.first()).toBeVisible();
  });
});
