import { test, expect } from '@playwright/test';
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

});
