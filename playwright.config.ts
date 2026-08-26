import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright configuration.
 *
 * Phase 1 runs chromium only. Firefox is added locally in phase 2 and webkit
 * runs in CI only, because it cannot launch on Fedora (see docs/adr/0001).
 */
export default defineConfig({
  testDir: './tests',

  // Fail the build if a test was accidentally left as test.only.
  forbidOnly: !!process.env.CI,

  // saucedemo is a shared public site, so keep the load modest.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,

  // One retry in CI tells us a test is unstable without hiding it.
  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // The JSON report is what the defect-triage agent reads.
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',

    // saucedemo marks its elements with data-test, not Playwright's default
    // data-testid, so getByTestId() is pointed at the right attribute.
    testIdAttribute: 'data-test',

    // Artifacts kept only for failures, so runs stay small.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
