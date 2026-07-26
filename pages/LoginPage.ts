import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage — covers the Automation Anywhere Community Edition login screen.
 *
 * SELECTOR PLACEHOLDERS
 * Every selector marked with "TODO" must be verified by inspecting the live
 * AA login page in Chrome DevTools (F12 -> Elements) before running the tests.
 * Open: https://community.cloud.automationanywhere.digital
 */
export class LoginPage {
  readonly page: Page;

  // Selectors
  // TODO: Open the AA login page -> DevTools (F12) -> Inspector
  //       Hover over each element and copy the best stable attribute
  //       (data-*, aria-label, placeholder, name, or role+label combo)

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly postLoginLandmark: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ CONFIRMED via DevTools + test error output
    // getByLabel('Username') matched 3 elements (input + 2 remember-me checkboxes)
    // The real username input has name="username" — unique and stable
    // The real password input has name="password" — same pattern
    this.emailInput        = page.locator('input[name="username"]');
    this.passwordInput     = page.locator('input[name="password"]');
    this.signInButton      = page.getByRole('button', { name: 'Log in' });
    // Post-login landmark: AA redirects to /#/home after login
    this.postLoginLandmark = page.locator('a[href="#/home"]').first();
  }

  // Navigation
  async goto(): Promise<void> {
    // 'commit' = stop waiting as soon as the first response headers arrive.
    // AA root URL immediately server-redirects to /#/login or /#/home,
    // which aborts the original request. 'load' interprets that as ERR_ABORTED.
    await this.page.goto('/', { waitUntil: 'commit' });
    // Playwright will automatically wait for the next actionable element (like the username input)
    // to become visible, so we don't need to wait for a flaky 'load' event here.
  }

  // Actions
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    // No need to wait for load state here. The test's next step will naturally wait
    // for the expected post-login URL (/#/home) or element to appear.
  }

  // Assertions
  async assertLoggedIn(): Promise<void> {
    // ✅ CONFIRMED: post-login URL contains /#/home
    await expect(this.page).toHaveURL(/#\/home/, { timeout: 15_000 });
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }
}
