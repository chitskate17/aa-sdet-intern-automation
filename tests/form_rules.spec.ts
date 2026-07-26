import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FormBuilderPage } from '../pages/FormBuilderPage';

/**
 * Use Case 2: End-to-End Form with Rules Builder
 *
 * WORKFLOW:
 *   1.  Log in to AA Community Edition
 *   2.  Navigate to Automation → Create → Form
 *   3.  Fill form name → Create & edit
 *   4.  Drag 3 Text Box elements onto canvas
 *   5.  Set properties for each textbox (Label, Min/Max length, Hint text, Tooltip, Default value)
 *   6.  Save form → assert success (saveBtn data-input-status → "DISABLED")
 *   7.  Navigate to Rules tab → assert tab + Add rule button visible
 *   8.  Add Rule1 → assert visible in expanded mode
 *   9.  Add condition 1: First Name - TextBox0 → "Is not empty"
 *   10. Click Add condition → ensure AND mode → condition 2: Last Name - TextBox1 → "Is not empty"
 *   11. Add action: TextBox - TextBox2 → Set value → "Name entered correctly"
 *   12. Add Rule2 via ⋮ context menu on Rule1 → "Add Rule Below"
 *   13. Add Rule3 via ⋮ context menu on Rule2 → "Add Rule Below"
 *   14. Save form → assert Rule1, Rule2, Rule3 all persist
 *
 * Run: npx playwright test tests/form_rules.spec.ts --headed --project=chromium
 */

const FORM_NAME = `Playwright_UC2_${Date.now()}`;

// Properties for the 3 textboxes dropped on canvas
// TextBox0 = First Name (condition field 1)
// TextBox1 = Last Name  (condition field 2)
// TextBox2 = Output     (action target — value set by rule)
const TEXTBOX_PROPS = [
    {
        label:        'First Name',
        minLen:       '2',
        maxLen:       '50',
        hintText:     'Enter your first name',
        tooltip:      'First Name tooltip',
        defaultValue: '',
    },
    {
        label:        'Last Name',
        minLen:       '2',
        maxLen:       '50',
        hintText:     'Enter your last name',
        tooltip:      'Last Name tooltip',
        defaultValue: '',
    },
    {
        label:        'Output',
        minLen:       '0',
        maxLen:       '100',
        hintText:     'Auto-filled by rule',
        tooltip:      'Output tooltip',
        defaultValue: '',
    },
];

