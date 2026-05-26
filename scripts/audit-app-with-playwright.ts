import { chromium, devices, type Page, type Route } from "@playwright/test";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

type ScreenshotEntry = {
  filename: string;
  url: string;
  description: string;
  notes: string;
};

type IssueEntry = {
  type: "console" | "pageerror" | "requestfailed" | "response";
  pageLabel: string;
  url: string;
  detail: string;
};

const BASE_URL = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const OWNER_EMAIL = process.env.AUDIT_OWNER_EMAIL ?? "anil@iconbook.local";
const OWNER_PASSWORD = process.env.AUDIT_OWNER_PASSWORD ?? "admin123";
const BARBER_EMAIL = process.env.AUDIT_BARBER_EMAIL ?? "shivam@iconbook.local";
const BARBER_PASSWORD = process.env.AUDIT_BARBER_PASSWORD ?? "barber123";
const CAPTURED_ON = new Date().toISOString().slice(0, 10);

const DOCS_DIR = path.join(process.cwd(), "docs");
const SCREENSHOT_DIR = path.join(DOCS_DIR, "proposal-screenshots");

const screenshots: ScreenshotEntry[] = [];
const issues: IssueEntry[] = [];
const visitedUrls = new Set<string>();

let screenshotCounter = 1;

function pad(n: number) {
  return String(n).padStart(3, "0");
}

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function trackPage(page: Page, pageLabel: string) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      issues.push({
        type: "console",
        pageLabel,
        url: page.url(),
        detail: msg.text(),
      });
    }
  });

  page.on("pageerror", (err) => {
    issues.push({
      type: "pageerror",
      pageLabel,
      url: page.url(),
      detail: err.message,
    });
  });

  page.on("requestfailed", (req) => {
    issues.push({
      type: "requestfailed",
      pageLabel,
      url: page.url(),
      detail: `${req.method()} ${req.url()} -> ${req.failure()?.errorText ?? "unknown failure"}`,
    });
  });

  page.on("response", (res) => {
    if (res.status() >= 400) {
      issues.push({
        type: "response",
        pageLabel,
        url: page.url(),
        detail: `${res.status()} ${res.request().method()} ${res.url()}`,
      });
    }
  });

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      visitedUrls.add(frame.url());
    }
  });
}

async function waitForPage(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1200);
}

async function saveScreenshot(page: Page, name: string, description: string, notes: string) {
  await waitForPage(page);
  const filename = `${pad(screenshotCounter)}-${slug(name)}.png`;
  const fullPath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: fullPath, fullPage: true });
  screenshots.push({
    filename,
    url: page.url(),
    description,
    notes,
  });
  screenshotCounter += 1;
}

async function goto(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await waitForPage(page);
}

