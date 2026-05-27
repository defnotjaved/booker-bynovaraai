import { expect, test } from "@playwright/test";
import {
  attachDiagnostics,
  capturePageScreenshot,
  createLandingBooking,
  getAdminCredentials,
  isMobileProject,
  readBookingState,
  recordCheck,
  recordFinding,
  recordRootCause,
  recordRoute,
  waitForSettled,
  writeAuditReport,
} from "./helpers/artifacts";

test("admin login and dashboard stay usable across supported viewports", async ({ page }, testInfo) => {
  if (testInfo.project.name === "iphone-375") {
    test.skip();
  }

  if (testInfo.project.name === "desktop-1440" && !(await readBookingState("canonicalBooking"))) {
    await createLandingBooking(page, testInfo, {
      bookingKey: "canonicalBooking",
      confirmationScreenshotName: "booking-confirmation-desktop-desktop-1440",
      confirmationScreenshotLabel: "Booking confirmation desktop desktop-1440",
      captureStepScreenshots: false,
    });
  }

  const diagnostics = attachDiagnostics(
    page,
    `admin-${testInfo.project.name}`,
    isMobileProject(testInfo.project.name) || testInfo.project.name === "tablet-768" ? "mobile" : "admin"
  );
  const credentials = getAdminCredentials();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/login");

  await capturePageScreenshot(
    page,
    testInfo,
    `admin-login-${testInfo.project.name}`,
    `Admin login ${testInfo.project.name}`,
    { fullPage: true }
  );

  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await Promise.all([
    page.waitForURL(/\/dashboard$/),
    page.getByRole("button", { name: /sign in to iconbook/i }).click(),
  ]);

  await waitForSettled(page);
  await recordRoute("/dashboard");
  await recordCheck("adminLogin", "pass", "Admin login succeeded with env-provided credentials.");

  if (isMobileProject(testInfo.project.name) || testInfo.project.name === "tablet-768") {
    const menuButton = page.getByRole("button", { name: /open dashboard menu/i }).first();
    const calendarLink = page.getByRole("link", { name: /calendar/i }).first();
    const hasMenu = await menuButton.isVisible().catch(() => false);
    const hasCalendarLink = await calendarLink.isVisible().catch(() => false);

    if (hasMenu) {
      await menuButton.click();
      await expect(calendarLink).toBeVisible();
      const closeButton = page.locator(".mobile-drawer").getByRole("button", { name: /close menu/i });
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    } else if (!hasCalendarLink) {
      await recordFinding(
        "mobile",
        `admin-${testInfo.project.name}`,
        "Dashboard navigation is not accessible on this viewport: no mobile menu trigger and no visible Calendar link."
      );
      await recordRootCause(
        "The deployed dashboard header does not provide a mobile navigation trigger or visible secondary route links at 390px, so Calendar and other admin sections are inaccessible on mobile."
      );
      await diagnostics.flush();
      await writeAuditReport();
      throw new Error("Dashboard navigation is not accessible on this viewport.");
    }
  } else {
    await expect(page.getByRole("link", { name: /calendar/i }).first()).toBeVisible();
  }

  await capturePageScreenshot(
    page,
    testInfo,
    `admin-dashboard-${testInfo.project.name}`,
    `Admin dashboard ${testInfo.project.name}`,
    { fullPage: true }
  );

  const canonicalBooking = await readBookingState("canonicalBooking");
  if (canonicalBooking) {
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill(canonicalBooking.date);
    await waitForSettled(page, 600);
    await expect(page.getByText(canonicalBooking.customerName).first()).toBeVisible();
  }

  await page.goto("/dashboard/calendar", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/dashboard/calendar");

  if (canonicalBooking) {
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill(canonicalBooking.date);
    await waitForSettled(page, 600);
    await expect(page.getByText(canonicalBooking.customerName).first()).toBeVisible();
  }

  await capturePageScreenshot(
    page,
    testInfo,
    `admin-calendar-${testInfo.project.name}`,
    `Admin calendar ${testInfo.project.name}`,
    { fullPage: true }
  );

  await diagnostics.flush();
  await writeAuditReport();
});
