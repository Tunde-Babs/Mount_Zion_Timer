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
  // Expanding the Card row, which is where all three previous attempts at this
  // file came unstuck. Three things matter:
  //   - Target the id. The accessible name ("Card") comes from a rendered label
  //     that shifts as Stripe adds payment methods; the id has been stable.
  //   - click(), not check(). It's a custom React radio (tabindex="-1",
  //     aria-checked driven by Stripe's handler) and check() ASSERTS the state
  //     flipped, throwing "Clicking the checkbox did not change its state" in CI
  //     even though the click had registered. Waiting for #cardNumber is a better
  //     assertion: it checks what we care about, not an intermediate aria value.
  //   - Don't swallow failures. An earlier version wrapped this in
  //     `.catch(() => {})`, so a failed expand surfaced 30s later as an
  //     inexplicable timeout on the card-number fill, pointing at the wrong line.
  const cardRadio = page.locator('#payment-method-accordion-item-title-card');
  const cardNumberField = page.locator('#cardNumber');

  if ((await cardRadio.count()) && !(await cardNumberField.isVisible().catch(() => false))) {
    await cardRadio.click({ force: true });
    // One retry: expanding the accordion is occasionally dropped when Stripe's
    // bundle is still settling, which is what made this flaky rather than
    // consistently broken (it passed on CI retry #1).
    try {
      await cardNumberField.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      await cardRadio.click({ force: true });
    }
  }

  await cardNumberField.waitFor({ state: 'visible', timeout: 15000 });

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

  // Opt out of Link enrolment before paying. "Save my information for faster
  // checkout" is on by default, and a single successful run enrols the email in
  // Link — after which EVERY later run loads Checkout behind Link's "Confirm
  // it's you" OTP modal, which covers the page so the card form can't be reached
  // at all. That is precisely how this suite went from green on 2026-07-27 to
  // failing every night on an unchanged commit.
  const saveInfo = page.locator('#enableStripePass');
  if (await saveInfo.count()) await saveInfo.uncheck({ force: true }).catch(() => {});

  // Targeted by testid, not accessible name. The button's text is actually
  // "PayProcessing" — a hidden "Processing" label sits inside it — so its
  // accessible name isn't reliably the exact string "Pay", which is what made
  // getByRole('button', { name: 'Pay', exact: true }) time out on CI retry #1.
  // data-testid="hosted-payment-submit-button" is Stripe's own hook and is the
  // only type=submit button on the page.
  await page.locator('[data-testid="hosted-payment-submit-button"]').click();
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
