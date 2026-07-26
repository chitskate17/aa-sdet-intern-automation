import { test, expect } from '@playwright/test';
import { LoginPage }     from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TaskBotPage }   from '../pages/TaskBotPage';

/**
 * Use Case 1: Task Bot Creation — Full E2E Automation
 * Single Unified Flow per user request.
 */

const getBotName = () => `Playwright_UC1_${Date.now()}`;
const MESSAGE_TEXT = 'Hello from Playwright automation!';

test('Use Case 1: End-to-End Task Bot Creation', async ({ page }) => {
  const login     = new LoginPage(page);
  const dashboard = new DashboardPage(page);
  const taskBot   = new TaskBotPage(page);

  await test.step('1. Login to AA Community Edition', async () => {
    await login.goto();
    await login.login(
      process.env.AA_EMAIL    ?? '',
      process.env.AA_PASSWORD ?? ''
    );
    await login.assertLoggedIn();
  });

  await test.step('2. Navigate to Automation page', async () => {
    await dashboard.navigateToAutomation();
    await dashboard.assertOnAutomationPage();
    await dashboard.assertCreateDropdownVisible();
  });

  await test.step('3. Open Create Task Bot dialog', async () => {
    await dashboard.selectTaskBot();
    await taskBot.assertCreateDialogVisible();
  });

  await test.step('4. Fill bot name and open editor', async () => {
    const botName = getBotName();
    await taskBot.fillBotName(botName);
    await expect(page.locator('input[name="name"]')).toHaveValue(botName);
    
    await taskBot.clickCreateAndEdit();
    await taskBot.assertEditorLoaded();
  });

  await test.step('5. Search for Message Box and add it to canvas', async () => {
    await taskBot.searchForAction('Message box');
    await taskBot.doubleClickMessageBox();
    await taskBot.assertMessageBoxAddedToCanvas();
  });

  await test.step('6. Verify right-panel properties and fill message text', async () => {
    await taskBot.assertRightPanelVisible();
    await taskBot.fillMessageText(MESSAGE_TEXT);
    await expect(page.getByPlaceholder('Required').nth(1)).toHaveText(MESSAGE_TEXT);
  });

  await test.step('7. Save bot and confirm success', async () => {
    await taskBot.saveBot();
    await taskBot.assertSaveSuccess();
  });

  await test.step('8. Run the bot', async () => {
    await taskBot.runBot();
    // The test will pause here while the bot runs on the desktop.
    // Assuming you manually close the Windows Message Box popup, 
    // we then wait for the web Success dialog and close it!
    await taskBot.closeRunSuccessDialog();
  });

  await test.step('9. Close editor and return to dashboard', async () => {
    await taskBot.closeEditor();
  });
});
