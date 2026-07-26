# Automation Anywhere Community Edition — SDET Playwright Automation
[![Playwright Tests](https://github.com/chitskate17/aa-sdet-intern-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/chitskate17/aa-sdet-intern-automation/actions/workflows/playwright.yml)

## 🏗 Architecture Overview
This automation framework uses the **Page Object Model (POM)** design pattern. All UI interactions and element selectors are strictly separated from the test scripts, making the code highly maintainable. The framework utilizes `playwright.config.ts` to manage timeouts, browser contexts, retries, and artifact generation (screenshots, videos, traces). Tests are written in TypeScript, ensuring robust type safety and compile-time error checking across the entire project.

## 🛠 Tech Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Playwright** | Test runner & browser automation engine | `^1.61.1` |
| **TypeScript** | Strongly-typed scripting language | (via `@playwright/test`) |
| **Node.js** | JavaScript runtime environment | `LTS (v20+)` |
| **dotenv** | Environment variable management | `^17.4.2` |
| **GitHub Actions** | CI/CD pipeline | `ubuntu-latest` |

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chitskate17/aa-sdet-intern-automation.git
   cd aa-sdet-intern-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the root directory (`aa-sdet-intern-automation/.env`) with your AA Community Edition credentials:
   ```env
   AA_EMAIL=your_email@domain.com
   AA_PASSWORD=your_password
   ```

## 🏃 Running Tests

Playwright provides powerful CLI commands to run and debug tests:

- **Run all tests headlessly:**
  ```bash
  npx playwright test
  ```
- **Run all tests with UI visible (headed mode):**
  ```bash
  npx playwright test --headed
  ```
- **Run a specific Use Case:**
  ```bash
  npx playwright test tests/task_bot.spec.ts      # Use Case 1
  npx playwright test tests/form_rules.spec.ts    # Use Case 2
  ```
- **View HTML Report:**
  ```bash
  npx playwright show-report
  ```

## 🔄 CI/CD Integration (GitHub Actions)
A CI pipeline is configured in `.github/workflows/playwright.yml`. On every push or pull request to `main`:
1. The pipeline installs dependencies and Playwright browsers.
2. It executes all tests headlessly.
3. If tests pass or fail, a **Playwright HTML Report** (including screenshots and traces) is uploaded as a GitHub Artifact, retained for 30 days.

*Note: GitHub Secrets (`AA_EMAIL`, `AA_PASSWORD`) must be configured in the repository settings for the CI pipeline to authenticate.*

## 🔍 Trace Viewer
The framework is configured to capture a trace automatically on the **first retry** of a failed test (`trace: 'on-first-retry'`). This helps identify exactly where the DOM state differed from expectations.
To view a trace from a failed run:
```bash
npx playwright show-trace path/to/trace.zip
```

## 📂 Folder Structure
```text
aa-sdet-intern-automation/
├── .github/workflows/
│   └── playwright.yml         # CI/CD pipeline definition
├── locators/
│   └── selectors.ts           # Centralized selector dictionary
├── pages/
│   ├── DashboardPage.ts       # POM for post-login dashboard
│   ├── FormBuilderPage.ts     # POM for Forms & Rules Builder
│   ├── LoginPage.ts           # POM for Authentication
│   └── TaskBotPage.ts         # POM for Task Bot creation
├── tests/
│   ├── form_rules.spec.ts     # Use Case 2 (Form Rules Builder)
│   └── task_bot.spec.ts       # Use Case 1 (Message Box Task Bot)
├── playwright.config.ts       # Framework configurations
└── package.json               # Node dependencies
```

## ✅ Use Case Coverage

| Use Case | Description | Status | Test File |
|----------|-------------|--------|-----------|
| **Use Case 1** | Message Box Task (UI Automation). Logs in, navigates to Task Bot, adds a Message Box action, populates properties, and saves. | ✅ Passing | `task_bot.spec.ts` |
| **Use Case 2** | Form with Rules Builder (UI Automation). Creates a form, drags 3 textboxes, applies properties, builds 3 conditions/actions across 3 rules, and saves. | ✅ Passing | `form_rules.spec.ts` |
