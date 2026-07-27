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
  const cardRadio = page.getByRole('radio', { name: 'Card' });
  if (await cardRadio.count()) await cardRadio.check({ force: true }).catch(() => {});

  await page.getByRole('textbox', { name: 'Card number' }).fill(cardNumber);
  await page.getByRole('textbox', { name: 'Expiration' }).fill(expiry);
  await page.getByRole('textbox', { name: 'CVC' }).fill(cvc);

  const cardholderName = page.getByRole('textbox', { name: 'Cardholder name' });
  if (await cardholderName.count()) await cardholderName.fill('E2E Test');

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
