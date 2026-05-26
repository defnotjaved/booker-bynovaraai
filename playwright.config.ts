import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60_000,
  use: {
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
