import { chromium, type Browser, type BrowserContext } from "@playwright/test";
import { mkdirSync } from "node:fs";

const baseURL = process.env.SANA_BASE_URL || "https://sana.ai/djjMCfzgRmaf";
const storageStatePath = process.env.SANA_STORAGE_STATE || "storageState.json";

const run = async () => {
  const userDataDir = process.env.SANA_USER_DATA_DIR || ".auth/chrome";
  const chromeChannel = process.env.SANA_CHROME_CHANNEL || "chrome";

  let browser: Browser | undefined;
  let context: BrowserContext;

  try {
    mkdirSync(userDataDir, { recursive: true });
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      channel: chromeChannel,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  } catch (error) {
    process.stderr.write(
      `Failed to launch ${chromeChannel}. Falling back to bundled Chromium.\n`
    );
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
  }

  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });

  const googleButton = page.getByRole("button", {
    name: /continue with google|sign in with google/i,
  });
  if (await googleButton.isVisible().catch(() => false)) {
    await googleButton.click();
  }

  process.stdout.write(
    "Complete login in the opened browser. Press Enter here when done.\n"
  );

  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: storageStatePath });
  await context.close();
  await browser?.close();

  process.stdout.write(`Saved storage state to ${storageStatePath}\n`);
};

run().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exit(1);
});
