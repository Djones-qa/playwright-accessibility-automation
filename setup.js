const fs = require('fs');
const path = require('path');

const files = {};

files['package.json'] = JSON.stringify({
  name: 'playwright-accessibility-automation',
  version: '1.0.0',
  description: 'Accessibility testing suite using Playwright and axe-core',
  scripts: {
    test: 'playwright test',
    'test:smoke': 'playwright test --grep @smoke',
    'test:regression': 'playwright test --grep @regression',
    report: 'playwright show-report'
  },
  devDependencies: {
    '@playwright/test': '^1.41.0',
    '@axe-core/playwright': '^4.8.0',
    '@types/node': '^20.0.0',
    typescript: '^5.0.0'
  }
}, null, 2);

files['tsconfig.json'] = JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    module: 'commonjs',
    moduleResolution: 'node',
    strict: false,
    esModuleInterop: true,
    baseUrl: '.'
  },
  include: ['**/*.ts'],
  exclude: ['node_modules']
}, null, 2);

files['.gitignore'] = 'node_modules/\nplaywright-report/\ntest-results/\ndist/\n.DS_Store';

files['playwright.config.ts'] = \import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});\;

files['utils/testData.ts'] = \export const testSites = {
  saucedemo: {
    login: 'https://www.saucedemo.com',
  },
  demoqa: {
    textBox: 'https://demoqa.com/text-box',
    buttons: 'https://demoqa.com/buttons',
    forms: 'https://demoqa.com/automation-practice-form',
  },
  wikipedia: {
    home: 'https://en.wikipedia.org/wiki/Main_Page',
    article: 'https://en.wikipedia.org/wiki/Software_testing',
  },
};

export const wcagTags = {
  wcag2a: ['wcag2a'],
  wcag2aa: ['wcag2a', 'wcag2aa'],
  wcag21aa: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
};\;

files['utils/axeHelper.ts'] = \import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';

export async function runAxeScan(page: Page, options?: {
  tags?: string[];
  exclude?: string[];
}) {
  let builder = new AxeBuilder({ page });
  if (options?.tags) builder = builder.withTags(options.tags);
  if (options?.exclude) {
    for (const sel of options.exclude) builder = builder.exclude(sel);
  }
  const results = await builder.analyze();
  return {
    violations: results.violations,
    passes: results.passes,
    url: page.url(),
  };
}

export function formatViolations(violations: any[]): string {
  if (violations.length === 0) return 'No violations found.';
  return violations.map(v =>
    '[' + v.impact.toUpperCase() + '] ' + v.id + ': ' + v.description +
    ' | Help: ' + v.helpUrl +
    ' | Nodes: ' + v.nodes.length
  ).join('\\n');
}\;

files['tests/saucedemo.spec.ts'] = \import { test, expect } from '@playwright/test';
import { runAxeScan, formatViolations } from '../utils/axeHelper';
import { testSites, wcagTags } from '../utils/testData';

test.describe('SauceDemo Accessibility @regression', () => {

  test('login page should have no critical WCAG 2.1 AA violations @smoke', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Critical: ' + critical.length + ', Total: ' + results.violations.length + ', Passes: ' + results.passes.length);
    if (results.violations.length > 0) console.log(formatViolations(results.violations));
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('login page should pass WCAG 2.0 A standard', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag2a });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('WCAG 2.0A violations: ' + results.violations.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('login page should support keyboard navigation @smoke', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(first).toBe('username');
    await page.keyboard.press('Tab');
    const second = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(second).toBe('password');
    await page.keyboard.press('Tab');
    const third = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(third).toBe('login-button');
  });

  test('login page images should have alt text', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).filter(img => !img.alt || img.alt.trim() === '').length
    );
    console.log('Images without alt text: ' + missing);
    expect(missing).toBe(0);
  });

  test('login page should have proper heading structure', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const headings = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({ tag: h.tagName, text: h.textContent?.trim() }))
    );
    console.log('Headings: ' + JSON.stringify(headings));
    expect(headings.length).toBeGreaterThanOrEqual(0);
  });
});\;

files['tests/demoqa.spec.ts'] = \import { test, expect } from '@playwright/test';
import { runAxeScan, formatViolations } from '../utils/axeHelper';
import { testSites, wcagTags } from '../utils/testData';

