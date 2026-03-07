import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';

export async function runAxeScan(page: Page, options?: { tags?: string[]; exclude?: string[]; }) {
  let builder = new AxeBuilder({ page });
  if (options?.tags) builder = builder.withTags(options.tags);
  if (options?.exclude) { for (const sel of options.exclude) builder = builder.exclude(sel); }
  const results = await builder.analyze();
  return { violations: results.violations, passes: results.passes, url: page.url() };
}

export function formatViolations(violations: any[]): string {
  if (violations.length === 0) return 'No violations found.';
  return violations.map(v => '[' + v.impact.toUpperCase() + '] ' + v.id + ': ' + v.description + ' | Nodes: ' + v.nodes.length).join('\n');
}
