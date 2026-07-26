import { Page, Locator, expect } from '@playwright/test';

/**
 * TaskBotPage — covers the Task Bot creation dialog + the bot editor.
 *
 * SELECTOR PLACEHOLDERS
 * TODO: After clicking "Create & edit" in the dialog, the bot editor opens.
 *       Use DevTools to inspect:
 *         - The dialog name input and "Create & edit" button
 *         - The Actions panel search bar (left side of editor)
 *         - The Message Box result in the search list
 *         - The flow canvas where the action step appears
 *         - The right-side properties panel and its specific fields
 *         - The Save button location and the success toast text
 */
export class TaskBotPage {
    readonly page: Page;

    // --- Create Task Bot dialog ---
    // TODO: Inspect the modal when you click "+ Create > Task Bot"
    private readonly botNameInput: Locator;
    private readonly createAndEditBtn: Locator;

    // --- Bot editor: Actions panel (left side) ---
    // TODO: The left panel has a search input. Could be placeholder="Search" or similar
    private readonly actionsSearchInput: Locator;

    // --- Message Box action item in search results ---
    // TODO: After typing "Message box" in search, a result card appears.
    //       Inspect it — might be a <li> or <div> with specific data attribute or text
    private readonly messageBoxActionItem: Locator;

    // --- Right-side properties panel (appears after adding Message Box) ---
    // TODO: The panel heading (e.g. "Message box"), the message textarea, other fields
    private readonly rightPanelHeading: Locator;
    private readonly messageTextInput: Locator;

    // --- Save + Success toast ---
    // TODO: Save button is usually top-right in the editor toolbar
    private readonly saveBtn: Locator;
    // TODO: After saving, a toast appears — inspect its text and selector
    private readonly successToast: Locator;

    // --- Run Bot ---
    private readonly runBtn: Locator;

    constructor(page: Page) {
        this.page = page;

        // ✅ CONFIRMED: Name input has name="name" and placeholder="Required"
        this.botNameInput = page.locator('input[name="name"]');

        // ✅ CONFIRMED: Create & edit button has aria-label="Create & edit" and name="submit"
        this.createAndEditBtn = page.locator('button[aria-label="Create & edit"]');

        // ✅ CONFIRMED: Actions search bar selector
        this.actionsSearchInput = page.getByPlaceholder('Search actions');

        // ✅ CONFIRMED via Playwright error log:
        // getByText('Message box') resolved to 2 elements.
        // The actual action item in the list is a button with name="item-button"
        this.messageBoxActionItem = page.locator('button[name="item-button"]', { hasText: 'Message box' }).first();

        this.rightPanelHeading = page.getByText('Message box', { exact: false }).last();
        // ✅ CONFIRMED via accessibility tree: The textbox does NOT have the accessible name linked.
        // There are exactly 3 fields with placeholder="Required" in this panel:
        // 0: Window title, 1: Message to display, 2: Scrollbar lines
        this.messageTextInput = page.getByPlaceholder('Required').nth(1);

        // ✅ CONFIRMED: Save button has name="save"
        //   data-input-status="DISABLED" = no pending changes
        //   data-input-status="INTERACTIVE" = unsaved changes exist
        this.saveBtn = page.locator('button[name="save"]');

        // ✅ CONFIRMED: NO toast after saving a Task Bot.
        //   A loading icon briefly appears and disappears (~1 sec).
        //   successToast is unused — assertSaveSuccess() uses saveBtn state instead.
        this.successToast = page.locator('[data-testid="__unused__"]');

        // Run bot locators
        // ✅ CONFIRMED: There are 2 identical Run buttons in the DOM (likely desktop vs mobile layout).
        // They have name="run" and aria-label="Run". Using first() handles the strict mode violation.
        this.runBtn = page.locator('button[name="run"]').first();
    }

    // --- Dialog actions ---
    async fillBotName(name: string): Promise<void> {
        await this.botNameInput.waitFor({ state: 'visible' });
        await this.botNameInput.fill(name);
    }

    async clickCreateAndEdit(): Promise<void> {
        await this.createAndEditBtn.click();
        // 'domcontentloaded' not 'networkidle' — AA polls background constantly
        await this.page.waitForLoadState('domcontentloaded');
    }

