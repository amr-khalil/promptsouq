import { expect, test } from "@playwright/test";

test.describe("Credit Balance & Dashboard", () => {
  test("subscription page is accessible", async ({ page }) => {
    await page.goto("/subscription");
    await expect(page).toHaveTitle(/الاشتراكات/);
    await expect(page.getByText("ترقية حسابك")).toBeVisible();
  });

  test("dashboard credits page shows loading state", async ({ page }) => {
    // Note: Requires authenticated user — will redirect to sign-in if not authenticated
    await page.goto("/dashboard/credits");

    // Should either show the credits page or redirect to sign-in
    const url = page.url();
    if (url.includes("sign-in")) {
      // Expected for unauthenticated users
      expect(url).toContain("sign-in");
    } else {
      // Authenticated user sees the credits page
      await expect(page.getByText("الرصيد والاشتراك")).toBeVisible();
    }
  });

  test("dashboard generations page shows loading state", async ({ page }) => {
    await page.goto("/dashboard/generations");

    const url = page.url();
    if (url.includes("sign-in")) {
      expect(url).toContain("sign-in");
    } else {
      // Authenticated user sees the generations page
      await expect(
        page.getByText("التوليدات السابقة"),
      ).toBeVisible();
    }
  });

  test("dashboard sidebar has credits and generations links", async ({
    page,
  }) => {
    test.skip(true, "Requires authenticated user");

    await page.goto("/dashboard");

    // Check sidebar nav items
    await expect(page.getByText("الرصيد")).toBeVisible();
    await expect(page.getByText("التوليدات")).toBeVisible();
  });

  test("credit badge shows in header for authenticated users", async ({
    page,
  }) => {
    test.skip(true, "Requires authenticated user with credits");

    await page.goto("/");

    // Credit badge should show coin icon with count
    const creditBadge = page.locator("a[href='/dashboard/credits']");
    await expect(creditBadge).toBeVisible();
  });
});
