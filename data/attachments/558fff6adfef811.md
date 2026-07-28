# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Stripe checkout (test mode) @payment >> K2 + K3 + K9: completing Checkout grants premium and lifts the timer limit
- Location: e2e/tests/payment.spec.ts:39:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=f2e1]:
  - generic [ref=f2e4]:
    - generic [ref=f2e5]:
      - banner [ref=f2e6]:
        - generic [ref=f2e8]:
          - link [ref=f2e9] [cursor=pointer]:
            - /url: http://localhost:8788/pricing
            - generic [ref=f2e11]:
              - generic [ref=f2e14]: Back
              - heading [level=1] [ref=f2e20]: Divine Gold sandbox
          - generic [ref=f2e21]: Sandbox
      - generic [ref=f2e24]:
        - heading [level=2] [ref=f2e25]:
          - generic [ref=f2e26]: Mount Zion Timer — Unlimited
        - generic [ref=f2e28]:
          - generic [ref=f2e29]:
            - generic [ref=f2e30]: €20.00
            - generic [ref=f2e33]: One-time upgrade for unlimited timers in Mount Zion Timer. €20 minimum — pay more if you'd like.
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - textbox [disabled]:
                            - /placeholder: €0.00
                            - text: €20.00
        - button [ref=f2e45] [cursor=pointer]: Change amount
    - generic [ref=f2e46]:
      - main [ref=f2e47]:
        - generic [ref=f2e50]:
          - generic [ref=f2e51]:
            - iframe [ref=f2e57]:
              - generic [ref=f6e6]:
                - iframe [ref=f6e11]:
                  - button "Apple Pay" [ref=f18e5] [cursor=pointer]:
                    - img [ref=f18e7]:
                      - img "Apple Logo" [ref=f18e8]
                - button "Pay securely with Link" [ref=f6e14] [cursor=pointer]
                - iframe [ref=f6e24]:
                  - button "Amazon Pay - Use your Amazon Pay Sandbox test account" [ref=f19e3]:
                    - img "Amazon Pay" [ref=f19e7] [cursor=pointer]
            - generic [ref=f2e58]:
              - separator [ref=f2e59]
              - paragraph [ref=f2e60]: Or
          - heading [level=2] [ref=f2e61]: Contact information
        - generic [ref=f2e65]:
          - generic [ref=f2e66]:
            - generic [ref=f2e68]:
              - generic [ref=f2e69]: Email
              - textbox [ref=f2e77]:
                - /placeholder: email@example.com
                - text: tunaj2005@yahoo.com
            - heading [level=2] [ref=f2e79]: Payment method
          - list [ref=f2e81]:
            - listitem [ref=f2e86]:
              - generic [ref=f2e99]:
                - radio [ref=f2e100]
                - generic [ref=f2e102]: Card
            - listitem [ref=f2e107]:
              - generic [ref=f2e120]:
                - radio [ref=f2e121]
                - generic [ref=f2e123]: Bancontact
            - listitem [ref=f2e128]:
              - generic [ref=f2e141]:
                - radio [ref=f2e142]
                - generic [ref=f2e144]: MB WAY
            - listitem [ref=f2e149]:
              - generic [ref=f2e162]:
                - radio [ref=f2e163]
                - generic [ref=f2e165]: EPS
            - listitem [ref=f2e169]:
              - generic [ref=f2e182]:
                - radio [ref=f2e183]
                - generic [ref=f2e185]: Satispay
          - button [ref=f2e190] [cursor=pointer]:
            - generic [ref=f2e192]: Pay
            - generic [ref=f2e193]: Processing
        - generic [ref=f2e205]:
          - checkbox [ref=f2e206]
          - text: I am an AI agent acting on behalf of someone else
      - contentinfo [ref=f2e208]:
        - link [ref=f2e210] [cursor=pointer]:
          - /url: https://stripe.com
          - generic [ref=f2e211]: Powered by
        - link [ref=f2e216] [cursor=pointer]:
          - /url: https://stripe.com/legal/end-users
          - text: Terms
        - link [ref=f2e217] [cursor=pointer]:
          - /url: https://stripe.com/privacy
          - text: Privacy
  - dialog [ref=f2e219]:
    - generic [ref=f2e221]:
      - generic [ref=f2e222]:
        - link "Link" [ref=f2e223] [cursor=pointer]:
          - /url: https://link.com/
        - button "close" [ref=f2e232] [cursor=pointer]
      - generic [ref=f2e238]:
        - text: Confirm it’s you
        - generic [ref=f2e239]:
          - generic [ref=f2e240]:
            - text: Enter the code sent to
            - generic [ref=f2e241]: (•••) ••• ••23
            - text: to use your saved information.
          - generic [ref=f2e243]: You are currently testing and no code will be sent. Enter 000000 to continue.
        - generic [ref=f2e246]:
          - textbox "Security code character 1" [active] [ref=f2e247]
          - textbox "Security code character 2" [ref=f2e248]
          - textbox "Security code character 3" [ref=f2e249]
          - textbox "Security code character 4" [ref=f2e250]
          - textbox "Security code character 5" [ref=f2e251]
          - textbox "Security code character 6" [ref=f2e252]
        - button "Send code to email instead" [ref=f2e257] [cursor=pointer]
        - separator [ref=f2e262]
        - generic [ref=f2e263]: Logging in as tunaj2005@yahoo.com. Your device will be remembered for next time.
