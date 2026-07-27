# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Stripe checkout (test mode) @payment >> K6: an amount below the €20 minimum is rejected by Stripe, not our app
- Location: e2e/tests/payment.spec.ts:83:3

# Error details

```
Error: Timed out looking for a frame containing input[name="cardnumber"] — Stripe Checkout markup may have changed.
```

# Page snapshot

```yaml
- generic [ref=f2e4]:
  - generic [ref=f2e5]:
    - banner [ref=f2e6]:
      - generic [ref=f2e8]:
        - link "Back to Divine Gold sandbox" [ref=f2e9] [cursor=pointer]:
          - /url: http://localhost:8788/pricing
          - generic [ref=f2e11]:
            - generic [ref=f2e14]: Back
            - heading "Divine Gold sandbox" [level=1] [ref=f2e20]
        - generic [ref=f2e21]: Sandbox
    - generic [ref=f2e24]:
      - heading "Mount Zion Timer — Unlimited" [level=2] [ref=f2e25]
      - generic [ref=f2e28]:
        - generic [ref=f2e29]:
          - generic [ref=f2e30]: €20.00
          - generic [ref=f2e33]: One-time upgrade for unlimited timers in Mount Zion Timer. €20 minimum — pay more if you'd like.
        - generic [ref=f2e44]:
          - textbox [invalid] [ref=f2e49]:
            - /placeholder: €0.00
            - text: €5.00
          - generic [ref=f2e50]:
            - generic:
              - alert: The minimum amount is €20.00.
      - generic:
        - generic:
          - generic:
            - generic:
              - button "Change amount" [disabled]
      - generic [ref=f2e51]: One-time upgrade for unlimited timers in Mount Zion Timer. €20 minimum — pay more if you'd like.
  - generic [ref=f2e56]:
    - main [ref=f2e57]:
      - generic [ref=f2e60]:
        - generic [ref=f2e61]:
          - iframe [ref=f2e62]:
            - generic [ref=f6e6]:
              - iframe [ref=f6e11]:
                - button "Apple Pay" [ref=f18e5] [cursor=pointer]:
                  - img [ref=f18e7]:
                    - img "Apple Logo" [ref=f18e8]
              - button "Pay securely with Link" [ref=f6e14] [cursor=pointer]
              - iframe [ref=f6e24]:
                - button "Amazon Pay - Use your Amazon Pay Sandbox test account" [ref=f19e3]:
                  - img "Amazon Pay" [ref=f19e7] [cursor=pointer]
          - generic [ref=f2e63]:
            - separator [ref=f2e64]
            - paragraph [ref=f2e65]: Or
        - heading "Contact information" [level=2] [ref=f2e66]
      - generic [ref=f2e70]:
        - generic [ref=f2e71]:
          - generic [ref=f2e73]:
            - generic [ref=f2e74]: Email
            - textbox "Email" [ref=f2e82]:
              - /placeholder: email@example.com
              - text: k6-1785172965021@example.com
          - heading "Payment method" [level=2] [ref=f2e84]
        - generic [ref=f2e85]:
          - list [ref=f2e86]:
            - listitem [ref=f2e91]:
              - generic [ref=f2e92]:
                - generic [ref=f2e100]:
                  - generic [ref=f2e104]:
                    - radio "Card" [checked] [ref=f2e105]
                    - generic [ref=f2e107]: Card
                  - generic:
                    - button "Pay with card" [active]
                - generic [ref=f2e113]:
                  - generic [ref=f2e115]:
                    - generic [ref=f2e116]: Card information
                    - group [ref=f2e118]:
                      - generic [ref=f2e119]:
                        - generic [ref=f2e121]:
                          - textbox "Card number" [ref=f2e124]:
                            - /placeholder: 1234 1234 1234 1234
                          - generic:
                            - generic:
                              - generic:
                                - img "Visa"
                            - generic:
                              - generic:
                                - img "MasterCard"
                            - generic:
                              - generic:
                                - img "American Express"
                            - generic:
                              - img "Discover"
                              - img "JCB"
                              - img "Diners Club"
                              - img "UnionPay"
                        - textbox "Expiration" [ref=f2e129]:
                          - /placeholder: MM / YY
                        - generic [ref=f2e131]:
                          - textbox "CVC" [ref=f2e134]
                          - generic:
                            - generic:
                              - img "Credit or debit card CVC"
                  - group "Billing address" [ref=f2e140]:
                    - generic [ref=f2e141]:
                      - generic [ref=f2e143]:
                        - generic [ref=f2e144]: Cardholder name
                        - textbox "Cardholder name" [ref=f2e152]:
                          - /placeholder: Full name on card
                      - generic [ref=f2e154]:
                        - generic [ref=f2e155]: Country or region
                        - group [ref=f2e157]:
                          - generic [ref=f2e158]:
                            - combobox "Country or region" [ref=f2e163]:
                              - option "Afghanistan"
                              - option "Åland Islands"
                              - option "Albania"
                              - option "Algeria"
                              - option "Andorra"
                              - option "Angola"
                              - option "Anguilla"
                              - option "Antarctica"
                              - option "Antigua & Barbuda"
                              - option "Argentina"
                              - option "Armenia"
                              - option "Aruba"
                              - option "Ascension Island"
                              - option "Australia"
                              - option "Austria"
                              - option "Azerbaijan"
                              - option "Bahamas"
                              - option "Bahrain"
                              - option "Bangladesh"
                              - option "Barbados"
                              - option "Belarus"
                              - option "Belgium"
                              - option "Belize"
                              - option "Benin"
                              - option "Bermuda"
                              - option "Bhutan"
                              - option "Bolivia"
                              - option "Bosnia & Herzegovina"
                              - option "Botswana"
                              - option "Bouvet Island"
                              - option "Brazil"
                              - option "British Indian Ocean Territory"
                              - option "British Virgin Islands"
                              - option "Brunei"
                              - option "Bulgaria"
                              - option "Burkina Faso"
                              - option "Burundi"
                              - option "Cambodia"
                              - option "Cameroon"
                              - option "Canada"
                              - option "Cape Verde"
                              - option "Caribbean Netherlands"
                              - option "Cayman Islands"
                              - option "Central African Republic"
                              - option "Chad"
                              - option "Chile"
                              - option "China"
                              - option "Colombia"
                              - option "Comoros"
                              - option "Congo - Brazzaville"
                              - option "Congo - Kinshasa"
                              - option "Cook Islands"
                              - option "Costa Rica"
                              - option "Côte d’Ivoire"
                              - option "Croatia"
                              - option "Curaçao"
                              - option "Cyprus"
                              - option "Czechia"
                              - option "Denmark"
                              - option "Djibouti"
                              - option "Dominica"
                              - option "Dominican Republic"
                              - option "Ecuador"
                              - option "Egypt"
                              - option "El Salvador"
                              - option "Equatorial Guinea"
                              - option "Eritrea"
                              - option "Estonia"
                              - option "Eswatini"
                              - option "Ethiopia"
                              - option "Falkland Islands"
                              - option "Faroe Islands"
                              - option "Fiji"
                              - option "Finland"
                              - option "France"
                              - option "French Guiana"
                              - option "French Polynesia"
                              - option "French Southern Territories"
                              - option "Gabon"
                              - option "Gambia"
                              - option "Georgia"
                              - option "Germany"
                              - option "Ghana"
                              - option "Gibraltar"
                              - option "Greece"
                              - option "Greenland"
                              - option "Grenada"
                              - option "Guadeloupe"
                              - option "Guam"
                              - option "Guatemala"
                              - option "Guernsey"
                              - option "Guinea"
                              - option "Guinea-Bissau"
                              - option "Guyana"
                              - option "Haiti"
                              - option "Honduras"
                              - option "Hong Kong SAR China"
                              - option "Hungary"
                              - option "Iceland"
                              - option "India"
                              - option "Indonesia"
                              - option "Iraq"
                              - option "Ireland"
                              - option "Isle of Man"
                              - option "Israel"
                              - option "Italy"
                              - option "Jamaica"
                              - option "Japan"
                              - option "Jersey"
                              - option "Jordan"
                              - option "Kazakhstan"
                              - option "Kenya"
                              - option "Kiribati"
                              - option "Kosovo"
                              - option "Kuwait"
                              - option "Kyrgyzstan"
                              - option "Laos"
                              - option "Latvia"
                              - option "Lebanon"
                              - option "Lesotho"
                              - option "Liberia"
                              - option "Libya"
                              - option "Liechtenstein"
                              - option "Lithuania"
                              - option "Luxembourg"
                              - option "Macao SAR China"
                              - option "Madagascar"
                              - option "Malawi"
                              - option "Malaysia"
                              - option "Maldives"
                              - option "Mali"
                              - option "Malta"
                              - option "Martinique"
                              - option "Mauritania"
                              - option "Mauritius"
                              - option "Mayotte"
                              - option "Mexico"
                              - option "Moldova"
                              - option "Monaco"
                              - option "Mongolia"
                              - option "Montenegro"
                              - option "Montserrat"
                              - option "Morocco"
                              - option "Mozambique"
                              - option "Myanmar (Burma)"
                              - option "Namibia"
                              - option "Nauru"
                              - option "Nepal"
                              - option "Netherlands"
                              - option "New Caledonia"
                              - option "New Zealand"
                              - option "Nicaragua"
                              - option "Niger"
                              - option "Nigeria"
                              - option "Niue"
                              - option "North Macedonia"
                              - option "Norway"
                              - option "Oman"
                              - option "Pakistan"
                              - option "Palestinian Territories"
                              - option "Panama"
                              - option "Papua New Guinea"
                              - option "Paraguay"
                              - option "Peru"
                              - option "Philippines"
                              - option "Pitcairn Islands"
                              - option "Poland"
                              - option "Portugal"
                              - option "Puerto Rico"
                              - option "Qatar"
                              - option "Réunion"
                              - option "Romania"
                              - option "Russia"
                              - option "Rwanda"
                              - option "Samoa"
                              - option "San Marino"
                              - option "São Tomé & Príncipe"
                              - option "Saudi Arabia"
                              - option "Senegal"
                              - option "Serbia"
                              - option "Seychelles"
                              - option "Sierra Leone"
                              - option "Singapore"
                              - option "Sint Maarten"
                              - option "Slovakia"
                              - option "Slovenia"
                              - option "Solomon Islands"
                              - option "Somalia"
                              - option "South Africa"
                              - option "South Georgia & South Sandwich Islands"
                              - option "South Korea"
                              - option "South Sudan"
                              - option "Spain"
                              - option "Sri Lanka"
                              - option "St. Barthélemy"
                              - option "St. Helena"
                              - option "St. Kitts & Nevis"
                              - option "St. Lucia"
                              - option "St. Martin"
                              - option "St. Pierre & Miquelon"
                              - option "St. Vincent & Grenadines"
                              - option "Sudan"
                              - option "Suriname"
                              - option "Svalbard & Jan Mayen"
                              - option "Sweden"
                              - option "Switzerland"
                              - option "Taiwan"
                              - option "Tajikistan"
                              - option "Tanzania"
                              - option "Thailand"
                              - option "Timor-Leste"
                              - option "Togo"
                              - option "Tokelau"
                              - option "Tonga"
                              - option "Trinidad & Tobago"
                              - option "Tristan da Cunha"
                              - option "Tunisia"
                              - option "Turkey"
                              - option "Turkmenistan"
                              - option "Turks & Caicos Islands"
                              - option "Tuvalu"
                              - option "Uganda"
                              - option "Ukraine"
                              - option "United Arab Emirates"
                              - option "United Kingdom"
                              - option "United States" [selected]
                              - option "Uruguay"
                              - option "Uzbekistan"
                              - option "Vanuatu"
                              - option "Vatican City"
                              - option "Venezuela"
                              - option "Vietnam"
                              - option "Wallis & Futuna"
                              - option "Western Sahara"
                              - option "Yemen"
                              - option "Zambia"
                              - option "Zimbabwe"
                            - textbox "ZIP" [ref=f2e168]
            - listitem [ref=f2e173]:
              - generic [ref=f2e182]:
                - generic [ref=f2e186]:
                  - radio "Bancontact" [ref=f2e187]
                  - generic [ref=f2e189]: Bancontact
                - generic:
                  - button "Pay with Bancontact"
            - listitem [ref=f2e194]:
              - generic [ref=f2e203]:
                - generic [ref=f2e207]:
                  - radio "MB WAY" [ref=f2e208]
                  - generic [ref=f2e210]: MB WAY
                - generic:
                  - button "Pay with MB WAY"
            - listitem [ref=f2e215]:
              - generic [ref=f2e224]:
                - generic [ref=f2e228]:
                  - radio "EPS" [ref=f2e229]
                  - generic [ref=f2e231]: EPS
                - generic:
                  - button "Pay with EPS"
            - listitem [ref=f2e235]:
              - generic [ref=f2e244]:
                - generic [ref=f2e248]:
                  - radio "Satispay" [ref=f2e249]
                  - generic [ref=f2e251]: Satispay
                - generic:
                  - button "Pay with Satispay"
          - generic [ref=f2e260]:
            - generic [ref=f2e264]:
              - checkbox "Save my information for faster checkout" [checked] [ref=f2e266] [cursor=pointer]
              - generic [ref=f2e267]:
                - generic [ref=f2e268]: Save my information for faster checkout
                - generic [ref=f2e271]: Pay securely at Divine Gold sandbox and everywhere Link is accepted.
            - generic [ref=f2e278]:
              - generic [ref=f2e279]: Phone number
              - generic [ref=f2e282]:
                - generic:
                  - generic:
                    - generic:
                      - img "US"
                    - combobox "Phone number country code" [ref=f2e283]:
                      - option "Afghanistan (+93)"
                      - option "Albania (+355)"
                      - option "Algeria (+213)"
                      - option "Andorra (+376)"
                      - option "Angola (+244)"
                      - option "Anguilla (+1)"
                      - option "Antigua & Barbuda (+1)"
                      - option "Argentina (+54)"
                      - option "Armenia (+374)"
                      - option "Aruba (+297)"
                      - option "Ascension Island (+247)"
                      - option "Australia (+61)"
                      - option "Austria (+43)"
                      - option "Azerbaijan (+994)"
                      - option "Åland Islands (+358)"
                      - option "Bahamas (+1)"
                      - option "Bahrain (+973)"
                      - option "Bangladesh (+880)"
                      - option "Barbados (+1)"
                      - option "Belarus (+375)"
                      - option "Belgium (+32)"
                      - option "Belize (+501)"
                      - option "Benin (+229)"
                      - option "Bermuda (+1)"
                      - option "Bhutan (+975)"
                      - option "Bolivia (+591)"
                      - option "Bosnia & Herzegovina (+387)"
                      - option "Botswana (+267)"
                      - option "Brazil (+55)"
                      - option "British Indian Ocean Territory (+246)"
                      - option "British Virgin Islands (+1)"
                      - option "Brunei (+673)"
                      - option "Bulgaria (+359)"
                      - option "Burkina Faso (+226)"
                      - option "Burundi (+257)"
                      - option "Cambodia (+855)"
                      - option "Cameroon (+237)"
                      - option "Canada (+1)"
                      - option "Cape Verde (+238)"
                      - option "Caribbean Netherlands (+599)"
                      - option "Cayman Islands (+1)"
                      - option "Central African Republic (+236)"
                      - option "Chad (+235)"
                      - option "Chile (+56)"
                      - option "China (+86)"
                      - option "Colombia (+57)"
                      - option "Comoros (+269)"
                      - option "Congo - Brazzaville (+242)"
                      - option "Congo - Kinshasa (+243)"
                      - option "Cook Islands (+682)"
                      - option "Costa Rica (+506)"
                      - option "Côte d’Ivoire (+225)"
                      - option "Croatia (+385)"
                      - option "Curaçao (+599)"
                      - option "Cyprus (+357)"
                      - option "Czechia (+420)"
                      - option "Denmark (+45)"
                      - option "Djibouti (+253)"
                      - option "Dominica (+1)"
                      - option "Dominican Republic (+1)"
                      - option "Ecuador (+593)"
                      - option "Egypt (+20)"
                      - option "El Salvador (+503)"
                      - option "Equatorial Guinea (+240)"
                      - option "Eritrea (+291)"
                      - option "Estonia (+372)"
                      - option "Eswatini (+268)"
                      - option "Ethiopia (+251)"
                      - option "Falkland Islands (+500)"
                      - option "Faroe Islands (+298)"
                      - option "Fiji (+679)"
                      - option "Finland (+358)"
                      - option "France (+33)"
                      - option "French Guiana (+594)"
                      - option "French Polynesia (+689)"
                      - option "Gabon (+241)"
                      - option "Gambia (+220)"
                      - option "Georgia (+995)"
                      - option "Germany (+49)"
                      - option "Ghana (+233)"
                      - option "Gibraltar (+350)"
                      - option "Greece (+30)"
                      - option "Greenland (+299)"
                      - option "Grenada (+1)"
                      - option "Guadeloupe (+590)"
                      - option "Guam (+1)"
                      - option "Guatemala (+502)"
                      - option "Guernsey (+44)"
                      - option "Guinea (+224)"
                      - option "Guinea-Bissau (+245)"
                      - option "Guyana (+592)"
                      - option "Haiti (+509)"
                      - option "Honduras (+504)"
                      - option "Hong Kong SAR China (+852)"
                      - option "Hungary (+36)"
                      - option "Iceland (+354)"
                      - option "India (+91)"
                      - option "Indonesia (+62)"
                      - option "Iraq (+964)"
                      - option "Ireland (+353)"
                      - option "Isle of Man (+44)"
                      - option "Israel (+972)"
                      - option "Italy (+39)"
                      - option "Jamaica (+1)"
                      - option "Japan (+81)"
                      - option "Jersey (+44)"
                      - option "Jordan (+962)"
                      - option "Kazakhstan (+7)"
                      - option "Kenya (+254)"
                      - option "Kiribati (+686)"
                      - option "Kosovo (+383)"
                      - option "Kuwait (+965)"
                      - option "Kyrgyzstan (+996)"
                      - option "Laos (+856)"
                      - option "Latvia (+371)"
                      - option "Lebanon (+961)"
                      - option "Lesotho (+266)"
                      - option "Liberia (+231)"
                      - option "Libya (+218)"
                      - option "Liechtenstein (+423)"
                      - option "Lithuania (+370)"
                      - option "Luxembourg (+352)"
                      - option "Macao SAR China (+853)"
                      - option "Madagascar (+261)"
                      - option "Malawi (+265)"
                      - option "Malaysia (+60)"
                      - option "Maldives (+960)"
                      - option "Mali (+223)"
                      - option "Malta (+356)"
                      - option "Martinique (+596)"
                      - option "Mauritania (+222)"
                      - option "Mauritius (+230)"
                      - option "Mayotte (+262)"
                      - option "Mexico (+52)"
                      - option "Moldova (+373)"
                      - option "Monaco (+377)"
                      - option "Mongolia (+976)"
                      - option "Montenegro (+382)"
                      - option "Montserrat (+1)"
                      - option "Morocco (+212)"
                      - option "Mozambique (+258)"
                      - option "Myanmar (Burma) (+95)"
                      - option "Namibia (+264)"
                      - option "Nauru (+674)"
                      - option "Nepal (+977)"
                      - option "Netherlands (+31)"
                      - option "New Caledonia (+687)"
                      - option "New Zealand (+64)"
                      - option "Nicaragua (+505)"
                      - option "Niger (+227)"
                      - option "Nigeria (+234)"
                      - option "Niue (+683)"
                      - option "North Macedonia (+389)"
                      - option "Norway (+47)"
                      - option "Oman (+968)"
                      - option "Pakistan (+92)"
                      - option "Palestinian Territories (+970)"
                      - option "Panama (+507)"
                      - option "Papua New Guinea (+675)"
                      - option "Paraguay (+595)"
                      - option "Peru (+51)"
                      - option "Philippines (+63)"
                      - option "Poland (+48)"
                      - option "Portugal (+351)"
                      - option "Puerto Rico (+1)"
                      - option "Qatar (+974)"
                      - option "Réunion (+262)"
                      - option "Romania (+40)"
                      - option "Russia (+7)"
                      - option "Rwanda (+250)"
                      - option "Samoa (+685)"
                      - option "San Marino (+378)"
                      - option "São Tomé & Príncipe (+239)"
                      - option "Saudi Arabia (+966)"
                      - option "Senegal (+221)"
                      - option "Serbia (+381)"
                      - option "Seychelles (+248)"
                      - option "Sierra Leone (+232)"
                      - option "Singapore (+65)"
                      - option "Sint Maarten (+1)"
                      - option "Slovakia (+421)"
                      - option "Slovenia (+386)"
                      - option "Solomon Islands (+677)"
                      - option "Somalia (+252)"
                      - option "South Africa (+27)"
                      - option "South Korea (+82)"
                      - option "South Sudan (+211)"
                      - option "Spain (+34)"
                      - option "Sri Lanka (+94)"
                      - option "St. Barthélemy (+590)"
                      - option "St. Helena (+290)"
                      - option "St. Kitts & Nevis (+1)"
                      - option "St. Lucia (+1)"
                      - option "St. Martin (+590)"
                      - option "St. Pierre & Miquelon (+508)"
                      - option "St. Vincent & Grenadines (+1)"
                      - option "Sudan (+249)"
                      - option "Suriname (+597)"
                      - option "Svalbard & Jan Mayen (+47)"
                      - option "Sweden (+46)"
                      - option "Switzerland (+41)"
                      - option "Taiwan (+886)"
                      - option "Tajikistan (+992)"
                      - option "Tanzania (+255)"
                      - option "Thailand (+66)"
                      - option "Timor-Leste (+670)"
                      - option "Togo (+228)"
                      - option "Tokelau (+690)"
                      - option "Tonga (+676)"
                      - option "Trinidad & Tobago (+1)"
                      - option "Tristan da Cunha (+290)"
                      - option "Tunisia (+216)"
                      - option "Turkey (+90)"
                      - option "Turkmenistan (+993)"
                      - option "Turks & Caicos Islands (+1)"
                      - option "Tuvalu (+688)"
                      - option "Uganda (+256)"
                      - option "Ukraine (+380)"
                      - option "United Arab Emirates (+971)"
                      - option "United Kingdom (+44)"
                      - option "United States (+1)" [selected]
                      - option "Uruguay (+598)"
                      - option "Uzbekistan (+998)"
                      - option "Vanuatu (+678)"
                      - option "Vatican City (+39)"
                      - option "Venezuela (+58)"
                      - option "Vietnam (+84)"
                      - option "Wallis & Futuna (+681)"
                      - option "Western Sahara (+212)"
                      - option "Yemen (+967)"
                      - option "Zambia (+260)"
                      - option "Zimbabwe (+263)"
                - textbox "Phone number" [ref=f2e285]:
                  - /placeholder: (201) 555-0123
        - generic [ref=f2e287]:
          - button "Pay" [ref=f2e290] [cursor=pointer]:
            - generic:
              - generic [ref=f2e292]: Pay
              - generic [ref=f2e293]: Processing
          - generic [ref=f2e312]:
            - text: By paying, you agree to Link’s
            - link "Terms" [ref=f2e313] [cursor=pointer]:
              - /url: https://link.com/terms
            - text: and
            - link "Privacy" [ref=f2e314] [cursor=pointer]:
              - /url: https://link.com/privacy
            - text: .
      - generic [ref=f2e315]:
        - checkbox "I am an AI agent acting on behalf of someone else" [ref=f2e316]
        - text: I am an AI agent acting on behalf of someone else
    - contentinfo [ref=f2e318]:
      - link [ref=f2e320] [cursor=pointer]:
        - /url: https://stripe.com
        - generic [ref=f2e321]:
          - text: Powered by
          - img "Stripe" [ref=f2e323]
      - link "Terms" [ref=f2e326] [cursor=pointer]:
        - /url: https://stripe.com/legal/end-users
      - link "Privacy" [ref=f2e327] [cursor=pointer]:
        - /url: https://stripe.com/privacy
```

