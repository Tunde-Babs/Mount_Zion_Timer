import type { Frame, Page } from '@playwright/test';

// Helpers for Stripe's hosted Checkout page, built from an actual failed CI run's
// captured accessibility snapshot (not guessed from docs) — see the payment.spec.ts
// history for the real DOM this was reverse-engineered from. Two things this
// accounts for that a naive Elements-style automation script misses:
//   1. The card number/expiry/CVC fields don't exist in the DOM at all until the
//      "Card" payment-method row is actually selected — Checkout defaults to
//      showing a collapsed list of methods (Card/Bancontact/MB WAY/EPS/Satispay/…).
//   2. Those fields, once they do render, live inside an iframe (like the Apple
//      Pay / Amazon Pay express buttons do) — Playwright's top-level
//      page.fill()/page.locator() never reaches into iframe content, only
//      frame.locator() on the specific frame does.

export async function fillCheckoutEmail(page: Page, email: string) {
  const emailField = page.getByRole('textbox', { name: 'Email' }).or(page.getByPlaceholder('email@example.com'));
  await emailField.fill(email);
}

async function findCardFrame(page: Page, timeoutMs = 15000): Promise<Frame> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const frame of page.frames()) {
      const count = await frame.locator('input[name="cardnumber"]').count().catch(() => 0);
      if (count > 0) return frame;
    }
    await page.waitForTimeout(300);
  }
  throw new Error('Timed out looking for a frame containing input[name="cardnumber"] — Stripe Checkout markup may have changed.');
}

export async function payWithTestCard(page: Page, { cardNumber = '4242424242424242', expiry = '1234', cvc = '123' } = {}) {
  // Card is usually the default/first method, but this is harmless if it's
  // already selected, and necessary if it isn't.
  const cardRadio = page.getByRole('radio', { name: 'Card' });
  if (await cardRadio.count()) await cardRadio.check({ force: true }).catch(() => {});

  const frame = await findCardFrame(page);
  await frame.locator('input[name="cardnumber"]').fill(cardNumber);
  await frame.locator('input[name="exp-date"]').fill(expiry);
  await frame.locator('input[name="cvc"]').fill(cvc);

  await page.getByRole('button', { name: 'Pay', exact: false }).click();
}

// The "customer chooses" amount field (custom_unit_amount on the Price) renders
// disabled, pre-filled with the preset amount, next to a "Change amount" button
// that must be clicked before it accepts input — confirmed via id="customUnitAmount".
export async function setCustomAmount(page: Page, amount: string) {
  await page.getByRole('button', { name: 'Change amount' }).click();
  const amountInput = page.locator('#customUnitAmount');
  await amountInput.fill(amount);
  await amountInput.blur();
}
