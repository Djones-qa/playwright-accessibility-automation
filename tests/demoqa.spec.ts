import { test, expect } from '@playwright/test';
import { runAxeScan, formatViolations } from '../utils/axeHelper';
import { testSites, wcagTags } from '../utils/testData';

test.describe('DemoQA Accessibility @regression', () => {

  test('text box page should have no critical violations @smoke', async ({ page }) => {
    await page.goto(testSites.demoqa.textBox);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, {
      tags: wcagTags.wcag21aa,
      exclude: ['iframe', '.banner-image', 'img[src*="Toolsqa"]', 'img[src*="logo"]'],
    });
    const critical = results.violations.filter(v =>
      v.impact === 'critical' && !['image-alt','label'].includes(v.id)
    );
    console.log('Critical (excl. site logo): ' + critical.length);
    console.log('All violations: ' + results.violations.length);
    if (results.violations.length > 0) console.log(formatViolations(results.violations));
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('buttons page should have no critical violations', async ({ page }) => {
    await page.goto(testSites.demoqa.buttons);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, {
      tags: wcagTags.wcag21aa,
      exclude: ['iframe', 'img[src*="Toolsqa"]', 'img[src*="logo"]'],
    });
    const critical = results.violations.filter(v =>
      v.impact === 'critical' && !['image-alt','label'].includes(v.id)
    );
    console.log('Buttons critical (excl. site logo): ' + critical.length);
    expect(critical.length, formatViolations(critical)).toBe(0);
  });

  test('forms page should have no critical violations @smoke', async ({ page }) => {
    await page.goto(testSites.demoqa.forms);
    await page.waitForLoadState('domcontentloaded');
    const results = await runAxeScan(page, {
      tags: wcagTags.wcag21aa,
      exclude: ['iframe', 'img[src*="Toolsqa"]', 'img[src*="logo"]', '.upload-file'],
    });
    const critical = results.violations.filter(v =>
      v.impact === 'critical' && !['image-alt', 'label'].includes(v.id)
    );
    console.log('Forms critical (excl. known site issues): ' + critical.length);
    console.log('Total violations found on page: ' + results.violations.length);
    if (results.violations.length > 0) console.log(formatViolations(results.violations));
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
});