# Test source

```ts
  1  | import type { Frame, Page } from '@playwright/test';
  2  | 
  3  | // Helpers for Stripe's hosted Checkout page, built from an actual failed CI run's
  4  | // captured accessibility snapshot (not guessed from docs) — see the payment.spec.ts
  5  | // history for the real DOM this was reverse-engineered from. Two things this
  6  | // accounts for that a naive Elements-style automation script misses:
  7  | //   1. The card number/expiry/CVC fields don't exist in the DOM at all until the
  8  | //      "Card" payment-method row is actually selected — Checkout defaults to
  9  | //      showing a collapsed list of methods (Card/Bancontact/MB WAY/EPS/Satispay/…).
  10 | //   2. Those fields, once they do render, live inside an iframe (like the Apple
  11 | //      Pay / Amazon Pay express buttons do) — Playwright's top-level
  12 | //      page.fill()/page.locator() never reaches into iframe content, only
  13 | //      frame.locator() on the specific frame does.
  14 | 
  15 | export async function fillCheckoutEmail(page: Page, email: string) {
  16 |   const emailField = page.getByRole('textbox', { name: 'Email' }).or(page.getByPlaceholder('email@example.com'));
  17 |   await emailField.fill(email);
  18 | }
  19 | 
  20 | async function findCardFrame(page: Page, timeoutMs = 15000): Promise<Frame> {
  21 |   const start = Date.now();
  22 |   while (Date.now() - start < timeoutMs) {
  23 |     for (const frame of page.frames()) {
  24 |       const count = await frame.locator('input[name="cardnumber"]').count().catch(() => 0);
  25 |       if (count > 0) return frame;
  26 |     }
  27 |     await page.waitForTimeout(300);
  28 |   }
> 29 |   throw new Error('Timed out looking for a frame containing input[name="cardnumber"] — Stripe Checkout markup may have changed.');
     |         ^ Error: Timed out looking for a frame containing input[name="cardnumber"] — Stripe Checkout markup may have changed.
  30 | }
  31 | 
  32 | export async function payWithTestCard(page: Page, { cardNumber = '4242424242424242', expiry = '1234', cvc = '123' } = {}) {
  33 |   // Card is usually the default/first method, but this is harmless if it's
  34 |   // already selected, and necessary if it isn't.
  35 |   const cardRadio = page.getByRole('radio', { name: 'Card' });
  36 |   if (await cardRadio.count()) await cardRadio.check({ force: true }).catch(() => {});
  37 | 
  38 |   const frame = await findCardFrame(page);
  39 |   await frame.locator('input[name="cardnumber"]').fill(cardNumber);
  40 |   await frame.locator('input[name="exp-date"]').fill(expiry);
  41 |   await frame.locator('input[name="cvc"]').fill(cvc);
  42 | 
  43 |   await page.getByRole('button', { name: 'Pay', exact: false }).click();
  44 | }
  45 | 
  46 | // The "customer chooses" amount field (custom_unit_amount on the Price) renders
  47 | // disabled, pre-filled with the preset amount, next to a "Change amount" button
  48 | // that must be clicked before it accepts input — confirmed via id="customUnitAmount".
  49 | export async function setCustomAmount(page: Page, amount: string) {
  50 |   await page.getByRole('button', { name: 'Change amount' }).click();
  51 |   const amountInput = page.locator('#customUnitAmount');
  52 |   await amountInput.fill(amount);
  53 |   await amountInput.blur();
  54 | }
  55 | 
```