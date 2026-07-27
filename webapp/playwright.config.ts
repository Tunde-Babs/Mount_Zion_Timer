import { defineConfig, devices } from '@playwright/test';

// Payment tests need the Pages Functions layer (Stripe checkout session creation,
// webhook, session-status), which only runs under `wrangler pages dev` — plain
// `vite` has no /api routes. `npm run dev:full` runs both together on port 8788.
// See webapp/README.md's "Enabling accounts, cloud sync, and payments" section.
const baseURL = process.env.PW_BASE_URL || 'http://localhost:8788';
const skipWebServer = process.env.PW_NO_WEBSERVER === '1';

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        environmentInfo: {
          framework: 'Playwright',
          node: process.version,
          target: baseURL
        }
      }
    ]
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: skipWebServer
    ? undefined
    : {
        command: 'npm run dev:full',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000
      }
});
