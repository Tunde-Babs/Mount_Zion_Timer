import type { Page } from '@playwright/test';

// Helpers for Stripe's hosted Checkout page, built from real accessibility-tree
// snapshots captured from actual (initially failing) CI runs — not guessed from
// docs. This is Stripe's modern redesigned Checkout (Apple Pay/Link/Amazon
// Pay/Bancontact/MB WAY/EPS/Satispay all listed as payment methods), which
// differs from the classic Stripe.js Card Element in two ways that broke the
// first two attempts at this file:
//   1. Card number/Expiration/CVC don't exist in the DOM until the "Card"
//      payment-method row is selected (Checkout defaults to a collapsed list).
//   2. Once selected, those fields render as plain top-level accessible
//      textboxes ("Card number" / "Expiration" / "CVC" / "Cardholder name") —
//      NOT inside an iframe, and NOT using the classic name="cardnumber"
//      attribute convention. (Express-payment buttons like Apple Pay/Amazon
//      Pay *are* iframed, which is what made this look iframe-based at first.)

export async function fillCheckoutEmail(page: Page, email: string) {
  const emailField = page.getByRole('textbox', { name: 'Email' }).or(page.getByPlaceholder('email@example.com'));
  await emailField.fill(email);
}

export async function payWithTestCard(page: Page, { cardNumber = '4242424242424242', expiry = '1234', cvc = '123' } = {}) {
  // Select the Card accordion row by id. Its accessible name ("Card") depends on
  // the row's rendered label, which shifts as Stripe adds payment methods; the id
  // has been stable. Errors here are NOT swallowed: an earlier version did
  // `.catch(() => {})`, so a failed selection surfaced as an inexplicable 30s
  // timeout on the card-number fill instead of pointing at the real cause.
  const cardRadio = page.locator('#payment-method-accordion-item-title-card');
  if (await cardRadio.count()) {
    await cardRadio.check({ force: true });
  }

  // Card fields are injected only after the row expands, so wait for the first
  // one explicitly rather than letting a bare fill() time out ambiguously.
  await page.locator('#cardNumber').waitFor({ state: 'visible', timeout: 15000 });

  await page.locator('#cardNumber').fill(cardNumber);
  await page.locator('#cardExpiry').fill(expiry);
  await page.locator('#cardCvc').fill(cvc);

  const cardholderName = page.locator('#billingName');
  if (await cardholderName.count()) await cardholderName.fill('E2E Test');

  // Billing address defaults to "United States", which requires a ZIP — and a
  // Phone number field is also required. Both are marked [invalid] (empty)
  // when unfilled, silently blocking submission with no error shown up front —
  // confirmed via a real run where "Pay" just sat there past its 20s timeout.
  // Both stay conditional: which of these render depends on #billingCountry,
  // which Stripe defaults from the session. A 2026-08-03 capture against a
  // EUR price showed neither present, while earlier US-defaulted runs required
  // both — so presence is checked rather than assumed in either direction.
  const zip = page.locator('#billingPostalCode').or(page.getByRole('textbox', { name: 'ZIP' }));
  if (await zip.count()) await zip.first().fill('94103');

  const phone = page.locator('#phoneNumber').or(page.getByRole('textbox', { name: 'Phone number' }));
  if (await phone.count()) await phone.first().fill('2015550123');

  // exact: true matters here — Checkout also has "Pay with Bancontact", "Pay
  // with MB WAY", etc. rows for the other payment methods, all matching a
  // substring "Pay"; the actual submit button's accessible name is just "Pay".
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
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
