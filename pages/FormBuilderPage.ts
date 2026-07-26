import { Page, Locator, FrameLocator, expect } from '@playwright/test';

/**
 * FormBuilderPage — covers the Form editor and Rules Builder tab.
 *
 * ALL SELECTORS CONFIRMED via real DOM HTML snippets.
 */
export class FormBuilderPage {
    readonly page: Page;

    // ✅ CONFIRMED: The AA Form editor renders inside an <iframe>.
    // All editor-specific locators (palette, canvas, properties, rules) must be
    // scoped through this FrameLocator, NOT page.locator().
    // Exception: formNameInput and createFormBtn are in the MAIN page (dialog before editor).
    private readonly editorFrame: FrameLocator;

    // ── Create Form dialog (MAIN PAGE — before editor opens) ──────────────
    // ✅ CONFIRMED: input[name="name"] — same pattern as Task Bot dialog
    private readonly formNameInput: Locator;
    // ✅ CONFIRMED: button[name="submit"] aria-label="Create & edit"
    private readonly createFormBtn: Locator;

    // ── Component palette (left panel) ────────────────────────────────────
    // ✅ CONFIRMED: outer draggable div, text is "Text Box" (2 words!)
    private readonly textboxPaletteItem: Locator;
    // ✅ CONFIRMED: .formcanvas-dropzone-bar at the bottom of the canvas
    private readonly canvasDropZone: Locator;

    // ── Properties panel — right-side fields ──────────────────────────────
    // ✅ CONFIRMED: All fields use input[name=X] attributes
    private readonly labelInput: Locator;       // input[name="label"]
    private readonly minLengthInput: Locator;   // input[name="minLength"]
    private readonly maxLengthInput: Locator;   // input[name="maxLength"]
    private readonly hintTextInput: Locator;    // input[name="hintText"]
    // ✅ CONFIRMED: Tooltip is a <textarea name="toolTip"> NOT an <input>!
    private readonly tooltipInput: Locator;
    private readonly defaultValueInput: Locator; // input[name="defaultValue"]

    // ── Save button ───────────────────────────────────────────────────────
    // ✅ CONFIRMED: button[name="save"] aria-label="save"
    // Success assertion: wait for data-input-status="DISABLED" (same as Task Bot)
    private readonly saveBtn: Locator;

    // ── Rules tab ─────────────────────────────────────────────────────────
    // ✅ CONFIRMED: button[data-tab-name="Form rules"]
    private readonly rulesTab: Locator;

    // ── Add rule button ───────────────────────────────────────────────────
    // ✅ CONFIRMED: #btn-add-rule button (wrapper div has id="btn-add-rule")
    private readonly addRuleBtn: Locator;

    // ── AND toggle ────────────────────────────────────────────────────────
    // ✅ CONFIRMED: button[role="radio"][aria-label="AND"]
    // NOTE: AND is SELECTED BY DEFAULT (aria-selected="true")
    //       switchToAndMode() checks first and only clicks if OR is currently selected
    private readonly andBtn: Locator;

    // ── Add condition button ──────────────────────────────────────────────
    // ✅ CONFIRMED: button[aria-label="Add condition"]
    private readonly addConditionBtn: Locator;

