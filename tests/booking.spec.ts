import { expect, test } from "@playwright/test";
import {
  attachDiagnostics,
  capturePageScreenshot,
  isMobileProject,
  readBookingState,
  recordRoute,
  waitForSettled,
  writeAuditReport,
  writeBookingState,
} from "./helpers/artifacts";

function bookingKey(projectName: string) {
  return projectName === "desktop-1440" ? "canonicalBooking" : "mobileBooking";
}

function shouldCreateRealBooking(projectName: string) {
  return projectName === "desktop-1440" || projectName === "mobile-390";
}

function bookingDetailField(
  page: import("@playwright/test").Page,
  kind: "phone" | "name" | "email"
) {
  if (kind === "phone") {
    return page.getByPlaceholder("(868) 000-0000");
  }

  if (kind === "name") {
    return page.getByPlaceholder("Your name");
  }

  return page.getByPlaceholder("you@example.com");
}

async function chooseService(page: import("@playwright/test").Page) {
  const preferred = page.getByRole("button", { name: /^Haircut\b(?!\s*\+)/i }).first();
  const fallback = page
    .getByRole("button", { name: /^Haircut\s+\+\s+Beard\/Touch-up/i })
    .first();
  const service = (await preferred.count()) ? preferred : fallback;
  await expect(service).toBeVisible();
  const label = ((await service.innerText()) ?? "").replace(/\s+/g, " ").trim();
  await service.click();
  return label.startsWith("Haircut +") ? "Haircut + Beard/Touch-up" : "Haircut";
}

async function chooseBarber(page: import("@playwright/test").Page) {
  const options = page.locator(".barber-pick");
  const count = await options.count();

  let chosen = options.nth(Math.min(1, Math.max(0, count - 1)));
  let barberName = "Available barber";

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").replace(/\s+/g, " ").trim();
    if (/anil/i.test(text)) {
      chosen = option;
      barberName = "Anil";
      break;
    }
    if (index > 0) {
      chosen = option;
      barberName = text.replace(/^✂\s*/, "").trim() || barberName;
      break;
    }
  }

  await chosen.click();
  return barberName;
}

test("public booking wizard works across target viewports", async ({ page }, testInfo) => {
  const diagnostics = attachDiagnostics(
    page,
    `booking-${testInfo.project.name}`,
    isMobileProject(testInfo.project.name) ? "mobile" : "booking"
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/");

  const bookingSection = page.locator("#book");
  await bookingSection.scrollIntoViewIfNeeded();
  await waitForSettled(page, 500);

  const serviceName = await chooseService(page);
  await capturePageScreenshot(
    page,
    testInfo,
    `booking-step-1-${testInfo.project.name}`,
    `Booking step 1 ${testInfo.project.name}`,
    { fullPage: true }
  );

  await page.getByRole("button", { name: /^Next$/i }).click();
  await waitForSettled(page, 300);

  const barberName = await chooseBarber(page);
  await capturePageScreenshot(
    page,
    testInfo,
    `booking-step-2-${testInfo.project.name}`,
    `Booking step 2 ${testInfo.project.name}`,
    { fullPage: true }
  );

  await page.getByRole("button", { name: /^Next$/i }).click();
  await waitForSettled(page, 300);

  const day = page.locator(".date-chip:not([disabled])").first();
  await day.click();
  await page.locator(".time-slot:not(.dis)").first().waitFor({ state: "visible" });
  await capturePageScreenshot(
    page,
    testInfo,
    `booking-step-3-${testInfo.project.name}`,
    `Booking step 3 ${testInfo.project.name}`,
    { fullPage: true }
  );

  if (!shouldCreateRealBooking(testInfo.project.name)) {
    await diagnostics.flush();
    await writeAuditReport();
    return;
  }

  const key = bookingKey(testInfo.project.name);
  const existing = await readBookingState(key);
  if (existing) {
    await diagnostics.flush();
    await writeAuditReport();
    return;
  }

  const slot = page.locator(".time-slot:not(.dis)").first();
  await expect(slot).toBeVisible();
  const slotTime = ((await slot.textContent()) ?? "").trim();
  await slot.click();
  await waitForSettled(page, 300);

  const suffix = `${Date.now()}`.slice(-4);
  const customerName = key === "canonicalBooking" ? "Playwright Test Customer" : "Playwright Mobile Test";
  const customerPhone = key === "canonicalBooking" ? `868555${suffix}` : `868556${suffix}`;
  const customerEmail =
    key === "canonicalBooking"
      ? `playwright.desktop.${suffix}@iconbook.local`
      : `playwright.mobile.${suffix}@iconbook.local`;

  await bookingDetailField(page, "phone").fill(customerPhone);
  await bookingDetailField(page, "name").fill(customerName);
  await bookingDetailField(page, "email").fill(customerEmail);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/appointments") && response.request().method() === "POST"
  );

  await page.getByRole("button", { name: /confirm booking/i }).click();
  const response = await responsePromise;
  const payload = await response.json();
  expect(response.ok()).toBeTruthy();
  await page.getByText(/booking confirmed/i).waitFor({ timeout: 20_000 });

  await capturePageScreenshot(
    page,
    testInfo,
    key === "canonicalBooking"
      ? `booking-confirmation-desktop-${testInfo.project.name}`
      : `booking-confirmation-mobile-${testInfo.project.name}`,
    key === "canonicalBooking"
      ? `Booking confirmation desktop ${testInfo.project.name}`
      : `Booking confirmation mobile ${testInfo.project.name}`,
    { fullPage: true }
  );

  await writeBookingState(key, {
    customerName,
    customerPhone,
    customerEmail,
    barberId: payload.appointment.barberId,
    barberName,
    serviceId: payload.appointment.serviceId,
    serviceName,
    date: payload.appointment.date,
    startTime: payload.appointment.startTime,
    project: testInfo.project.name,
    route: page.url(),
  });

  if (slotTime.length === 0) {
    throw new Error("No booking time was captured from the UI.");
  }

  await diagnostics.flush();
  await writeAuditReport();
});
