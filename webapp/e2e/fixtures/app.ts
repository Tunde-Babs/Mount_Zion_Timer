import { test as base, type Page } from '@playwright/test';

type AppFixtures = {
  dashboardPage: Page;
};

// Every test gets a page that starts on a genuinely empty dashboard: localStorage
// (the Zustand store, key "mzt-store-v1") is cleared before the app boots so
// leftover timers/sessions from a previous test never leak in.
export const test = base.extend<AppFixtures>({
  dashboardPage: async ({ page }, use) => {
    await page.addInitScript(() => window.localStorage.clear());
    await page.goto('/app');
    await use(page);
  }
});

export const expect = test.expect;

export async function addTimerFromPreset(page: Page, label = '1 min') {
  await page.getByRole('button', { name: label, exact: true }).click();
}

export async function addTimersUpTo(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await addTimerFromPreset(page);
  }
}

export function timerTiles(page: Page) {
  return page.getByTestId('timer-tile');
}

export async function openSessionMenu(page: Page) {
  await page.getByTestId('session-switcher-button').click();
  return page.getByTestId('session-menu');
}