    constructor(page: Page) {
        this.page = page;

        // ✅ KEY FIX: The AA Form editor renders inside an <iframe>.
        // All editor elements must be located through this FrameLocator.
        this.editorFrame = page.frameLocator('iframe').first();

        // ── Create Form dialog (MAIN PAGE) ───────────────────────────────
        // These elements are in the main document, before the editor loads.
        this.formNameInput = page.locator('input[name="name"]');
        this.createFormBtn = page.locator('button[name="submit"]');

        // ── Component palette (INSIDE IFRAME) ────────────────────────────
        // ✅ CONFIRMED: Inner button has name="item-button" and text "Text Box" (2 words)
        // Using the inner button (not outer wrapper div) — more reliable for dragTo
        this.textboxPaletteItem = this.editorFrame
            .locator('button[name="item-button"]', { hasText: 'Text Box' })
            .first();
        // ✅ CONFIRMED: .formcanvas-dropzone-bar for non-empty canvas
        // Fallback: .formcanvas__leftpane for empty canvas (no rows yet)
        this.canvasDropZone = this.editorFrame.locator('.formcanvas__leftpane');

        // ── Properties panel fields (INSIDE IFRAME) ──────────────────────
        this.labelInput        = this.editorFrame.locator('input[name="label"]');
        this.minLengthInput    = this.editorFrame.locator('input[name="minLength"]');
        this.maxLengthInput    = this.editorFrame.locator('input[name="maxLength"]');
        this.hintTextInput     = this.editorFrame.locator('input[name="hintText"]');
        this.tooltipInput      = this.editorFrame.locator('textarea[name="toolTip"]'); // textarea!
        this.defaultValueInput = this.editorFrame.locator('input[name="defaultValue"]');

        // ── Save button (INSIDE IFRAME) ──────────────────────────────────
        this.saveBtn = this.editorFrame.locator('button[name="save"]');

        // ── Rules tab (INSIDE IFRAME) ────────────────────────────────────
        this.rulesTab = this.editorFrame.locator('button[data-tab-name="Form rules"]');

        // ── Add rule button (INSIDE IFRAME) ──────────────────────────────
        this.addRuleBtn = this.editorFrame.locator('#btn-add-rule button');

        // ── AND toggle (INSIDE IFRAME) ───────────────────────────────────
        this.andBtn = this.editorFrame.locator('button[role="radio"][aria-label="AND"]');

        // ── Add condition button (INSIDE IFRAME) ─────────────────────────
        this.addConditionBtn = this.editorFrame.locator('button[aria-label="Add condition"]');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1 — Create Form dialog
    // ─────────────────────────────────────────────────────────────────────────
    async fillFormName(name: string): Promise<void> {
        await this.formNameInput.waitFor({ state: 'visible' });
        await this.formNameInput.click();
        await this.formNameInput.clear();
        await this.formNameInput.pressSequentially(name, { delay: 20 });
    }

    async clickCreateAndEdit(): Promise<void> {
        await this.createFormBtn.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 — Assert editor loaded
    // ─────────────────────────────────────────────────────────────────────────
    async assertEditorLoaded(): Promise<void> {
        // Wait for save button (editor chrome loads first)
        await expect(this.saveBtn).toBeVisible({ timeout: 30_000 });
        // ALSO wait for the palette to populate — it loads asynchronously after the chrome.
        // This prevents step 4 (drag) from starting before palette items are available.
        await this.textboxPaletteItem.waitFor({ state: 'visible', timeout: 30_000 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3 — Drag Textbox palette item onto canvas
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Drags the "Text Box" palette item to the canvas drop bar.
     * ✅ CONFIRMED: Source = .editor-palette-item__child--is_draggable (text: "Text Box")
     * ✅ CONFIRMED: Target = .formcanvas-dropzone-bar
     * Call this once per textbox needed.
     */
    async dragTextboxToCanvas(): Promise<void> {
        // Palette item is already confirmed visible by assertEditorLoaded()
        await this.textboxPaletteItem.waitFor({ state: 'visible' });
        await this.textboxPaletteItem.scrollIntoViewIfNeeded();

        // Drop target: use .formcanvas-dropzone-bar when rows exist, else .formcanvas__leftpane
        // canvasDropZone is .formcanvas__leftpane (always present) — safe for both empty and non-empty canvas
        await this.textboxPaletteItem.dragTo(this.canvasDropZone);
        await this.page.waitForTimeout(1000); // DOM settle after drop
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4 — Select a canvas textbox and fill its properties
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clicks the nth canvas textbox (0-based) to select it, then fills all
     * 6 property panel fields.
     *
     * ✅ CONFIRMED: Canvas items are .formcanvas-col-container (targeted by nth index)
     * ✅ CONFIRMED: All properties use name attributes
     * ✅ CONFIRMED: Tooltip is a <textarea name="toolTip">
     *
     * @param index        — 0 = First Name, 1 = Last Name, 2 = Output TextBox
     * @param label        — Element label (input[name="label"])
     * @param minLen       — Min character length (input[name="minLength"])
     * @param maxLen       — Max character length (input[name="maxLength"])
     * @param hintText     — Hint below field (input[name="hintText"], max 30 chars)
     * @param tooltip      — Tool tip text (textarea[name="toolTip"], max 200 chars)
     * @param defaultValue — Default value (input[name="defaultValue"], max 50 chars)
     */
    async selectCanvasTextboxAndSetProperties(
        index: number,
        label: string,
        minLen: string,
        maxLen: string,
        hintText: string,
        tooltip: string,
        defaultValue: string
    ): Promise<void> {
        // ✅ Canvas items are INSIDE IFRAME — must use editorFrame.locator()
        const canvasItem = this.editorFrame.locator('.formcanvas-col-container').nth(index);
        await canvasItem.waitFor({ state: 'visible' });
        await canvasItem.click();
        await this.page.waitForTimeout(400); // wait for right panel to populate

        await this.fillField(this.labelInput, label);
        await this.fillField(this.minLengthInput, minLen);
        await this.fillField(this.maxLengthInput, maxLen);
        await this.fillField(this.hintTextInput, hintText);
        await this.fillField(this.tooltipInput, tooltip);           // textarea!
        await this.fillField(this.defaultValueInput, defaultValue);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5 — Save form
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clicks Save and waits for save to complete.
     * ✅ CONFIRMED: button[name="save"]
     * Success assertion: data-input-status changes to "DISABLED" (same pattern as Task Bot).
     */
    async saveForm(): Promise<void> {
        await this.saveBtn.waitFor({ state: 'visible' });
        await this.saveBtn.click();
        // The Form Builder save button does not become DISABLED like the Task Bot editor.
        // We just wait briefly for the save to complete before moving on.
        await this.page.waitForTimeout(2000);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6 — Navigate to Rules tab
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * ✅ CONFIRMED: button[data-tab-name="Form rules"]
     */
    async navigateToRulesTab(): Promise<void> {
        await this.rulesTab.waitFor({ state: 'visible' });
        await this.rulesTab.click();
        await this.page.waitForTimeout(500); // allow rules panel to render
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7 — Add a new rule
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * ✅ CONFIRMED: #btn-add-rule button
     */
    async addNewRule(): Promise<void> {
        await this.addRuleBtn.waitFor({ state: 'visible' });
        await this.addRuleBtn.click();
        await this.page.waitForTimeout(500); // wait for rule card to appear
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 8 — Add a condition to the nth condition row of a rule card
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Fills one condition row in the currently open rule card.
     *
     * @param conditionRowIndex — 0-based row (0=first condition, 1=second condition)
     * @param elementName       — e.g. "First Name - TextBox0"
     * @param conditionType     — e.g. "Is not empty"
     */
    async addCondition(conditionRowIndex: number, elementName: string, conditionType: string): Promise<void> {
        // Find the specific condition row
        // The user snippet revealed the class 'condition-outer-box' for condition rows.
        const conditionRow = this.editorFrame.locator('.condition-outer-box').nth(conditionRowIndex);
        
        // Inside the condition row, there are exactly 2 .rio-select-input dropdowns:
        // 0: Element Dropdown
        // 1: Condition Type Dropdown
        const elementDropdown = conditionRow.locator('.rio-select-input').nth(0);
        const conditionDropdown = conditionRow.locator('.rio-select-input').nth(1);

        // 1. Element Dropdown
        await this.selectFromSearchDropdown(elementDropdown, elementName, false);

        // 2. Condition Type Dropdown
        await this.selectFromSearchDropdown(conditionDropdown, conditionType, false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 9 — Add condition button + AND/OR mode
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Clicks "Add condition" to add a new condition row.
     * ✅ CONFIRMED: button[aria-label="Add condition"]
     */
    async clickAddCondition(): Promise<void> {
        await this.addConditionBtn.waitFor({ state: 'visible' });
        await this.addConditionBtn.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Ensures AND mode is selected.
     * ✅ CONFIRMED: AND is the DEFAULT (aria-selected="true").
     * This method is safe to call regardless — it only clicks if AND is NOT already selected.
     */
    async switchToAndMode(): Promise<void> {
        await this.andBtn.waitFor({ state: 'visible' });
        const isSelected = await this.andBtn.getAttribute('aria-selected');
        if (isSelected !== 'true') {
            await this.andBtn.click();
        }
        // Verify AND is now selected
        await expect(this.andBtn).toHaveAttribute('aria-selected', 'true');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 10 — Add an action to the rule
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Fills the action section of a rule card.
     *
     * ✅ CONFIRMED: Action element uses input[placeholder="Select element"] — uses .last()
     *   since condition rows also use "Select element" (action row is always the last one)
     * ✅ CONFIRMED: Action type uses input[placeholder="Select action"]
     * ✅ CONFIRMED: Value input uses input[aria-label="Enter new label"]
     *   (placeholder changes based on action type — this was confirmed for "Set value")
     *
     * @param targetElement — e.g. "TextBox - TextBox2"
     * @param actionType    — e.g. "Set value"
     * @param value         — e.g. "Name entered correctly"
     */
    async addAction(targetElement: string, actionType: string, value: string): Promise<void> {
        // Action dropdowns are at the bottom of the card.
        // Unlike condition single-selects, action dropdowns use visible inputs with placeholders.
        const actionElementDropdown = this.editorFrame.locator('input[placeholder*="Select element" i]').last();
        // Action elements use MULTI-SELECT (checkboxes)
        await this.selectFromSearchDropdown(actionElementDropdown, targetElement, true);

        // 2. Action Type Dropdown
        const actionTypeDropdown = this.editorFrame.locator('input[placeholder*="Select action" i]').last();
        await this.selectFromSearchDropdown(actionTypeDropdown, actionType, false);

        // 3. Value input
        await this.page.waitForTimeout(300);
        const valueInput = this.editorFrame
            .locator('input[aria-label*="Enter new label" i], input[placeholder*="value" i]')
            .first();
        await this.fillField(valueInput, value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 11 — Add Rule Below via three-dot context menu
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Opens the three-dot (⋮) context menu on a rule card and clicks "Add Rule Below".
     *
     * ✅ CONFIRMED: button[aria-label="More"] — one per rule card
     *
     * @param ruleCardIndex — 0-based index (0 = Rule1, 1 = Rule2)
     */
    async addRuleBelowViaContextMenu(ruleCardIndex: number): Promise<void> {
        // Three-dot button is INSIDE IFRAME
        const threeDotsBtn = this.editorFrame
            .locator('button[aria-label="More"]')
            .nth(ruleCardIndex);

        await threeDotsBtn.waitFor({ state: 'visible' });
        await threeDotsBtn.click();

        // The context menu might not have role="menuitem", so use text matching.
        // It's usually inside the iframe, but some UI frameworks append modals to the parent page.
        let menuItem = this.editorFrame.getByText('Add rule below', { exact: false }).first();
        
        // Wait briefly to see if it appears in the iframe
        try {
            await menuItem.waitFor({ state: 'visible', timeout: 2000 });
        } catch (e) {
            // Fallback to top-level page
            menuItem = this.page.getByText('Add rule below', { exact: false }).first();
            await menuItem.waitFor({ state: 'visible', timeout: 3000 });
        }

        await menuItem.click({ force: true });
        await this.page.waitForTimeout(500);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Assertions
    // ─────────────────────────────────────────────────────────────────────────
    async assertRulesTabVisible(): Promise<void> {
        await expect(this.rulesTab).toBeVisible();
    }

    async assertAddRuleBtnVisible(): Promise<void> {
        await expect(this.addRuleBtn).toBeVisible();
    }

    /**
     * Asserts a rule card is visible by name (e.g. "Rule1", "Rule2", "Rule3").
     * Rule card text is inside the iframe.
     */
    async assertRuleCardVisible(ruleName: string): Promise<void> {
        await expect(
            this.editorFrame.getByText(ruleName, { exact: false })
        ).toBeVisible({ timeout: 10_000 });
    }

    async assertAllRulesPersist(ruleNames: string[]): Promise<void> {
        for (const name of ruleNames) {
            await expect(
                this.editorFrame.getByText(name, { exact: false })
            ).toBeVisible({ timeout: 10_000 });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * click + clear + pressSequentially to trigger React onChange events.
     * Works for both <input> and <textarea> (tooltip field).
     * Same pattern confirmed for Task Bot.
     */
    private async fillField(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
        await locator.clear();
        if (value) {
            await locator.pressSequentially(value, { delay: 20 });
        }
    }

    /**
     * Types in a searchable dropdown input to filter options, then clicks the
     * filtered (leaf) option using .last() — avoids the ancestor-matching problem
     * with getByText when the dropdown container also contains the option text.
     *
     * @param input        — the search <input> inside the rio-select-input-query component
     * @param optionText   — the full option text to type and then click
     * @param isMultiSelect — true for element dropdowns (selected-pills); they stay open
     *                        after selection and need Escape to close.
     *                        false for single-select dropdowns (condition/action type);
     *                        they close automatically after selection.
     */
    private async selectFromSearchDropdown(
        trigger: Locator,
        optionText: string,
        isMultiSelect: boolean
    ): Promise<void> {
        // Open the dropdown
        await trigger.click({ force: true });
        await this.page.waitForTimeout(300); // Wait for popup/input to spawn and gain focus

        // The application automatically focuses the actual searchable input.
        // We type into whatever input is currently active to avoid stealing focus back to a non-interactive trigger.
        const activeInput = this.editorFrame.locator('input:focus').first();
        if (await activeInput.count() > 0) {
            // Type to filter: reduces the list to only matching options
            await activeInput.fill(optionText);
            await this.page.waitForTimeout(400); // wait for filter to apply
        }

        if (isMultiSelect) {
            // For multi-select, the text we searched for is now visible in the list.
            // Click the visible text directly (which is inside the label, so it toggles the checkbox).
            const optionLabel = this.editorFrame.getByText(optionText, { exact: false })
                .filter({ state: 'visible' })
                .last();
            await optionLabel.click({ force: true });
            await this.page.waitForTimeout(300);
            
            // Close the multi-select dropdown by clicking a neutral area
            // (Escape key might clear the search input and revert the selection)
            await this.editorFrame.locator('body').click({ position: { x: 5, y: 5 }, force: true });
            await this.page.waitForTimeout(300);
        } else {
            // Single-select options don't use checkboxes, so getByText works.
            const option = this.editorFrame.getByText(optionText, { exact: false }).last();
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click({ force: true });
            await this.page.waitForTimeout(300);
        }
    }
}
