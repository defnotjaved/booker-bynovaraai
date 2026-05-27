import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

async function globalSetup() {
  const auditRoot = path.join(process.cwd(), "tests", "audit-artifacts");
  const screenshotsDir = path.join(auditRoot, "screenshots");

  await rm(screenshotsDir, { recursive: true, force: true });
  await rm(path.join(auditRoot, "iconbook-audit-report.md"), { force: true });
  await rm(path.join(auditRoot, "state.json"), { force: true });

  await mkdir(screenshotsDir, { recursive: true });
  await writeFile(
    path.join(auditRoot, "state.json"),
    JSON.stringify(
      {
        routesTested: [],
        screenshots: [],
        findings: [],
        rootCauses: [],
        checks: {},
        remainingRisks: [],
      },
      null,
      2
    ),
    "utf8"
  );
}

export default globalSetup;
