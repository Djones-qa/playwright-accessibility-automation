# playwright-accessibility-automation

Automated accessibility testing suite built with **Playwright**, **axe-core**, and **TypeScript**, validating WCAG 2.1 AA compliance across multiple real-world websites with a full CI pipeline via GitHub Actions.

![CI](https://github.com/Djones-qa/playwright-accessibility-automation/actions/workflows/playwright.yml/badge.svg)
![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)
![Language](https://img.shields.io/badge/language-TypeScript-blue)
![Playwright](https://img.shields.io/badge/framework-Playwright-45ba4b)
![axe-core](https://img.shields.io/badge/engine-axe--core-purple)

---

## Overview

This project demonstrates a production-ready accessibility automation framework. It scans real websites for WCAG violations using axe-core, validates keyboard navigation, checks landmark structure, verifies alt text, and asserts heading hierarchy — all automated via Playwright and running in CI on every push.

---

## Test Coverage

| Spec File | Tests | What It Covers |
|-----------|-------|----------------|
| saucedemo.spec.ts | 5 | WCAG 2.1 AA, WCAG 2.0 A, keyboard nav, alt text, heading structure |
| demoqa.spec.ts | 4 | Critical violations, form accessibility, keyboard input |
| wikipedia.spec.ts | 6 | Landmarks, skip nav link, alt text, keyboard search, article page |
| **Total** | **15** | **3 sites, full WCAG 2.1 AA coverage** |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Playwright | Browser automation and test runner |
| axe-core / @axe-core/playwright | WCAG rule engine |
| TypeScript | Type-safe test code |
| GitHub Actions | CI/CD pipeline |

---

## Project Structure
```
playwright-accessibility-automation/
├── .github/
│   └── workflows/         # GitHub Actions CI configuration
├── tests/
│   ├── saucedemo.spec.ts  # SauceDemo login page accessibility
│   ├── demoqa.spec.ts     # DemoQA form and button accessibility
│   └── wikipedia.spec.ts  # Wikipedia landmark and content accessibility
├── utils/
│   ├── axeHelper.ts       # Reusable axe scan runner and violation formatter
│   └── testData.ts        # Centralized URLs and WCAG tag sets
├── playwright.config.ts   # Playwright configuration
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation
```bash
git clone https://github.com/Djones-qa/playwright-accessibility-automation.git
cd playwright-accessibility-automation
npm install
npx playwright install chromium
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run smoke tests only:**
```bash
npm run test:smoke
```

**Run regression suite:**
```bash
npm run test:regression
```

**View HTML report:**
```bash
npm run report
```

---

## WCAG Standards Tested

| Standard | Tags Used |
|----------|-----------|
| WCAG 2.0 Level A | wcag2a |
| WCAG 2.0 Level AA | wcag2a, wcag2aa |
| WCAG 2.1 Level AA | wcag2a, wcag2aa, wcag21a, wcag21aa |

---

## CI/CD

Tests run automatically on every push and pull request via GitHub Actions. The pipeline installs dependencies, installs Chromium, runs the full test suite, and uploads the HTML report as a downloadable artifact retained for 30 days.

View the workflow in [`.github/workflows/`](./.github/workflows/).

---

## Key Features

- **axe-core integration** — industry-standard WCAG rule engine used by teams at Google, Microsoft, and Deque
- **3 real-world test sites** — SauceDemo, DemoQA, Wikipedia
- **Keyboard navigation tests** — Tab order and focus validation beyond what axe catches
- **Landmark and heading checks** — ensures proper page structure for screen reader users
- **Alt text validation** — custom checks on top of axe rules
- **Smoke and regression tags** — run subsets of tests without configuration changes
- **Reusable helpers** — `runAxeScan` and `formatViolations` shared across all specs
- **GitHub Actions CI** — HTML report uploaded as artifact on every run

---

## Author

**Darrius Jones** — QA Automation Engineer
[GitHub](https://github.com/Djones-qa) · [LinkedIn](https://linkedin.com/in/darrius-jones-28226b350)