```

# Test source

```ts
  1  | import type { Page } from '@playwright/test';
  2  | 
  3  | // Helpers for Stripe's hosted Checkout page, built from real accessibility-tree
  4  | // snapshots captured from actual (initially failing) CI runs — not guessed from
  5  | // docs. This is Stripe's modern redesigned Checkout (Apple Pay/Link/Amazon
  6  | // Pay/Bancontact/MB WAY/EPS/Satispay all listed as payment methods), which
  7  | // differs from the classic Stripe.js Card Element in two ways that broke the
  8  | // first two attempts at this file:
  9  | //   1. Card number/Expiration/CVC don't exist in the DOM until the "Card"
  10 | //      payment-method row is selected (Checkout defaults to a collapsed list).
  11 | //   2. Once selected, those fields render as plain top-level accessible
  12 | //      textboxes ("Card number" / "Expiration" / "CVC" / "Cardholder name") —
  13 | //      NOT inside an iframe, and NOT using the classic name="cardnumber"
  14 | //      attribute convention. (Express-payment buttons like Apple Pay/Amazon
  15 | //      Pay *are* iframed, which is what made this look iframe-based at first.)
  16 | 
  17 | export async function fillCheckoutEmail(page: Page, email: string) {
  18 |   const emailField = page.getByRole('textbox', { name: 'Email' }).or(page.getByPlaceholder('email@example.com'));
  19 |   await emailField.fill(email);
  20 | }
  21 | 
  22 | export async function payWithTestCard(page: Page, { cardNumber = '4242424242424242', expiry = '1234', cvc = '123' } = {}) {
  23 |   const cardRadio = page.getByRole('radio', { name: 'Card' });
  24 |   if (await cardRadio.count()) await cardRadio.check({ force: true }).catch(() => {});
  25 | 
> 26 |   await page.getByRole('textbox', { name: 'Card number' }).fill(cardNumber);
     |                                                            ^ Error: locator.fill: Target page, context or browser has been closed
  27 |   await page.getByRole('textbox', { name: 'Expiration' }).fill(expiry);
  28 |   await page.getByRole('textbox', { name: 'CVC' }).fill(cvc);
  29 | 
  30 |   const cardholderName = page.getByRole('textbox', { name: 'Cardholder name' });
  31 |   if (await cardholderName.count()) await cardholderName.fill('E2E Test');
  32 | 
  33 |   // Billing address defaults to "United States", which requires a ZIP — and a
  34 |   // Phone number field is also required. Both are marked [invalid] (empty)
  35 |   // when unfilled, silently blocking submission with no error shown up front —
  36 |   // confirmed via a real run where "Pay" just sat there past its 20s timeout.
  37 |   const zip = page.getByRole('textbox', { name: 'ZIP' });
  38 |   if (await zip.count()) await zip.fill('94103');
  39 | 
  40 |   const phone = page.getByRole('textbox', { name: 'Phone number' });
  41 |   if (await phone.count()) await phone.fill('2015550123');
  42 | 
  43 |   // exact: true matters here — Checkout also has "Pay with Bancontact", "Pay
  44 |   // with MB WAY", etc. rows for the other payment methods, all matching a
  45 |   // substring "Pay"; the actual submit button's accessible name is just "Pay".
  46 |   await page.getByRole('button', { name: 'Pay', exact: true }).click();
  47 | }
  48 | 
  49 | // The "customer chooses" amount field (custom_unit_amount on the Price) renders
  50 | // disabled, pre-filled with the preset amount, next to a "Change amount" button
  51 | // that must be clicked before it accepts input — confirmed via id="customUnitAmount".
  52 | export async function setCustomAmount(page: Page, amount: string) {
  53 |   await page.getByRole('button', { name: 'Change amount' }).click();
  54 |   const amountInput = page.locator('#customUnitAmount');
  55 |   await amountInput.fill(amount);
  56 |   await amountInput.blur();
  57 | }
  58 | 
```