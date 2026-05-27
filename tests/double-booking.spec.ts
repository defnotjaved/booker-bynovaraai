import { expect, test } from "@playwright/test";
import {
  attachDiagnostics,
  createLandingBooking,
  readBookingState,
  recordCheck,
  recordFinding,
  recordRootCause,
  recordRoute,
  waitForSettled,
  writeAuditReport,
} from "./helpers/artifacts";
import { disconnectDb, findAppointmentByPhoneAndDate } from "./helpers/db";

function formatTime(time: string) {
  const [hourRaw, minute] = time.split(":").map(Number);
  const suffix = hourRaw >= 12 ? "PM" : "AM";
  const hour = hourRaw % 12 || 12;
  return `${hour}:${`${minute}`.padStart(2, "0")} ${suffix}`;
}

test("confirmed slots stay blocked in the UI and API", async ({ page, request }, testInfo) => {
  if (testInfo.project.name !== "desktop-1440") {
    test.skip();
  }

  const diagnostics = attachDiagnostics(page, "double-booking-desktop", "booking");
  const booking =
    (await readBookingState("canonicalBooking")) ??
    (await createLandingBooking(page, testInfo, {
      bookingKey: "canonicalBooking",
      confirmationScreenshotName: "booking-confirmation-desktop-desktop-1440",
      confirmationScreenshotLabel: "Booking confirmation desktop desktop-1440",
      captureStepScreenshots: false,
    }));

  const dbRow = await findAppointmentByPhoneAndDate({
    customerPhone: booking.customerPhone,
    date: booking.date,
    startTime: booking.startTime,
  });
  expect(dbRow).not.toBeNull();
  await recordCheck(
    "dbVerification",
    "pass",
    `Supabase/Prisma verification passed for ${booking.customerName} on ${booking.date} at ${booking.startTime}.`
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/");

  await page.locator("#book").scrollIntoViewIfNeeded();
  await waitForSettled(page, 500);

  await expect(page.getByRole("button", { name: /^Haircut\b(?!\s*\+)/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /^Haircut\b(?!\s*\+)/i }).first().click();
  await page.getByRole("button", { name: /^Next$/i }).click();
  await waitForSettled(page, 300);

  const barberOption = page.locator(".barber-pick").filter({ hasText: new RegExp(booking.barberName, "i") }).first();
  await barberOption.click();
  await page.getByRole("button", { name: /^Next$/i }).click();
  await waitForSettled(page, 300);

  const bookingDayNumber = new Date(`${booking.date}T00:00:00`).getDate().toString();
  await page
    .locator(".date-chip:not([disabled])")
    .filter({ has: page.locator(".dc-num", { hasText: bookingDayNumber }) })
    .first()
    .click();
  await waitForSettled(page, 300);

  const bookedSlot = page.locator(".time-slot").filter({ hasText: formatTime(booking.startTime) }).first();
  await expect(bookedSlot).toBeVisible();
  await expect(bookedSlot).toBeDisabled();

  const duplicateResponse = await request.post("/api/appointments", {
    data: {
      customerName: "Playwright Duplicate Attempt",
      customerPhone: "8685570199",
      customerEmail: "playwright.duplicate@iconbook.local",
      serviceId: booking.serviceId,
      barberId: booking.barberId,
      date: booking.date,
      startTime: booking.startTime,
      source: "online",
    },
  });
  if (duplicateResponse.status() !== 409) {
    await recordCheck(
      "duplicateBooking",
      "fail",
      `Duplicate booking prevention failed: UI blocked the slot, but POST /api/appointments returned ${duplicateResponse.status()} instead of 409.`
    );
    await recordFinding(
      "booking",
      "double-booking-desktop",
      `Server accepted a duplicate booking for ${booking.date} ${booking.startTime}; POST /api/appointments returned ${duplicateResponse.status()}.`
    );
    await recordRootCause(
      "The live API still accepts duplicate slot submissions server-side even when the UI disables the slot, which indicates missing last-moment conflict validation in the deployed booking create path."
    );
    await diagnostics.flush();
    await writeAuditReport();
    throw new Error(`Expected duplicate booking to return 409, received ${duplicateResponse.status()}.`);
  }
  await recordCheck(
    "duplicateBooking",
    "pass",
    `Duplicate booking prevention passed: UI disabled ${formatTime(booking.startTime)} and POST /api/appointments returned 409.`
  );

  await diagnostics.flush();
  await writeAuditReport();
  await disconnectDb();
});