    // --- Editor actions ---
    async searchForAction(actionName: string): Promise<void> {
        await this.actionsSearchInput.waitFor({ state: 'visible' });
        await this.actionsSearchInput.fill(actionName);
    }

    async doubleClickMessageBox(): Promise<void> {
        await this.messageBoxActionItem.waitFor({ state: 'visible' });
        await this.messageBoxActionItem.dblclick();
    }

    async fillMessageText(message: string): Promise<void> {
        await this.messageTextInput.waitFor({ state: 'visible' });
        // ✅ click() + clear() + pressSequentially() is used because standard fill() 
        // sometimes drops characters or fails to trigger React/Angular 'onChange' events 
        // in SPAs, which causes the Save button to remain DISABLED.
        await this.messageTextInput.click();
        await this.messageTextInput.clear();
        await this.messageTextInput.pressSequentially(message, { delay: 20 });
    }

    async setMessageBoxAutoClose(seconds: string): Promise<void> {
        // Playwright cannot click the native Windows message box.
        // We MUST check this box so the bot auto-closes it and completes!

        // AA renders both a custom span[role="checkbox"] and a hidden <input type="checkbox">.
        // Using .first() targets the span to avoid strict mode violations.
        const autoCloseCheckbox = this.page.getByRole('checkbox', { name: 'Close message box after' }).first();

        // Custom checkboxes are best toggled via click() after checking their aria-checked state
        const isChecked = await autoCloseCheckbox.getAttribute('aria-checked');
        if (isChecked === 'false') {
            await autoCloseCheckbox.click();
        }

        // The seconds input is the 4th field with placeholder="Required" (index 3)
        // 0: Window title, 1: Message, 2: Scrollbar, 3: Seconds
        const secondsInput = this.page.getByPlaceholder('Required').nth(3);
        await secondsInput.fill(seconds);
    }

    async saveBot(): Promise<void> {
        await this.saveBtn.click();
    }

    async runBot(): Promise<void> {
        await this.runBtn.waitFor({ state: 'visible' });
        await this.runBtn.click();
    }

    async closeRunSuccessDialog(): Promise<void> {
        // Wait for the "Your automation has run successfully!" dialog
        // This will wait until the native Windows Message Box is closed (either manually or by auto-close).
        // Using the exact HTML provided: button[name="ok"][aria-label="Close"]
        const successDialogCloseBtn = this.page.locator('button[name="ok"][aria-label="Close"]');
        await successDialogCloseBtn.waitFor({ state: 'visible', timeout: 120_000 });
        await successDialogCloseBtn.click();
    }

    async closeEditor(): Promise<void> {
        // Close the entire Task Bot editor (top-right Close button)
        const editorCloseBtn = this.page.getByRole('button', { name: 'Close', exact: true }).first();
        await editorCloseBtn.waitFor({ state: 'visible' });
        await editorCloseBtn.click();
    }

    // --- Assertions ---
    async assertCreateDialogVisible(): Promise<void> {
        await expect(this.botNameInput).toBeVisible();
        await expect(this.createAndEditBtn).toBeVisible();
    }

    async assertEditorLoaded(): Promise<void> {
        await expect(this.actionsSearchInput).toBeVisible({ timeout: 15_000 });
    }

    async assertMessageBoxAddedToCanvas(): Promise<void> {
        // ✅ CONFIRMED via error log: The canvas node has data-package-object-key="messagebox#messagebox"
        // and class="taskbot-canvas-flow-point__label--name"
        const canvasNode = this.page.locator('div[data-package-object-key="messagebox#messagebox"]');
        await expect(canvasNode).toBeVisible({ timeout: 10_000 });
    }

    async assertRightPanelVisible(): Promise<void> {
        await expect(this.rightPanelHeading).toBeVisible({ timeout: 10_000 });
        await expect(this.messageTextInput).toBeVisible();
    }

    async assertSaveSuccess(): Promise<void> {
        // ✅ CONFIRMED: No toast on Task Bot save — a loading icon appears briefly then disappears.
        // The Save button returns to data-input-status="DISABLED" once save completes
        // (DISABLED = no pending unsaved changes = save was successful).
        await expect(this.saveBtn).toHaveAttribute('data-input-status', 'DISABLED', { timeout: 10_000 });
    }
}
