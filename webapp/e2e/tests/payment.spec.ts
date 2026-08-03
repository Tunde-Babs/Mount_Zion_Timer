import fs from 'node:fs';
import { test, expect } from '../fixtures/app';
import { isProfilePremium } from '../fixtures/supabaseAdmin';
import { TEST_USER_FILE } from '../global-setup';
import { fillCheckoutEmail, payWithTestCard, setCustomAmount } from '../fixtures/stripeCheckout';

// This whole suite targets Stripe TEST MODE only (the .dev.vars sk_test_/price/whsec
// values) via `npm run dev:full`. It additionally needs, running alongside the test
// run, in a separate terminal:
//   stripe listen --forward-to localhost:8788/api/stripe-webhook
// Without that, Checkout will succeed but the webhook never reaches this machine,
// so the "premium granted" assertions (K3/K9) will time out.

function loadTestUser(): { id: string; email: string; password: string } | null {
  if (!fs.existsSync(TEST_USER_FILE)) return null;
  return JSON.parse(fs.readFileSync(TEST_USER_FILE, 'utf-8'));
}

test.describe('Stripe checkout (test mode) @payment', () => {
  test.beforeEach(async ({ page }) => {
    const user = loadTestUser();
    test.skip(!user, 'Supabase admin not configured in .dev.vars — see e2e/global-setup.ts.');
    if (!user) return;

    await page.goto('/login');
    // By input type rather than placeholder copy — see freemium-gate.spec.ts.
    await page.locator('input[type="email"]').fill(user.email);
    await page.getByPlaceholder('••••••••').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test('K1: starting the upgrade redirects to Stripe Checkout with the €20 default', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /Upgrade — from/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
    await expect(page.getByText(/20[.,]00/)).toBeVisible();
  });

  test('K2 + K3 + K9: completing Checkout grants premium and lifts the timer limit', async ({ page }) => {
    const user = loadTestUser()!;

    await page.goto('/pricing');
    await page.getByRole('button', { name: /Upgrade — from/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

    // K2: pay with Stripe's universal test card — no real charge in test mode.
    // Logged-in checkout (client_reference_id path) still shows an empty,
    // required Email field — confirmed via a real failed-run snapshot.
    await fillCheckoutEmail(page, user.email);
    await payWithTestCard(page);

    await page.waitForURL(/\/upgrade\/success/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /unlimited/i })).toBeVisible({ timeout: 15000 });

    // K3: the webhook (delivered via `stripe listen`) should flip the Supabase profile.
    await expect
      .poll(() => isProfilePremium(user.id), { timeout: 20000, intervals: [1000] })
      .toBe(true);

    // K9: the 5-timer free cap no longer applies for this now-premium account.
    await page.goto('/app');
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '1 min', exact: true }).click();
    }
    await expect(page.getByTestId('timer-tile')).toHaveCount(6);
    await expect(page.getByRole('heading', { name: 'Go Unlimited' })).toHaveCount(0);
  });

  test('K5: leaving Checkout without paying returns to pricing, nothing charged', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /Upgrade — from/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

    // Deliberately not clicking Stripe's own back-link (its selector/wording is
    // Stripe's to change) — browser back is what an abandoning user actually does,
    // and it lands wherever cancel_url points (create-checkout-session.js sends
    // the path we started from, i.e. /pricing) without needing to know Stripe's markup.
    await page.goBack();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.getByRole('button', { name: /Upgrade — from/ })).toBeVisible();
  });

  test('K6: an amount below the €20 minimum is rejected by Stripe, not our app', async ({ page }) => {
    await page.goto('/pricing');
    await page.getByRole('button', { name: /Upgrade — from/ }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

    // The "customer chooses price" amount field enforces custom_unit_amount.minimum
    // on the Price object — not app code. It renders disabled by default (showing
    // the €20 preset) behind a "Change amount" button; setCustomAmount() handles that.
    await setCustomAmount(page, '5');
    await fillCheckoutEmail(page, `k6-${Date.now()}@example.com`);
    await payWithTestCard(page);

    // Whatever the exact message, Stripe must block this — we should never reach
    // our success page for a sub-minimum amount.
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
    await expect(page).not.toHaveURL(/\/upgrade\/success/);
  });
});
