import { test, expect } from '@playwright/test';
import { LoginPage }     from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * SMOKE TEST — Step 1 verification
 * Goal: Confirm that login works, Automation nav works,
 *       and clicking the Create button opens the Task Bot creation dialog.
 *
 * Run with:
 *   npx playwright test tests/smoke_create_dialog.spec.ts --headed
 */
test.describe('Smoke: Create Task Bot Dialog', () => {

  test('should log in, navigate to Automation, and open the Create dropdown', async ({ page }) => {
    const login     = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Step 1: Go to login page
    await login.goto();
    await login.assertOnLoginPage();

    // Step 2: Log in with credentials from .env
    const email    = process.env.AA_EMAIL    ?? '';
    const password = process.env.AA_PASSWORD ?? '';
    expect(email,    'AA_EMAIL env var must be set').not.toBe('');
    expect(password, 'AA_PASSWORD env var must be set').not.toBe('');
    await login.login(email, password);

    // Step 3: Assert post-login home page
    await login.assertLoggedIn();
    console.log('✅ Login successful — URL:', page.url());

    // Step 4: Click Automation nav link
    await dashboard.navigateToAutomation();
    await dashboard.assertOnAutomationPage();
    console.log('✅ On Automation page — URL:', page.url());

    // Step 5: Assert Create button visible
    await dashboard.assertCreateDropdownVisible();
    console.log('✅ Create button visible');

    // Step 6: Click the Create dropdown button
    await dashboard.openCreateDropdown();

    // Step 7: Assert dropdown is open — items are <button> elements, not menuitems
    // CONFIRMED: " Task Bot…" / " Form…" / " Process…" / " AI Skill…"
    const taskBotOption = page.getByRole('button', { name: /task bot/i });
    await expect(taskBotOption).toBeVisible({ timeout: 5_000 });
    console.log('✅ Create dropdown opened — Task Bot option visible');

    // Step 8: Click Task Bot
    await taskBotOption.click();

    // Step 9: Assert "Create Task Bot" dialog appeared
    const dialogHeading = page.getByText('Create Task Bot', { exact: false });
    await expect(dialogHeading).toBeVisible({ timeout: 10_000 });
    console.log('✅ Create Task Bot dialog is open!');
  });

});
