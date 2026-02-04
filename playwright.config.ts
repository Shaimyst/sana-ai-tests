import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const baseURL = process.env.SANA_BASE_URL || "https://sana.ai/djjMCfzgRmaf";
const storageStatePath = process.env.SANA_STORAGE_STATE || "storageState.json";
const storageState = existsSync(storageStatePath) ? storageStatePath : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  projects: [{ name: "chromium" }],
  use: {
    baseURL,
    storageState,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["html", { open: "never" }]],
});