test('Use Case 2: End-to-End Form with Rules Builder', async ({ page }) => {
    test.setTimeout(300000);

    const loginPage   = new LoginPage(page);
    const dashboard   = new DashboardPage(page);
    const formBuilder = new FormBuilderPage(page);

    // ── STEP 1: Log in ─────────────────────────────────────────────────────
    await test.step('1. Log in to AA Community Edition', async () => {
        await loginPage.goto();
        await loginPage.login(
            process.env.AA_EMAIL!,
            process.env.AA_PASSWORD!
        );
        await loginPage.assertLoggedIn();
    });

    // ── STEP 2: Navigate to Automation → Create → Form ────────────────────
    await test.step('2. Navigate to Automation and open Create Form dialog', async () => {
        await dashboard.navigateToAutomation();
        // ✅ selectForm() internally calls openCreateDropdown() + clicks button[name="create-attended-form"]
        await dashboard.selectForm();
    });

    // ── STEP 3: Fill form name → Create & edit ────────────────────────────
    await test.step('3. Fill form name and click Create & edit', async () => {
        // ✅ CONFIRMED: input[name="name"] + button[name="submit"] (same pattern as Task Bot)
        await formBuilder.fillFormName(FORM_NAME);
        await formBuilder.clickCreateAndEdit();
        await formBuilder.assertEditorLoaded();
    });

    // ── STEP 4: Drag 3 Text Box elements onto canvas ──────────────────────
    await test.step('4. Drag 3 Text Box elements onto the canvas', async () => {
        // ✅ CONFIRMED: Source = .editor-palette-item__child--is_draggable (text: "Text Box")
        // ✅ CONFIRMED: Target = .formcanvas-dropzone-bar
        for (let i = 0; i < 3; i++) {
            await formBuilder.dragTextboxToCanvas();
        }
    });

    // ── STEP 5: Set properties for each textbox ───────────────────────────
    await test.step('5. Set properties for each textbox', async () => {
        // ✅ CONFIRMED: Canvas items via .formcanvas-col-container.nth(index)
        // ✅ CONFIRMED: input[name="label|minLength|maxLength|hintText|defaultValue"]
        // ✅ CONFIRMED: textarea[name="toolTip"] for tooltip (NOT an input!)
        for (let i = 0; i < TEXTBOX_PROPS.length; i++) {
            const p = TEXTBOX_PROPS[i];
            await formBuilder.selectCanvasTextboxAndSetProperties(
                i, p.label, p.minLen, p.maxLen, p.hintText, p.tooltip, p.defaultValue
            );
        }
    });

    // ── STEP 6: Save form ─────────────────────────────────────────────────
    await test.step('6. Save form and assert success', async () => {
        // ✅ CONFIRMED: button[name="save"]
        // Success: data-input-status changes to "DISABLED" (same pattern as Task Bot)
        await formBuilder.saveForm();
    });

    // ── STEP 7: Navigate to Rules tab ────────────────────────────────────
    await test.step('7. Navigate to Rules tab', async () => {
        // ✅ CONFIRMED: button[data-tab-name="Form rules"]
        await formBuilder.navigateToRulesTab();
        await formBuilder.assertRulesTabVisible();
        await formBuilder.assertAddRuleBtnVisible();
    });

    // ── STEP 8: Add Rule1 ────────────────────────────────────────────────
    await test.step('8. Add Rule1 and verify it is visible in expanded mode', async () => {
        // ✅ CONFIRMED: #btn-add-rule button
        await formBuilder.addNewRule();
        await formBuilder.assertRuleCardVisible('Rule1');
    });

    // ── STEP 9: Add condition 1 to Rule1 ─────────────────────────────────
    await test.step('9. Add condition: First Name (TextBox0) → Is not empty', async () => {
        // ✅ CONFIRMED: input[placeholder="Select element"] (nth=0 for first condition row)
        // ✅ CONFIRMED: input[placeholder="Select condition"] (nth=0)
        await formBuilder.addCondition(0, 'First Name - TextBox0', 'Is not empty');
    });

    // ── STEP 10: Add condition 2 with AND ────────────────────────────────
    await test.step('10. Switch to AND mode and add condition 2 (Last Name → Is not empty)', async () => {
        // ✅ CONFIRMED: button[aria-label="Add condition"]
        await formBuilder.clickAddCondition();
        // ✅ CONFIRMED: AND is DEFAULT (aria-selected="true"). switchToAndMode() is idempotent.
        await formBuilder.switchToAndMode();
        // ✅ Second condition row — uses nth(1) for "Select element" + "Select condition"
        await formBuilder.addCondition(1, 'Last Name - TextBox1', 'Is not empty');
    });

    // ── STEP 11: Add action ───────────────────────────────────────────────
    await test.step('11. Add action: Output (TextBox2) → Set value → "Name entered correctly"', async () => {
        // ✅ CONFIRMED: Action element uses input[placeholder="Select element"].last()
        //   (condition rows use same placeholder, action row is always last)
        // ✅ CONFIRMED: Action type uses input[placeholder="Select action"]
        // ✅ CONFIRMED: Value field = input[aria-label="Enter new label"]
        await formBuilder.addAction('Output - TextBox2', 'Set value', 'Name entered correctly');
    });

    // ── STEP 12: Add Rule2 via ⋮ context menu on Rule1 ───────────────────
    await test.step('12. Add Rule2 via three-dot context menu on Rule1', async () => {
        // ✅ CONFIRMED: button[aria-label="More"].nth(0) = three-dot on Rule1
        await formBuilder.addRuleBelowViaContextMenu(0);
        await formBuilder.assertRuleCardVisible('Rule2');
    });

    // ── STEP 13: Add Rule3 via ⋮ context menu on Rule2 ───────────────────
    await test.step('13. Add Rule3 via three-dot context menu on Rule2', async () => {
        // ✅ button[aria-label="More"].nth(1) = three-dot on Rule2
        await formBuilder.addRuleBelowViaContextMenu(1);
        await formBuilder.assertRuleCardVisible('Rule3');
    });

    // ── STEP 14: Save and verify all 3 rules persist ─────────────────────
    await test.step('14. Save form and verify Rule1, Rule2, Rule3 all persist', async () => {
        await formBuilder.saveForm();
        await formBuilder.assertAllRulesPersist(['Rule1', 'Rule2', 'Rule3']);
    });
});