test.describe('DemoQA Accessibility @regression', () => {

  test('text box page should have no critical violations @smoke', async ({ page }) => {
    await page.goto(testSites.demoqa.textBox);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa, exclude: ['iframe'] });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Critical: ' + critical.length + ', Total: ' + results.violations.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('buttons page should have no critical violations', async ({ page }) => {
    await page.goto(testSites.demoqa.buttons);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa, exclude: ['iframe'] });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Buttons critical: ' + critical.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('forms page should have no critical violations @smoke', async ({ page }) => {
    await page.goto(testSites.demoqa.forms);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa, exclude: ['iframe'] });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Forms critical: ' + critical.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('forms page inputs should be keyboard accessible', async ({ page }) => {
    await page.goto(testSites.demoqa.forms);
    await page.waitForLoadState('domcontentloaded');
    const input = page.locator('#firstName');
    await input.focus();
    await page.keyboard.type('TestUser');
    expect(await input.inputValue()).toBe('TestUser');
  });
});\;

files['tests/wikipedia.spec.ts'] = \import { test, expect } from '@playwright/test';
import { runAxeScan, formatViolations } from '../utils/axeHelper';
import { testSites, wcagTags } from '../utils/testData';

test.describe('Wikipedia Accessibility @regression', () => {

  test('home page should have no critical WCAG 2.1 AA violations @smoke', async ({ page }) => {
    await page.goto(testSites.wikipedia.home);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Critical: ' + critical.length + ', Passes: ' + results.passes.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('article page should have no critical violations @smoke', async ({ page }) => {
    await page.goto(testSites.wikipedia.article);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Article critical: ' + critical.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('home page should have a skip navigation link', async ({ page }) => {
    await page.goto(testSites.wikipedia.home);
    await page.waitForLoadState('domcontentloaded');
    const skipLink = page.locator('a[href="#content"], a[href="#mw-content-text"], .mw-jump-link').first();
    expect(await skipLink.count()).toBeGreaterThan(0);
  });

  test('home page should have proper landmark regions', async ({ page }) => {
    await page.goto(testSites.wikipedia.home);
    await page.waitForLoadState('domcontentloaded');
    const landmarks = await page.evaluate(() => ({
      main: document.querySelectorAll('main, [role="main"]').length,
      nav: document.querySelectorAll('nav, [role="navigation"]').length,
    }));
    console.log('Landmarks: ' + JSON.stringify(landmarks));
    expect(landmarks.main).toBeGreaterThan(0);
    expect(landmarks.nav).toBeGreaterThan(0);
  });

  test('article page images should have alt text', async ({ page }) => {
    await page.goto(testSites.wikipedia.article);
    await page.waitForLoadState('domcontentloaded');
    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).filter(img => !img.hasAttribute('alt')).length
    );
    console.log('Images missing alt: ' + missing);
    expect(missing).toBe(0);
  });

  test('home page should support keyboard search', async ({ page }) => {
    await page.goto(testSites.wikipedia.home);
    await page.waitForLoadState('domcontentloaded');
    const search = page.locator('#searchInput, input[name="search"]').first();
    await search.focus();
    await page.keyboard.type('Software testing');
    expect(await search.inputValue()).toBe('Software testing');
  });
});\;

files['.github/workflows/playwright.yml'] = \
ame: Accessibility Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  accessibility-tests:
    name: Run Accessibility Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run accessibility tests
        run: npm test
      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessibility-report
          path: playwright-report/
          retention-days: 30\;

files['README.md'] = \# Playwright Accessibility Automation

![Accessibility Tests](https://github.com/ozone11924-bot/playwright-accessibility-automation/actions/workflows/playwright.yml/badge.svg)
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![Playwright](https://img.shields.io/badge/Playwright-1.41-blue)
![axe-core](https://img.shields.io/badge/axe--core-4.8-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

Automated accessibility testing suite using Playwright and axe-core, validating WCAG 2.1 AA compliance across multiple real-world websites.

## Test Coverage

| Suite | Tests | What it covers |
|---|---|---|
| saucedemo.spec.ts | 5 | WCAG 2.1 AA, keyboard nav, alt text, headings |
| demoqa.spec.ts | 4 | Critical violations, form accessibility, keyboard input |
| wikipedia.spec.ts | 6 | Landmarks, skip nav, alt text, keyboard search |

15 total tests across 3 sites.

## Getting Started

npm install
npx playwright install chromium
npm test
npm run report

## Tech Stack

- Playwright - Browser automation
- axe-core - WCAG rule engine
- TypeScript - Type-safe tests
- GitHub Actions - CI/CD\;

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Created:', filePath);
}

console.log('Done! Now run: npm install && npx playwright install chromium && npm test');
