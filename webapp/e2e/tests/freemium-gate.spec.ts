import { test, expect, addTimerFromPreset, timerTiles } from '../fixtures/app';

// Free tier limit is 5 timers total (across all sessions) — see webapp/src/lib/plan.js.
const FREE_TIMER_LIMIT = 5;

test.describe('Freemium gating', () => {
  test('J2: warning banner appears once 3 or fewer free timers remain', async ({ dashboardPage: page }) => {
    await addTimerFromPreset(page);
    await addTimerFromPreset(page);
    // 5 - 2 = 3 remaining.
    await expect(page.getByText('Only 3 free timers left.')).toBeVisible();
  });

  test('J1: adding a 6th timer opens the Upgrade modal instead of adding it', async ({ dashboardPage: page }) => {
    for (let i = 0; i < FREE_TIMER_LIMIT; i++) {
      await addTimerFromPreset(page);
    }
    await expect(timerTiles(page)).toHaveCount(FREE_TIMER_LIMIT);
    await expect(page.getByText(`You've reached the ${FREE_TIMER_LIMIT}-timer free limit.`)).toBeVisible();

    await addTimerFromPreset(page);

    await expect(page.getByRole('heading', { name: 'Go Unlimited' })).toBeVisible();
    await expect(timerTiles(page)).toHaveCount(FREE_TIMER_LIMIT);
  });

  test('J3: Upgrade modal shows an email field when logged out', async ({ dashboardPage: page }) => {
    for (let i = 0; i < FREE_TIMER_LIMIT; i++) {
      await addTimerFromPreset(page);
    }
    await addTimerFromPreset(page);

    await expect(page.getByRole('heading', { name: 'Go Unlimited' })).toBeVisible();
    // Targeted by input type, not placeholder text: the placeholder is marketing
    // copy and changing it (church.org -> yourteam.com) silently broke this test.
    // There's exactly one email input in the modal.
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // Upgrade button starts disabled until an email is entered.
    await expect(page.getByRole('button', { name: /Upgrade — from/ })).toBeDisabled();
  });
});
