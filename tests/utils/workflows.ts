import { expect, type Page } from "@playwright/test";
import { clickFirstVisible, isVisible } from "./locators";

const workflowsHeadingRegex = /workflows/i;

export const navigateToWorkflows = async (page: Page) => {
  await page.goto("/workflows", { waitUntil: "domcontentloaded" }).catch(async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  if (page.url().includes("select-workspace")) {
    const workspacePath = new URL(process.env.SANA_BASE_URL || "https://sana.ai/djjMCfzgRmaf").pathname;
    const workspaceLink = page.locator(`a[href="${workspacePath}"]`).first();

    if (await isVisible(workspaceLink)) {
      await workspaceLink.click();
    } else {
      const fallbackWorkspaceLink = page.locator('a[href^="/"]').first();
      if (await isVisible(fallbackWorkspaceLink)) {
        await fallbackWorkspaceLink.click();
      }
    }
  }

  const workflowsHeading = page.getByRole("heading", { name: workflowsHeadingRegex });
  const workflowsLink = page.getByRole("link", { name: /workflows/i });

  if (await isVisible(workflowsLink)) {
    await workflowsLink.click();
  } else {
    await page.goto("/workflows", { waitUntil: "domcontentloaded" });
  }

  await page.waitForURL(/\/workflows/, { timeout: 15_000 });

  const primaryHeading = workflowsHeading.first();
  if (await isVisible(primaryHeading)) {
    return;
  }

  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("link", { name: "Workflows" }).click();
  await page.waitForURL(/\/workflows/, { timeout: 15_000 });
  await expect(primaryHeading).toBeVisible();
};

export const getWorkflowsPage = (page: Page) => ({
  createWorkflowButton: page.getByRole("button", { name: /create workflow|new workflow/i }),
  newWorkflowHeading: page.getByRole("heading", { name: "New workflow" }),
  selectTriggerTypeButton: page.getByRole("button", { name: /select trigger type/i }),
  changeTriggerTypeButton: page.getByRole("button", { name: /change trigger type/i }),
  configureTriggerOptionsButton: page.getByRole("button", { name: /configure trigger options/i }),
  triggerOptionSetSchedule: page.getByRole("menuitem", { name: /set a schedule/i }),
  taskTimepicker: page.getByTestId("task-timepicker"),
  confirmButton: page.getByRole("button", { name: "Confirm" }),
  addStepButton: page.getByRole("button", { name: "Add step" }),
  tiptapEditor: page.locator(".tiptap"),
  emptyParagraph: page.getByRole("paragraph").filter({ hasText: /^$/ }),
  paragraphWithText: (text: string) => page.getByRole("paragraph").filter({ hasText: text }),
  saveWorkflowButton: page.getByRole("button", { name: "Save workflow" }),
  llmDialog: page.getByRole("dialog"),
  selectCategoryButton: page.getByRole("button", { name: "Select category" }),
  readyToggle: page.getByRole("switch", { name: "Ready Turn on" }),
  selectCategoryLabel: page.getByLabel("Select category"),
  categoryTechEngineering: page.getByText("Technology & Engineering"),
  doneButton: page.getByRole("button", { name: "Done" }),
  activateButton: page.getByRole("button", { name: "Activate" }),
  blockingOverlay: page.locator(
    "#portal-root .z-\\(--z-modal-overlay\\):not(.pointer-events-none)"
  ),
  outletEmptyButton: page.locator("#outlet").getByRole("button").filter({ hasText: /^$/ }),
  deleteWorkflowMenuItem: page.getByRole("menuitem", { name: "Delete workflow" }),
  confirmDeletionHeading: page.getByRole("heading", { name: "Confirm deletion" }),
});

export const openTriggerTypeMenu = async (page: Page) => {
  const workflowsPage = getWorkflowsPage(page);
  await clickFirstVisible(
    "trigger type button",
    workflowsPage.selectTriggerTypeButton,
    workflowsPage.changeTriggerTypeButton,
    workflowsPage.configureTriggerOptionsButton
  );
};

/**
 * Deletes a workflow from the workflows overview/list page.
 * Assumes the workflow action menu is available from the list row.
 */
export const deleteWorkflow = async (page: Page) => {
  await expect(page.locator("#portal-root .z-\\(--z-modal-overlay\\):not(.pointer-events-none)")).toHaveCount(0, { timeout: 30_000 });
  await page.locator("#outlet").getByRole("button").filter({ hasText: /^$/ }).click();
  await expect(page.getByRole("menuitem", { name: "Delete workflow" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Delete workflow" }).click();
  await page.getByRole("heading", { name: "Confirm deletion" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
};
