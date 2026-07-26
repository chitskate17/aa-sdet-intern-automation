import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FormBuilderPage } from '../pages/FormBuilderPage';
import { TEXTBOX_PROPS } from './form_rules.spec';

test('Debug form builder locators', async ({ page }) => {
    test.setTimeout(120000);
    const loginPage = new LoginPage(page);
    await loginPage.login();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToForms();
    
    // Create form
    const formBuilder = new FormBuilderPage(page);
    const uniqueFormName = `DebugForm_${Date.now()}`;
    await formBuilder.clickCreateForm();
    await formBuilder.fillFormDetails(uniqueFormName, 'Debug form');
    
    // Navigate to Rules
    await formBuilder.navigateToRulesTab();
    await formBuilder.addNewRule();
    
    // Log the entire HTML of the rules section to a file
    const html = await formBuilder.editorFrame.locator('.rules-builder-card').first().innerHTML();
    const fs = require('fs');
    fs.writeFileSync('rules-card-dom.html', html);
    console.log("DOM saved to rules-card-dom.html");
});