async function login(page: Page, email: string, password: string) {
  await goto(page, `${BASE_URL}/login`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await Promise.all([
    page.waitForURL(/\/dashboard/),
    page.getByRole("button", { name: /sign in to iconbook/i }).click(),
  ]);
  await waitForPage(page);
}

async function capturePublicDesktop() {
  const context = await chromium.launchPersistentContext("", {
    headless: true,
    viewport: { width: 1440, height: 1100 },
  });
  try {
    const page = context.pages()[0] ?? await context.newPage();
    trackPage(page, "public-desktop");

    await goto(page, BASE_URL);
    await saveScreenshot(
      page,
      "homepage-desktop",
      "Public landing page on desktop.",
      "Shows the public marketing page, service highlights, and Icon Barbers branding."
    );

    await goto(page, `${BASE_URL}/book`);
    await saveScreenshot(
      page,
      "booking-general-desktop",
      "General booking page on desktop.",
      "Shows the live booking form with service, date, barber, slot, and customer detail fields."
    );

    await page.getByLabel("Barber").selectOption("barber-shivam");
    await waitForPage(page);
    const enabledSlot = page.locator("button.time-slot").first();
    if (await enabledSlot.count()) {
      await enabledSlot.click();
    }
    await saveScreenshot(
      page,
      "booking-slot-selected-desktop",
      "Booking page with slot selected on desktop.",
      "Shows an available slot selected before customer confirmation details are submitted."
    );

    await page.getByLabel("Name").fill("Audit Customer");
    await page.getByLabel("Phone").fill("868-555-9090");
    await page.getByLabel("Email").fill("audit.customer@example.com");
    await saveScreenshot(
      page,
      "booking-form-filled-desktop",
      "Completed booking form on desktop.",
      "Shows the booking form with service, barber, slot, and customer information entered."
    );

    await page.route("**/api/appointments", async (route: Route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          appointment: {
            id: "audit-mock-appointment",
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            customerEmail: body.customerEmail,
            barberId: body.barberId,
            serviceId: body.serviceId,
            date: body.date,
            startTime: body.startTime,
            endTime: body.startTime,
            status: "booked",
            source: "online",
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.getByRole("button", { name: /confirm booking/i }).click();
    await page.getByText(/booking confirmed/i).waitFor({ timeout: 10_000 });
    await saveScreenshot(
      page,
      "booking-confirmed-desktop",
      "Mocked booking success state on desktop.",
      "Safe client-side confirmation capture without writing a new appointment to the database."
    );

    await goto(page, `${BASE_URL}/book/anil`);
    await saveScreenshot(
      page,
      "barber-specific-booking-desktop",
      "Barber-specific booking route on desktop.",
      "Demonstrates the preferred-barber booking link flow."
    );

    await goto(page, `${BASE_URL}/login`);
    await saveScreenshot(
      page,
      "login-desktop",
      "Staff login page on desktop.",
      "Public authentication entry for owner and barber accounts."
    );
  } finally {
    await context.close();
  }
}

async function captureOwnerDesktop() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  try {
    const page = await context.newPage();
    trackPage(page, "owner-desktop");

    await login(page, OWNER_EMAIL, OWNER_PASSWORD);
    await saveScreenshot(
      page,
      "dashboard-today-desktop",
      "Owner dashboard today view on desktop.",
      "Shows KPI cards, walk-in intake form, and shared appointment book."
    );

    const walkInCard = page.locator(".walkin-card");
    await walkInCard.locator("input").nth(0).fill("Audit Walk-in");
    await walkInCard.locator("input").nth(1).fill("868-555-8080");
    await saveScreenshot(
      page,
      "walkin-form-desktop",
      "Owner walk-in form filled on desktop.",
      "Captures the walk-in intake workflow without submitting to the database."
    );

    await goto(page, `${BASE_URL}/dashboard/calendar`);
    await saveScreenshot(
      page,
      "calendar-desktop",
      "Owner shared calendar view on desktop.",
      "Displays multi-barber schedule columns and time grid."
    );

    await goto(page, `${BASE_URL}/dashboard/analytics`);
    await saveScreenshot(
      page,
      "analytics-desktop",
      "Owner analytics view on desktop.",
      "Shows revenue, attendance, barber performance, and notification log sections."
    );

    await goto(page, `${BASE_URL}/dashboard/settings`);
    await saveScreenshot(
      page,
      "settings-desktop",
      "Owner settings view on desktop.",
      "Shows owner controls, weekly availability management, and service administration."
    );

    await page.getByRole("button", { name: /^Add Service$/i }).click();
    await waitForPage(page);
    await saveScreenshot(
      page,
      "services-add-form-desktop",
      "Expanded add-service form on desktop.",
      "Captures service management creation UI without persisting changes."
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

async function captureBarberDesktop() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  try {
    const page = await context.newPage();
    trackPage(page, "barber-desktop");

    await login(page, BARBER_EMAIL, BARBER_PASSWORD);
    await saveScreenshot(
      page,
      "barber-dashboard-desktop",
      "Barber dashboard today view on desktop.",
      "Shows role-filtered appointments and barber-specific operational view."
    );

    await goto(page, `${BASE_URL}/dashboard/analytics`);
    await waitForPage(page);
    await saveScreenshot(
      page,
      "barber-restricted-route-desktop",
      "Barber access restriction on desktop.",
      "Barber access to owner-only dashboard routes redirects back to the personal dashboard."
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

async function captureResponsive() {
  const browser = await chromium.launch({ headless: true });
  try {
    const mobileContext = await browser.newContext({
      ...devices["Pixel 5"],
      baseURL: BASE_URL,
    });
    const mobilePage = await mobileContext.newPage();
    trackPage(mobilePage, "mobile");

    await goto(mobilePage, BASE_URL);
    await saveScreenshot(
      mobilePage,
      "homepage-mobile",
      "Public landing page on mobile.",
      "Responsive mobile layout for the public marketing and booking entry page."
    );

    await goto(mobilePage, `${BASE_URL}/login`);
    await saveScreenshot(
      mobilePage,
      "login-mobile",
      "Staff login page on mobile.",
      "Responsive mobile authentication layout."
    );

    await login(mobilePage, OWNER_EMAIL, OWNER_PASSWORD);
    await saveScreenshot(
      mobilePage,
      "dashboard-mobile",
      "Owner dashboard on mobile.",
      "Responsive mobile dashboard layout with compact navigation and operational cards."
    );
    await mobileContext.close();

    const tabletContext = await browser.newContext({
      ...devices["iPad (gen 7) landscape"],
      baseURL: BASE_URL,
    });
    const tabletPage = await tabletContext.newPage();
    trackPage(tabletPage, "tablet");

    await login(tabletPage, OWNER_EMAIL, OWNER_PASSWORD);
    await saveScreenshot(
      tabletPage,
      "dashboard-tablet",
      "Owner dashboard on tablet.",
      "Responsive tablet view balancing dashboard density and readability."
    );
    await tabletContext.close();
  } finally {
    await browser.close();
  }
}

async function writeIndexes() {
  const screenshotIndex = [
    "# Screenshot Index",
    "",
    ...screenshots.map((entry) => [
      `## ${entry.filename}`,
      `- URL: ${entry.url}`,
      `- Description: ${entry.description}`,
      `- Notes: ${entry.notes}`,
      "",
    ].join("\n")),
  ].join("\n");

  const screenshotsDoc = [
    "# Playwright Screenshot Register",
    "",
    `Audit date: ${CAPTURED_ON}`,
    "",
    "| Filename | Feature | Proof | Date | URL |",
    "| --- | --- | --- | --- | --- |",
    ...screenshots.map((entry) =>
      `| ${entry.filename} | ${entry.description} | ${entry.notes} | ${CAPTURED_ON} | ${entry.url} |`
    ),
    "",
    "## Issues captured",
    "",
    issues.length
      ? issues.map((issue) => `- [${issue.type}] ${issue.pageLabel}: ${issue.detail}`).join("\n")
      : "- No browser errors or failed requests were captured during this run.",
  ].join("\n");

  await writeFile(path.join(SCREENSHOT_DIR, "index.md"), screenshotIndex, "utf8");
  await writeFile(path.join(DOCS_DIR, "SCREENSHOTS.md"), screenshotsDoc, "utf8");
  await writeFile(path.join(DOCS_DIR, "visited-urls.json"), JSON.stringify([...visitedUrls].sort(), null, 2), "utf8");
  await writeFile(path.join(DOCS_DIR, "playwright-issues.json"), JSON.stringify(issues, null, 2), "utf8");
  await writeFile(path.join(DOCS_DIR, "playwright-summary.json"), JSON.stringify({
    baseUrl: BASE_URL,
    screenshots: screenshots.length,
    visitedUrls: visitedUrls.size,
    issues: issues.length,
  }, null, 2), "utf8");
}

async function ensureDirectories() {
  await mkdir(DOCS_DIR, { recursive: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const existing = await readdir(SCREENSHOT_DIR, { withFileTypes: true });
  await Promise.all(
    existing
      .filter((entry) => entry.isFile() && (entry.name.endsWith(".png") || entry.name === "index.md"))
      .map((entry) => rm(path.join(SCREENSHOT_DIR, entry.name), { force: true }))
  );
}

async function main() {
  await ensureDirectories();
  await capturePublicDesktop();
  await captureOwnerDesktop();
  await captureBarberDesktop();
  await captureResponsive();
  await writeIndexes();
  console.log(`Audit complete. Captured ${screenshots.length} screenshots.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
