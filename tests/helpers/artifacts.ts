import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

type AuditCategory = "desktop" | "mobile" | "booking" | "admin" | "diagnostic";
type CheckStatus = "pass" | "fail" | "not_run";

type ScreenshotRecord = {
  filename: string;
  label: string;
  route: string;
  project: string;
};

type FindingRecord = {
  category: AuditCategory;
  page: string;
  detail: string;
};

type BookingRecord = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  project: string;
  route: string;
};

type AuditState = {
  routesTested: string[];
  screenshots: ScreenshotRecord[];
  findings: FindingRecord[];
  rootCauses: string[];
  checks: Record<string, { status: CheckStatus; detail: string }>;
  remainingRisks: string[];
  canonicalBooking?: BookingRecord;
  mobileBooking?: BookingRecord;
};

const AUDIT_ROOT = path.join(process.cwd(), "tests", "audit-artifacts");
const SCREENSHOT_DIR = path.join(AUDIT_ROOT, "screenshots");
const STATE_PATH = path.join(AUDIT_ROOT, "state.json");
const REPORT_PATH = path.join(AUDIT_ROOT, "iconbook-audit-report.md");
const PREFERRED_SERVICE_PATTERN = /^Haircut\b(?!\s*\+)/i;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isMobileProject(projectName: string) {
  return projectName === "mobile-390" || projectName === "iphone-375";
}

export function isDesktopProject(projectName: string) {
  return !isMobileProject(projectName);
}

export async function waitForSettled(page: Page, delay = 1200) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(delay);
}

async function readState(): Promise<AuditState> {
  const raw = await readFile(STATE_PATH, "utf8");
  return JSON.parse(raw) as AuditState;
}

async function writeState(state: AuditState) {
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

async function updateState(mutator: (state: AuditState) => void) {
  const state = await readState();
  mutator(state);
  await writeState(state);
}

export async function recordRoute(route: string) {
  await updateState((state) => {
    if (!state.routesTested.includes(route)) {
      state.routesTested.push(route);
    }
  });
}

export async function recordFinding(category: AuditCategory, page: string, detail: string) {
  await updateState((state) => {
    if (!state.findings.some((finding) => finding.category === category && finding.page === page && finding.detail === detail)) {
      state.findings.push({ category, page, detail });
    }
  });
}

export async function recordRootCause(detail: string) {
  await updateState((state) => {
    if (!state.rootCauses.includes(detail)) {
      state.rootCauses.push(detail);
    }
  });
}

export async function recordCheck(name: string, status: CheckStatus, detail: string) {
  await updateState((state) => {
    state.checks[name] = { status, detail };
  });
}

export async function recordRemainingRisk(detail: string) {
  await updateState((state) => {
    if (!state.remainingRisks.includes(detail)) {
      state.remainingRisks.push(detail);
    }
  });
}

export async function readBookingState(key: "canonicalBooking" | "mobileBooking") {
  const state = await readState();
  return state[key];
}

export async function writeBookingState(key: "canonicalBooking" | "mobileBooking", booking: BookingRecord) {
  await updateState((state) => {
    state[key] = booking;
  });
}

export async function capturePageScreenshot(
  page: Page,
  testInfo: TestInfo,
  filename: string,
  label: string,
  options?: { fullPage?: boolean }
) {
  const file = `${slugify(filename)}.png`;
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, file),
    fullPage: options?.fullPage ?? true,
  });

  await updateState((state) => {
    state.screenshots.push({
      filename: file,
      label,
      route: page.url(),
      project: testInfo.project.name,
    });
  });
}

export async function captureLocatorScreenshot(
  locator: Locator,
  page: Page,
  testInfo: TestInfo,
  filename: string,
  label: string
) {
  const file = `${slugify(filename)}.png`;
  await locator.screenshot({ path: path.join(SCREENSHOT_DIR, file) });

  await updateState((state) => {
    state.screenshots.push({
      filename: file,
      label,
      route: page.url(),
      project: testInfo.project.name,
    });
  });
}

