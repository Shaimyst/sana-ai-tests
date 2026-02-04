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

  test("create/delete a workflow", async ({ page }) => {
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
    
    const saveWorkflowButton = workflowsPage.saveWorkflowButton;
    await expect(saveWorkflowButton).toBeEnabled({ timeout: 30_000 });
    await saveWorkflowButton.click();
    
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

    // clean up
    await deleteWorkflow(page);
  });

});
