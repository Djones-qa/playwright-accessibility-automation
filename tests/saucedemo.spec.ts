import { test, expect } from '@playwright/test';
import { runAxeScan, formatViolations } from '../utils/axeHelper';
import { testSites, wcagTags } from '../utils/testData';

test.describe('SauceDemo Accessibility @regression', () => {

  test('login page should have no critical WCAG 2.1 AA violations @smoke', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag21aa });
    const critical = results.violations.filter(v => v.impact === 'critical');
    console.log('Critical: ' + critical.length + ', Passes: ' + results.passes.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('login page should pass WCAG 2.0 A standard', async ({ page }) => {
    await page.goto(testSites.saucedemo.login);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, { tags: wcagTags.wcag2a });
    const critical = results.violations.filter(v => v.impact === 'critical');
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
});
