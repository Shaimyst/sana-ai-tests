import { existsSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  deleteWorkflow,
  getWorkflowsPage,
  navigateToWorkflows,
  openTriggerTypeMenu,
} from "../utils/workflows";

const storageStatePath = process.env.SANA_STORAGE_STATE || "storageState.json";
const hasStorageState = existsSync(storageStatePath);

test.describe("Workflows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    test.skip(!hasStorageState, "Run `npm run auth` to create storageState.json");
  });

  let stepTwoText = "";

  test("create a new workflow with a schedule", async ({ page }) => {
    test.setTimeout(180_000);
    stepTwoText = "Get a cup of coffee";

    await navigateToWorkflows(page);
    const workflowsPage = getWorkflowsPage(page);

    await workflowsPage.createWorkflowButton.click();
    await expect(workflowsPage.newWorkflowHeading).toBeVisible();
    await openTriggerTypeMenu(page);
    await workflowsPage.triggerOptionSetSchedule.click();
    await workflowsPage.taskTimepicker.fill("9:00am");
    await workflowsPage.taskTimepicker.press("Enter");
    await expect(workflowsPage.taskTimepicker).toHaveValue("9:00am");
    await workflowsPage.confirmButton.click();
    await expect(workflowsPage.selectTriggerTypeButton).not.toBeVisible();
    await expect(workflowsPage.addStepButton).toBeVisible();

    // add the first step
    await workflowsPage.addStepButton.click();
    await workflowsPage.tiptapEditor.fill("Say good morninggg to the team");
    await workflowsPage.tiptapEditor.press("Tab");

    await workflowsPage.addStepButton.click();
    await workflowsPage.emptyParagraph.fill(stepTwoText);
    await workflowsPage.paragraphWithText(stepTwoText).last().press("Tab");
    
    await expect(workflowsPage.saveWorkflowButton).toBeEnabled({ timeout: 30_000 });
    await workflowsPage.saveWorkflowButton.click();
    
    // LLM section, maybe grab the LLM response and check it.
    const llmDialog = workflowsPage.llmDialog;
    const selectCategoryButton = workflowsPage.selectCategoryButton;
    const readyToggle = workflowsPage.readyToggle;

    await expect(llmDialog).toBeVisible({ timeout: 60_000 });
    await expect
      .poll(
        async () => {
          if (await selectCategoryButton.isVisible()) return "select-category";
          if (await readyToggle.isVisible()) return "ready";
          return "waiting";
        },
        { timeout: 60_000 }
      )
      .not.toBe("waiting");

    if (await selectCategoryButton.isVisible()) {
      await expect(selectCategoryButton).toBeEnabled({ timeout: 60_000 });
      await selectCategoryButton.click();
      await workflowsPage.selectCategoryLabel
        .getByText("Technology & Engineering")
        .click({ timeout: 30_000 });
      await workflowsPage.doneButton.click();
    }

    await expect(workflowsPage.readyToggle).toBeVisible();
    await workflowsPage.readyToggle.click();
    await expect(workflowsPage.llmDialog).toBeVisible({ timeout: 30_000 });
    await workflowsPage.activateButton.click();
    await expect(workflowsPage.llmDialog).not.toBeVisible({ timeout: 30_000 });

    // clean up (optional)
    // await deleteWorkflow(page);
  });

  test("edit the schedule of a workflow", async ({ page }) => {
    await navigateToWorkflows(page);
    const workflowsPage = getWorkflowsPage(page);

    // search for the workflow with the text "morning"
    await page.getByRole('tab', { name: 'My workflows' }).click();
    await page.getByRole('textbox', { name: 'Search workflows' }).click();
    await page.getByRole('textbox', { name: 'Search workflows' }).fill('morning');
    await page.getByRole("heading", { level: 5, name: /morning/i }).first().click();

    await page.getByRole('button', { name: 'Edit' }).nth(2).click();

    await openTriggerTypeMenu(page);
    await workflowsPage.triggerOptionSetSchedule.click();

    const timeOptions = [
      "8:00am",
      "10:00am",
      "12:00pm",
      "2:00pm",
      "4:00pm",
      "6:00pm",
      "8:00pm",
    ];
    const currentTime = await workflowsPage.taskTimepicker.inputValue();
    const newTime = timeOptions.find((time) => time !== currentTime) ?? "6:00pm";

    await workflowsPage.taskTimepicker.fill(newTime);
    await workflowsPage.taskTimepicker.press("Enter");
    await expect(workflowsPage.taskTimepicker).toHaveValue(newTime);
    await workflowsPage.confirmButton.click();
    await expect(workflowsPage.saveWorkflowButton).toBeEnabled({ timeout: 30_000 });
    await workflowsPage.saveWorkflowButton.click();
  });

  test("run a workflow and verify it succeeds", async ({ page }) => {
    test.setTimeout(180_000);
    await navigateToWorkflows(page);

    await page.getByRole("tab", { name: "My workflows" }).click();
    await page.getByRole("textbox", { name: "Search workflows" }).click();
    await page.getByRole("textbox", { name: "Search workflows" }).fill("morning");
    await page.getByRole("heading", { level: 5, name: /morning/i }).first().click();

    const workflowMenuButton = page
      .locator("main")
      .locator('button[aria-haspopup="menu"]')
      .first();
    await expect(workflowMenuButton).toBeEnabled({ timeout: 30_000 });
    await workflowMenuButton.click();
    await page.getByRole("menuitem", { name: /run now|run workflow|run/i }).click();

    const runsTab = page.getByRole("tab", { name: /runs|history/i });
    if (await runsTab.isVisible()) {
      await runsTab.click();
    }

    await expect(page.getByText(/done/i).first()).toBeVisible({
      timeout: 120_000,
    });
  });

  // need to make sure the workflow has a step to delete
  test.fixme("edit a workflow - delete a step from a workflow", async ({ page }) => {
    await navigateToWorkflows(page);
    const workflowsPage = getWorkflowsPage(page);

    await page.getByRole('tab', { name: 'My workflows' }).click();
    await page.getByRole('textbox', { name: 'Search workflows' }).click();
    await page.getByRole('textbox', { name: 'Search workflows' }).fill('morning');
    // click the workflow title (h5) that contains "morning"
    await page.getByRole("heading", { level: 5, name: /morning/i }).first().click();

    await page.getByRole('button', { name: 'Edit' }).nth(2).click();

    // deletes a step from the workflow
    await page.getByRole('button', { name: 'Delete step' }).first().click();
    await expect(workflowsPage.saveWorkflowButton).toBeEnabled({ timeout: 30_000 });
    await workflowsPage.saveWorkflowButton.click();
  });

});
