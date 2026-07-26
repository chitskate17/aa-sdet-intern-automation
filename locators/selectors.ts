/**
 * selectors.ts — Central store for complex or reused CSS/XPath selectors.
 *
 * Keep brittle or long selectors here so they are easy to find and update
 * without hunting through multiple page files.
 *
 * TODO: As you inspect the AA UI in DevTools, move any complex selectors here.
 *       Import this file in your Page classes:
 *         import { Selectors } from '../locators/selectors';
 */

export const Selectors = {

  // ---- Login Page ----
  login: {
    // TODO: Replace with the real selector after DevTools inspection
    emailInput:    '',  // e.g. '[name="email"]' or '[data-id="email-input"]'
    passwordInput: '',  // e.g. '[type="password"]'
    signInButton:  '',  // e.g. 'button[type="submit"]'
  },

  // ---- Dashboard / Left Sidebar ----
  dashboard: {
    automationNav: '',  // Left nav "Automation" link
    createButton:  '',  // "+ Create" dropdown button
    taskBotItem:   '',  // "Task Bot" option inside dropdown
    formItem:      '',  // "Form" option inside dropdown
  },

  // ---- Task Bot Editor ----
  taskBot: {
    actionsSearch:       '',  // Search bar in the Actions left panel
    messageBoxResult:    '',  // Message Box item in search results
    canvasStep:          '',  // A step node on the flow canvas
    rightPanelHeading:   '',  // Heading in the right properties panel
    messageTextarea:     '',  // The "Enter message" input in right panel
    saveButton:          '',  // Save button in editor toolbar
    successToast:        '',  // Toast element after save
  },

  // ---- Form Builder ----
  formBuilder: {
    textboxPaletteItem:  '',  // "Textbox" in the left component palette
    canvasDropZone:      '',  // The canvas drop area
    labelInput:          '',  // Label field in properties panel
    minLengthInput:      '',  // Min length field
    maxLengthInput:      '',  // Max length field
    hintTextInput:       '',  // Hint text field
    tooltipInput:        '',  // Tooltip field
    defaultValueInput:   '',  // Default value field
    saveButton:          '',  // Save button
    successToast:        '',  // Toast after save
  },

  // ---- Form Rules Builder ----
  rulesBuilder: {
    rulesTab:              '',  // "Form rules (N)" tab
    addRuleButton:         '',  // "+ Add rule" button
    ruleCard:              '',  // Each rule card container
    ruleCardMenu:          '',  // Three-dot menu button on a rule card
    addRuleBelowMenuItem:  '',  // "Add Rule Below" in the context menu
    conditionElementDdl:   '',  // Element dropdown inside condition row
    conditionTypeDdl:      '',  // Condition type dropdown
    andToggle:             '',  // AND toggle/button
    addConditionButton:    '',  // "Add condition" button
    actionElementDdl:      '',  // Element dropdown in action section
    actionTypeDdl:         '',  // Action type dropdown (Set value, etc.)
    actionValueInput:      '',  // Value input field for the action
    addActionButton:       '',  // "Add action" button
  },

} as const;
