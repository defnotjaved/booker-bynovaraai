import { expect, test } from "@playwright/test";
import {
  assertNoHorizontalOverflow,
  attachDiagnostics,
  captureLocatorScreenshot,
  capturePageScreenshot,
  isMobileProject,
  recordRoute,
  waitForSettled,
  writeAuditReport,
} from "./helpers/artifacts";

function landingCategory(projectName: string) {
  return projectName === "tablet-768" || isMobileProject(projectName) ? "mobile" : "desktop";
}

test("landing page renders and stays usable across viewports", async ({ page }, testInfo) => {
  const category = landingCategory(testInfo.project.name);
  const diagnostics = attachDiagnostics(page, `landing-${testInfo.project.name}`, category);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/");

  await expect(page).toHaveTitle(/IconBook/);
  await expect(page.getByRole("heading", { name: /icon barbers/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /book appointment/i })).toBeVisible();

  if (category === "mobile") {
    const menuButton = page.getByRole("button", { name: /open menu/i }).first();
    const adminLoginLink = page.getByRole("link", { name: /admin login/i }).first();
    const hasMenu = await menuButton.isVisible().catch(() => false);

    if (hasMenu) {
      await menuButton.click();
      await expect(adminLoginLink).toBeVisible();
      const closeButton = page.locator(".mobile-drawer").getByRole("button", { name: /close menu/i });
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    } else {
      await expect(adminLoginLink).toBeVisible();
    }
  } else {
    await expect(page.getByRole("link", { name: /admin login/i }).first()).toBeVisible();
  }

  await expect(page.getByText(/serving trinidad since 2001/i)).toBeVisible();
  await expect(page.locator("#book")).toBeVisible();
  await expect(page.locator("#services")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#reviews")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.getByText(/ready for a fresh cut/i)).toBeVisible();
  await expect(page.getByText(/#3 chotoo rd, aranguez/i).first()).toBeVisible();

  await capturePageScreenshot(
    page,
    testInfo,
    `landing-page-${testInfo.project.name}`,
    `Landing page ${testInfo.project.name}`,
    { fullPage: true }
  );

  const bookingSection = page.locator("#book");
  await bookingSection.scrollIntoViewIfNeeded();
  await waitForSettled(page, 500);
  await captureLocatorScreenshot(
    bookingSection,
    page,
    testInfo,
    `booking-section-${testInfo.project.name}`,
    `Booking section ${testInfo.project.name}`
  );

  await assertNoHorizontalOverflow(page, category, `landing-${testInfo.project.name}`);
  await diagnostics.flush();
  await writeAuditReport();
});