export function attachDiagnostics(page: Page, pageLabel: string, category: AuditCategory) {
  const issues = new Set<string>();

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      issues.add(`[console:${message.type()}] ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.add(`[pageerror] ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText ?? "unknown";
    if (errorText === "net::ERR_ABORTED") {
      return;
    }

    issues.add(
      `[requestfailed] ${request.method()} ${request.url()} -> ${errorText}`
    );
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      issues.add(`[response] ${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  return {
    async flush() {
      for (const issue of issues) {
        await recordFinding(category, pageLabel, issue);
      }
    },
  };
}

export async function assertNoHorizontalOverflow(
  page: Page,
  category: AuditCategory,
  pageLabel: string
) {
  const metrics = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  if (metrics.scrollWidth > metrics.width + 1) {
    await recordFinding(
      category,
      pageLabel,
      `Horizontal overflow detected: viewport ${metrics.width}px, document ${metrics.scrollWidth}px.`
    );
  }
}

function bookingDetailField(page: Page, kind: "phone" | "name" | "email") {
  if (kind === "phone") {
    return page.getByPlaceholder("(868) 000-0000");
  }

  if (kind === "name") {
    return page.getByPlaceholder("Your name");
  }

  return page.getByPlaceholder("you@example.com");
}

function buildBookingIdentity(kind: "canonical" | "mobile") {
  const suffix = `${Date.now()}`.slice(-4);
  return {
    customerName: kind === "canonical" ? "Playwright Test Customer" : "Playwright Mobile Test",
    customerPhone: kind === "canonical" ? `868555${suffix}` : `868556${suffix}`,
    customerEmail:
      kind === "canonical"
        ? `playwright.desktop.${suffix}@iconbook.local`
        : `playwright.mobile.${suffix}@iconbook.local`,
  };
}

async function choosePreferredService(page: Page) {
  const preferred = page.getByRole("button", { name: PREFERRED_SERVICE_PATTERN }).first();
  const fallback = page
    .getByRole("button", { name: /^Haircut\s+\+\s+Beard\/Touch-up/i })
    .first();

  const service = (await preferred.count()) ? preferred : fallback;
  await expect(service).toBeVisible();
  const label = ((await service.innerText()) ?? "").replace(/\s+/g, " ").trim();
  await service.click();
  return label.startsWith("Haircut +") ? "Haircut + Beard/Touch-up" : "Haircut";
}

async function choosePreferredBarber(page: Page) {
  const options = page.locator(".barber-pick");
  const count = await options.count();

  let chosen = options.first();
  let barberName = "Any Barber";

  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const text = ((await option.textContent()) ?? "").replace(/\s+/g, " ").trim();
    if (/anil/i.test(text)) {
      chosen = option;
      barberName = "Anil";
      break;
    }
    if (index > 0 && barberName === "Any Barber") {
      chosen = option;
      barberName = text.replace(/^✂\s*/, "").trim() || "Available barber";
    }
  }

  await chosen.click();
  return barberName;
}

async function chooseFirstAvailableSlot(page: Page) {
  const days = page.locator(".date-chip:not([disabled])");
  const day = days.first();
  await day.click();

  const slots = page.locator(".time-slot:not(.dis)");
  await slots.first().waitFor({ state: "visible" });
  const uiTime = ((await slots.first().textContent()) ?? "").trim();
  await slots.first().click();
  return uiTime;
}

export async function createLandingBooking(
  page: Page,
  testInfo: TestInfo,
  options: {
    bookingKey: "canonicalBooking" | "mobileBooking";
    confirmationScreenshotName: string;
    confirmationScreenshotLabel: string;
    captureStepScreenshots: boolean;
  }
) {
  const existing = await readBookingState(options.bookingKey);
  if (existing) return existing;

  const identity = buildBookingIdentity(options.bookingKey === "canonicalBooking" ? "canonical" : "mobile");
  const diagnostics = attachDiagnostics(page, `${options.bookingKey}-flow`, "booking");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForSettled(page);
  await recordRoute("/");

  const bookingSection = page.locator("#book");
  await bookingSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  if (options.captureStepScreenshots) {
    await captureLocatorScreenshot(
      bookingSection,
      page,
      testInfo,
      `booking-section-${testInfo.project.name}`,
      `Booking section ${testInfo.project.name}`
    );
  }

  const serviceName = await choosePreferredService(page);
  if (options.captureStepScreenshots) {
    await capturePageScreenshot(
      page,
      testInfo,
      `booking-step-1-${testInfo.project.name}`,
      `Booking step 1 ${testInfo.project.name}`,
      { fullPage: true }
    );
  }

  await page.getByRole("button", { name: /^Next$/i }).click();
  await page.waitForTimeout(300);

  const barberName = await choosePreferredBarber(page);
  if (options.captureStepScreenshots) {
    await capturePageScreenshot(
      page,
      testInfo,
      `booking-step-2-${testInfo.project.name}`,
      `Booking step 2 ${testInfo.project.name}`,
      { fullPage: true }
    );
  }

  await page.getByRole("button", { name: /^Next$/i }).click();
  await page.waitForTimeout(300);

  if (options.captureStepScreenshots) {
    await capturePageScreenshot(
      page,
      testInfo,
      `booking-step-3-${testInfo.project.name}`,
      `Booking step 3 ${testInfo.project.name}`,
      { fullPage: true }
    );
  }

  await chooseFirstAvailableSlot(page);

  await bookingDetailField(page, "phone").fill(identity.customerPhone);
  await bookingDetailField(page, "name").fill(identity.customerName);
  await bookingDetailField(page, "email").fill(identity.customerEmail);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/appointments") && response.request().method() === "POST"
  );

  await page.getByRole("button", { name: /confirm booking/i }).click();
  const response = await responsePromise;
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to create the audit booking.");
  }

  await page.getByText(/booking confirmed/i).waitFor({ timeout: 20_000 });
  await capturePageScreenshot(
    page,
    testInfo,
    options.confirmationScreenshotName,
    options.confirmationScreenshotLabel,
    { fullPage: true }
  );

  const appointment = payload.appointment as {
    barberId: string;
    date: string;
    serviceId: string;
    startTime: string;
  };

  const booking: BookingRecord = {
    customerName: identity.customerName,
    customerPhone: identity.customerPhone,
    customerEmail: identity.customerEmail,
    barberId: appointment.barberId,
    barberName,
    serviceId: appointment.serviceId,
    serviceName,
    date: appointment.date,
    startTime: appointment.startTime,
    project: testInfo.project.name,
    route: page.url(),
  };

  await writeBookingState(options.bookingKey, booking);
  await diagnostics.flush();
  return booking;
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL ?? process.env.TEST_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Admin credentials missing. Set ADMIN_EMAIL and ADMIN_PASSWORD, or TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD."
    );
  }

  return { email, password };
}

function changedFiles() {
  try {
    const output = execFileSync("git", ["status", "--short"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.replace(/^[ MADRCU?!]{1,2}\s+/, "").trim());
  } catch {
    return [];
  }
}

export async function writeAuditReport() {
  const state = await readState();
  const screenshots = state.screenshots
    .map((item) => `- ${item.filename} - ${item.label} (${item.project})`)
    .join("\n");
  const desktopIssues = state.findings
    .filter((finding) => finding.category === "desktop" || finding.category === "diagnostic")
    .map((finding) => `- ${finding.page}: ${finding.detail}`)
    .join("\n");
  const mobileIssues = state.findings
    .filter((finding) => finding.category === "mobile")
    .map((finding) => `- ${finding.page}: ${finding.detail}`)
    .join("\n");
  const bookingIssues = state.findings
    .filter((finding) => finding.category === "booking")
    .map((finding) => `- ${finding.page}: ${finding.detail}`)
    .join("\n");
  const adminIssues = state.findings
    .filter((finding) => finding.category === "admin")
    .map((finding) => `- ${finding.page}: ${finding.detail}`)
    .join("\n");
  const routes = state.routesTested.map((route) => `- ${route}`).join("\n");
  const filesChanged = changedFiles().map((file) => `- ${file}`).join("\n");
  const rootCauses = state.rootCauses.map((cause) => `- ${cause}`).join("\n");
  const risks = state.remainingRisks.map((risk) => `- ${risk}`).join("\n");

  const markdown = `# IconBook Audit Report

## 1. Summary of tested routes
${routes || "- No routes recorded."}

## 2. Screenshots captured
${screenshots || "- No screenshots captured."}

## 3. Desktop issues found
${desktopIssues || "- No desktop issues recorded in the final run."}

## 4. Mobile issues found
${mobileIssues || "- No mobile issues recorded in the final run."}

## 5. Booking flow issues found
${bookingIssues || "- No booking flow issues recorded in the final run."}

## 6. Admin/dashboard issues found
${adminIssues || "- No admin or dashboard issues recorded in the final run."}

## 7. Database verification result
- ${state.checks.dbVerification?.detail ?? "Not run."}

## 8. Double-booking test result
- ${state.checks.duplicateBooking?.detail ?? "Not run."}

## 9. Root causes
${rootCauses || "- No root causes recorded."}

## 10. Files changed
${filesChanged || "- No tracked file changes detected."}

## 11. Remaining risks or manual checks
${risks || "- No remaining risks recorded."}
`;

  await writeFile(REPORT_PATH, markdown, "utf8");
}
