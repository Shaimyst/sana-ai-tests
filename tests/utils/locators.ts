import type { Locator } from "@playwright/test";

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isVisible = async (locator: Locator) => {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
};

export const clickFirstVisible = async (
  label: string,
  ...locators: Locator[]
) => {
  for (const locator of locators) {
    if (await isVisible(locator)) {
      await locator.click();
      return;
    }
  }
  throw new Error(`Unable to find clickable ${label}.`);
};

export const fillFirstVisible = async (
  label: string,
  value: string,
  ...locators: Locator[]
) => {
  for (const locator of locators) {
    if (await isVisible(locator)) {
      await locator.fill(value);
      return;
    }
  }
  throw new Error(`Unable to find input ${label}.`);
};
