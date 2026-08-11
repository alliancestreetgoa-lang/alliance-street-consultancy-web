# Tax figures — sign-off checklist

Every regulatory figure published on a service page is listed here with the
primary source it came from. **These were transcribed from the sources below on
11 August 2026 and have not yet been reviewed by a qualified person at Alliance
Street.** They are live on the service pages, so this review should happen
before the site is deployed publicly.

Nothing here was written from memory. Where a figure could not be confirmed
against a primary source it was left off the page entirely rather than
approximated — those gaps are listed at the end.

## How to review

For each row: open the source, confirm the figure still matches, then update
`VERIFIED` in `src/lib/services-data.ts` to the date you checked. That constant
drives the "Figures verified <date>" line shown to visitors, so it should only
move when someone has actually looked.

---

## UAE

### `/services/uae/corporate-tax`

| Claim on page | Source |
|---|---|
| 0% on taxable income up to AED 375,000 | [UAE Government portal — Corporate tax](https://u.ae/en/information-and-services/finance-and-investment/taxation/corporate-tax) |
| 9% on taxable income above AED 375,000 | same |
| Applies to financial years beginning on or after 1 June 2023 | [Ministry of Finance — Corporate Tax](https://mof.gov.ae/en/public-finance/tax/corporate-tax/) |
| Registration deadlines set by FTA Decision No. 3 of 2024, keyed to trade licence issuance month | [FTA — Decision No. 3 of 2024](https://tax.gov.ae/en/media.centre/news/federal.tax.authority.issues.new.decision.on.specified.timeframes.for.corporate.tax.registration.aspx) |

**Reviewer note:** the page deliberately does not state a single registration
date, because Decision No. 3 of 2024 sets them by licence month. Confirm that is
still the operative mechanism and that no later decision supersedes it.

### `/services/uae/vat-registration`

| Claim on page | Source |
|---|---|
| Mandatory registration above AED 375,000 of taxable supplies and imports over the previous 12 months | [FTA — VAT registration](https://tax.gov.ae/en/taxes/Vat/vat.topics/registration.for.vat.aspx) |
| Also mandatory if expected to exceed within the next 30 days | same |
| Voluntary registration available from AED 187,500 | same |

### `/services/uae/free-zone-company-formation`

| Claim on page | Source |
|---|---|
| A Qualifying Free Zone Person can apply 0% Corporate Tax to Qualifying Income | [Ministry of Finance — Corporate Tax](https://mof.gov.ae/en/public-finance/tax/corporate-tax/) |
| Income outside that definition falls under the standard 0% / 9% rules | [UAE Government portal](https://u.ae/en/information-and-services/finance-and-investment/taxation/corporate-tax) |

**Reviewer note:** the page asserts free zone companies are *not* automatically
exempt. This is the most consequential claim on the site and the one most likely
to be challenged by a prospect — confirm the wording matches current guidance.

## UK

### `/services/uk/company-formation`

| Claim on page | Source |
|---|---|
| At least one director, at least one shareholder, a UK registered office, and a SIC code | [GOV.UK — Set up a limited company](https://www.gov.uk/limited-company-formation) |

### `/services/uk/corporation-tax`

| Claim on page | Source |
|---|---|
| 19% on profits of £50,000 or less | [GOV.UK — Corporation Tax rates](https://www.gov.uk/corporation-tax-rates) |
| 25% on profits above £250,000 | same |
| Marginal Relief between the thresholds | same |
| Limits reduced for short accounting periods and by associated companies | same |
| Corporation Tax payable 9 months and one day after the accounting period ends | [GOV.UK — Company Tax Returns](https://www.gov.uk/company-tax-returns) |
| Company Tax Return due 12 months after the accounting period ends | same |

### `/services/uk/vat`

| Claim on page | Source |
|---|---|
| Register when taxable turnover over the last 12 months exceeds £90,000 | [GOV.UK — VAT registration](https://www.gov.uk/vat-registration/when-to-register) |
| Or when expected to exceed £90,000 in the next 30 days | same |
| Register within 30 days of the end of the month the threshold was crossed | same |
| Registration effective from the first day of the second month after crossing | same |

---

## Deliberately not published

These were wanted for the pages but could not be confirmed against a primary
source, so no figure was written. Supply them and they can be added.

| Wanted | Status |
|---|---|
| UAE Corporate Tax return filing deadline (months after tax period end) | Not stated on the FTA pages checked |
| UAE administrative penalty for late Corporate Tax registration | Referenced via Cabinet Decision No. 75 of 2023 but the amount was not stated on the pages checked |
| UAE standard VAT rate | Not stated on the FTA registration page checked |
| Companies House incorporation fee and turnaround time | Not stated on the GOV.UK page checked |
| Whether non-UK residents may register a UK company | Not addressed on the GOV.UK page checked |
| UK late filing penalty amounts | Referenced but not quantified on the page checked |

## Services with no direct answer yet

14 of 20 service pages carry no sourced paragraph, so they remain thin: the
UAE mainland / offshore / PRO / bank account / VAT return filing / audit support
/ bookkeeping pages, the UK accounting / self-assessment pages, and all five
Advisory pages. Each needs the same treatment — one question-form heading, a
2–5 sentence sourced answer, and a citation.
