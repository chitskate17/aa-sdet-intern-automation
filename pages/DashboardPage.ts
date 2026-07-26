import { Page, Locator, expect } from '@playwright/test';

/**
 * DashboardPage — covers the post-login dashboard and left sidebar navigation.
 *
 * SELECTOR PLACEHOLDERS
 * TODO: After logging in, use DevTools to inspect the sidebar nav items,
 *       the "+ Create" dropdown button, and each menu option inside it.
 */
export class DashboardPage {
  readonly page: Page;

  // Left sidebar nav
  // TODO: Inspect the sidebar; "Automation" is likely an <a> or <li> element
  private readonly automationNavLink: Locator;

  // "+ Create" dropdown button (top-right of the Automation page)
  // TODO: Inspect the button — could be role=button name="Create" or a split-button
  private readonly createDropdownBtn: Locator;

  // Menu items inside the Create dropdown
  // TODO: After clicking Create, inspect the dropdown list items
  private readonly taskBotOption: Locator;
  private readonly formOption: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ CONFIRMED: Automation nav link navigates to /#/bots/repository
    this.automationNavLink = page.locator('a[href="#/bots/repository"]').first();

    // ✅ CONFIRMED via HTML snippet: Create button name="createOptions"
    this.createDropdownBtn = page.locator('button[name="createOptions"]').first();

    // ✅ CONFIRMED via HTML snippet: Task Bot option
    this.taskBotOption = page.getByRole('button', { name: /task bot/i });
    // ✅ CONFIRMED via HTML snippet: Form option has name="create-attended-form"
    this.formOption    = page.locator('button[name="create-attended-form"]');
  }

  // Navigation
  async navigateToAutomation(): Promise<void> {
    await this.automationNavLink.click();
    await this.page.waitForLoadState('load');
  }

  // Actions
  async openCreateDropdown(): Promise<void> {
    await this.createDropdownBtn.click();
    // TODO: Wait for the dropdown menu to appear
    // await this.taskBotOption.waitFor({ state: 'visible' });
  }

  async selectTaskBot(): Promise<void> {
    await this.openCreateDropdown();
    await this.taskBotOption.click();
  }

  async selectForm(): Promise<void> {
    await this.openCreateDropdown();
    await this.formOption.click();
  }

  // Assertions
  async assertOnAutomationPage(): Promise<void> {
    // ✅ CONFIRMED: Automation page URL contains /bots/repository
    await expect(this.page).toHaveURL(/#\/bots\/repository/, { timeout: 10_000 });
  }

  async assertCreateDropdownVisible(): Promise<void> {
    await expect(this.createDropdownBtn).toBeVisible();
  }
}
