/**
 * A sourced, self-contained answer to the regulatory question the page's own
 * title implies — the rate, threshold or deadline a reader actually came for.
 *
 * Every figure must trace to a primary source (FTA, UAE Ministry of Finance,
 * GOV.UK). Two rules, both non-negotiable for YMYL tax content:
 *
 *  1. Never write a figure from memory. If it isn't in `sources`, it doesn't
 *     go on the page.
 *  2. `verifiedOn` is the date a human last checked the figures against those
 *     sources. Thresholds and deadlines change by legislative amendment; a
 *     stale date is a signal to re-check, not decoration.
 *
 * See docs/tax-figures-review.md for the sign-off checklist.
 */
export type DirectAnswer = {
  /** Question-form heading. Matches how the query is actually typed. */
  question: string;
  /** 2–5 sentences. Self-contained: readable with no surrounding context. */
  answer: string;
  sources: { label: string; url: string }[];
  /** ISO date, last human verification against the primary sources. */
  verifiedOn: string;
};

export type Service = {
  category: "uae" | "uk" | "advisory";
  group: "UAE Setup" | "UAE Tax & Compliance" | "UK Services" | "Advisory";
  slug: string;
  title: string;
  tagline: string;
  includes: string[];
  whoFor: string;
  /**
   * Optional. Present only where figures have been verified against primary
   * sources — 6 of 20 services today. The rest deliberately have none rather
   * than plausible-sounding filler.
   */
  directAnswer?: DirectAnswer;
};

const FTA_CT_REGISTRATION = {
  label: "Federal Tax Authority — Decision No. 3 of 2024, registration timeframes",
  url: "https://tax.gov.ae/en/media.centre/news/federal.tax.authority.issues.new.decision.on.specified.timeframes.for.corporate.tax.registration.aspx",
};
const FTA_VAT_REGISTRATION = {
  label: "Federal Tax Authority — VAT registration",
  url: "https://tax.gov.ae/en/taxes/Vat/vat.topics/registration.for.vat.aspx",
};
const UAE_GOV_CT = {
  label: "UAE Government portal — Corporate tax",
  url: "https://u.ae/en/information-and-services/finance-and-investment/taxation/corporate-tax",
};
const MOF_CT = {
  label: "UAE Ministry of Finance — Corporate Tax",
  url: "https://mof.gov.ae/en/public-finance/tax/corporate-tax/",
};
const GOVUK_CT_RATES = { label: "GOV.UK — Corporation Tax rates", url: "https://www.gov.uk/corporation-tax-rates" };
const GOVUK_CT_RETURNS = { label: "GOV.UK — Company Tax Returns", url: "https://www.gov.uk/company-tax-returns" };
const GOVUK_VAT = { label: "GOV.UK — VAT registration", url: "https://www.gov.uk/vat-registration/when-to-register" };
const GOVUK_FORMATION = { label: "GOV.UK — Set up a limited company", url: "https://www.gov.uk/limited-company-formation" };

/** Date the figures below were last checked against the sources above. */
const VERIFIED = "2026-08-11";

export const DIRECT_ANSWERS: Record<string, DirectAnswer> = {
  "corporate-tax": {
    question: "What is the UAE corporate tax rate, and when do I have to register?",
    answer:
      "UAE Corporate Tax is charged at 0% on taxable income up to AED 375,000 and 9% on taxable income above that threshold. It applies to financial years beginning on or after 1 June 2023. Registration deadlines are set by FTA Decision No. 3 of 2024 and depend on when your trade licence was issued rather than on a single national cut-off date, so two businesses in the same free zone can have different deadlines. We work out your specific date, register you, and take over the filing calendar from there.",
    sources: [UAE_GOV_CT, MOF_CT, FTA_CT_REGISTRATION],
    verifiedOn: VERIFIED,
  },
  "vat-registration": {
    question: "When does a UAE business have to register for VAT?",
    answer:
      "VAT registration is mandatory once the total value of your taxable supplies and imports exceeds AED 375,000 over the previous 12 months, or when you expect to exceed it within the next 30 days. Voluntary registration is available from AED 187,500, which is often worth taking early if you are incurring recoverable input VAT before revenue arrives. The obligation is forward-looking, so a single large contract can trigger it before your trailing revenue does.",
    sources: [FTA_VAT_REGISTRATION],
    verifiedOn: VERIFIED,
  },
  "free-zone-company-formation": {
    question: "Do free zone companies still pay UAE corporate tax?",
    answer:
      "A free zone company is not automatically exempt. A Free Zone Person that meets the conditions to be treated as a Qualifying Free Zone Person can apply a 0% Corporate Tax rate to its Qualifying Income, but income falling outside that definition is taxed under the standard rules — 0% up to AED 375,000 and 9% above. Which of your revenue streams qualify depends on what you actually do and who you invoice, so the structure decision and the tax outcome are the same decision.",
    sources: [MOF_CT, UAE_GOV_CT],
    verifiedOn: VERIFIED,
  },
  "company-formation": {
    question: "What do I need to register a UK limited company?",
    answer:
      "A UK limited company needs at least one director, at least one shareholder (who may be the same person), a registered office address in the UK, and a SIC code describing what the company does. Incorporation itself is quick; the parts that take planning are the registered office, the share structure, and getting the SIC code right, because it follows the company into bank onboarding and HMRC records.",
    sources: [GOVUK_FORMATION],
    verifiedOn: VERIFIED,
  },
  "corporation-tax": {
    question: "What are the UK corporation tax rates and deadlines?",
    answer:
      "UK Corporation Tax is charged at 19% on profits of £50,000 or less and 25% on profits above £250,000, with Marginal Relief tapering the rate between those two thresholds. Both limits are reduced proportionately for short accounting periods and by the number of associated companies. The two deadlines run in an order that surprises people: Corporation Tax is usually payable 9 months and one day after the end of the accounting period, but the Company Tax Return is not due until 12 months after it — so the money is due before the return that calculates it.",
    sources: [GOVUK_CT_RATES, GOVUK_CT_RETURNS],
    verifiedOn: VERIFIED,
  },
  vat: {
    question: "What is the UK VAT registration threshold?",
    answer:
      "You must register for UK VAT when your total taxable turnover for the last 12 months goes over £90,000, or when you expect it to go over £90,000 in the next 30 days. Registration is due within 30 days of the end of the month in which you crossed the threshold, and registration takes effect from the first day of the second month after you went over.",
    sources: [GOVUK_VAT],
    verifiedOn: VERIFIED,
  },
};

export const GROUP_IMAGES: Record<Service["group"], { src: string; alt: string; caption: string; aspectClassName: string }> = {
  "UAE Setup": {
    src: "/brand/dubai-skyline-photo.jpg",
    alt: "Dubai skyline at sunset including the Burj Khalifa",
    caption: "Dubai, UAE",
    aspectClassName: "aspect-[4/3]",
  },
  "UAE Tax & Compliance": {
    src: "/brand/finance-chart.jpg",
    alt: "Financial data on a tablet screen",
    caption: "Filing & Compliance",
    aspectClassName: "aspect-[4/3]",
  },
  "UK Services": {
    src: "/brand/architecture.jpg",
    alt: "Modern corporate office building",
    caption: "UK Services",
    aspectClassName: "aspect-[4/3]",
  },
  Advisory: {
    src: "/brand/advisor-portrait.png",
    alt: "Alliance Street advisor",
    caption: "Advisory",
    aspectClassName: "aspect-[3/4]",
  },
};

// Raw catalogue. DIRECT_ANSWERS is merged in below by slug rather than being
// inlined here, so the sourced regulatory copy stays in one reviewable block.
const SERVICE_CATALOGUE: Service[] = [
  {
    category: "uae",
    group: "UAE Setup",
    slug: "free-zone-company-formation",
    title: "Free Zone Company Formation",
    tagline: "Set up in a UAE free zone with 100% foreign ownership.",
    includes: [
      "Free zone selection matched to your trade licence activity",
      "Licence application and document preparation",
      "Visa quota setup for you and your team",
      "Corporate bank account introduction",
      "Registered office / flexi-desk arrangement",
    ],
    whoFor:
      "Founders who want full ownership of their UAE company without a local partner, and who trade internationally rather than directly with the UAE mainland market.",
  },
  {
    category: "uae",
    group: "UAE Setup",
    slug: "mainland-company-formation",
    title: "Mainland Company Formation",
    tagline: "Trade anywhere in the UAE and beyond.",
    includes: [
      "Activity and legal structure selection with the Department of Economic Development",
      "Local service agent arrangement where required",
      "Trade licence application and approvals",
      "Office lease coordination — a physical address is mandatory for mainland",
      "Visa allocation setup",
    ],
    whoFor:
      "Businesses that need to trade directly with the UAE mainland market, bid on government-adjacent contracts, or open multiple branches across the Emirates.",
  },
  {
    category: "uae",
    group: "UAE Setup",
    slug: "offshore-company-formation",
    title: "Offshore Company Formation",
    tagline: "Asset protection and international structuring.",
    includes: [
      "Jurisdiction selection (JAFZA, RAK ICC, and others)",
      "Company incorporation and share structuring",
      "Registered agent and registered office",
      "Nominee director/shareholder options where appropriate",
      "Ongoing renewal management",
    ],
    whoFor:
      "Business owners structuring for asset protection, holding company purposes, or international trade who don't need a physical UAE presence or visas.",
  },
  {
    category: "uae",
    group: "UAE Setup",
    slug: "pro-services",
    title: "PRO Services",
    tagline: "Visas, licensing, and government liaison.",
    includes: [
      "Employee and dependent visa processing",
      "Emirates ID and medical test coordination",
      "Licence renewals and amendments",
      "Labour card and MOHRE filings",
      "Government portal liaison so you're not the one in the queue",
    ],
    whoFor:
      "Companies who want visa and licensing admin handled end-to-end instead of navigating GDRFA, MOHRE, and free zone portals themselves.",
  },
  {
    category: "uae",
    group: "UAE Setup",
    slug: "corporate-bank-account-assistance",
    title: "Corporate Bank Account Assistance",
    tagline: "Get banked faster with the right documentation.",
    includes: [
      "Bank shortlist matched to your business activity and nationality mix",
      "Document package preparation (KYC, business plan, source of funds)",
      "Relationship manager introductions",
      "Application tracking and follow-up",
      "Guidance on compliance questions before they become rejections",
    ],
    whoFor:
      "Newly formed companies — and existing companies switching banks — who want to avoid the account-opening delays that stall a business in its first months.",
  },
  {
    category: "uae",
    group: "UAE Tax & Compliance",
    slug: "corporate-tax",
    title: "Corporate Tax",
    tagline: "Registration, filing, and planning.",
    includes: [
      "Corporate tax registration with the FTA",
      "Taxable income calculation and return preparation",
      "Free zone qualifying income assessment",
      "Group and related-party transaction review",
      "Ongoing filing and deadline management",
    ],
    whoFor:
      "Any UAE-registered business now inside the corporate tax regime, from single free zone entities to multi-company groups.",
  },
  {
    category: "uae",
    group: "UAE Tax & Compliance",
    slug: "vat-registration",
    title: "VAT Registration",
    tagline: "Get VAT-registered correctly the first time.",
    includes: [
      "Mandatory vs voluntary registration assessment",
      "FTA portal application and document submission",
      "Tax group registration for related entities where beneficial",
      "Post-registration compliance setup",
      "Guidance on invoicing and record-keeping requirements",
    ],
    whoFor:
      "Businesses approaching or past the AED 375,000 mandatory threshold, or founders who want to register voluntarily to reclaim input VAT early.",
  },
  {
    category: "uae",
    group: "UAE Tax & Compliance",
    slug: "vat-return-filing",
    title: "VAT Return Filing",
    tagline: "Accurate, on-time quarterly filings.",
    includes: [
      "Quarterly VAT return preparation and FTA submission",
      "Input/output VAT reconciliation",
      "Reverse charge and import VAT handling",
      "Refund claim preparation where applicable",
      "Deadline tracking so nothing is filed late",
    ],
    whoFor: "VAT-registered businesses who want filings handled by someone who reviews the numbers, not just submits them.",
  },
  {
    category: "uae",
    group: "UAE Tax & Compliance",
    slug: "audit-support",
    title: "Audit Support",
    tagline: "Be ready before the auditor arrives.",
    includes: [
      "Books and records review ahead of statutory audit",
      "Supporting documentation preparation",
      "Liaison with your appointed auditor",
      "Correction of gaps before they become audit findings",
      "Post-audit compliance follow-up",
    ],
    whoFor: "Free zone and mainland companies facing their annual statutory audit requirement, especially first-time filers.",
  },
  {
    category: "uae",
    group: "UAE Tax & Compliance",
    slug: "bookkeeping",
    title: "Bookkeeping",
    tagline: "Clean books, every month.",
    includes: [
      "Monthly transaction recording and reconciliation",
      "Accounts payable and receivable tracking",
      "Bank reconciliation",
      "Management reports you can actually read",
      "A books-ready-for-audit standard, maintained continuously",
    ],
    whoFor:
      "Founders who'd rather run their business than manage a spreadsheet, and want books that are always ready for tax filing or investor due diligence.",
  },
  {
    category: "uk",
    group: "UK Services",
    slug: "company-formation",
    title: "UK Company Formation",
    tagline: "Incorporate with Companies House.",
    includes: [
      "Company name check and incorporation filing",
      "Registered office address service",
      "Share structure and director appointments",
      "SIC code and Companies House compliance setup",
      "Handover to ongoing UK accounting from day one",
    ],
    whoFor:
      "Founders — often based outside the UK — who need a UK Ltd to serve UK clients, hold UK assets, or trade with Companies House-registered counterparties.",
  },
  {
    category: "uk",
    group: "UK Services",
    slug: "accounting",
    title: "UK Accounting",
    tagline: "Statutory accounts, done right.",
    includes: [
      "Monthly or quarterly bookkeeping",
      "Statutory annual accounts preparation",
      "Companies House and HMRC filing",
      "Management accounts on request",
      "Coordination with your UAE entity's accounting, if you have one",
    ],
    whoFor: "UK Ltd companies who want statutory compliance handled by someone who also understands the UAE side of a founder's business.",
  },
  {
    category: "uk",
    group: "UK Services",
    slug: "self-assessment",
    title: "Self Assessment",
    tagline: "Personal tax returns, filed on time.",
    includes: [
      "Self Assessment registration with HMRC",
      "Income, dividend, and expense review",
      "Return preparation and submission",
      "Payment on account calculations",
      "Deadline reminders so January 31st isn't a surprise",
    ],
    whoFor: "UK company directors, sole traders, and UK tax residents with income that needs declaring outside PAYE.",
  },
  {
    category: "uk",
    group: "UK Services",
    slug: "corporation-tax",
    title: "Corporation Tax",
    tagline: "Compliance and relief planning.",
    includes: [
      "Corporation tax computation and CT600 filing",
      "Reliefs and allowances review (R&D, capital allowances, and others)",
      "Group relief assessment for multi-entity structures",
      "HMRC correspondence handling",
      "Payment deadline and instalment planning",
    ],
    whoFor:
      "UK limited companies who want their corporation tax filed accurately and want to know what reliefs they're entitled to, not just what they owe.",
  },
  {
    category: "uk",
    group: "UK Services",
    slug: "vat",
    title: "UK VAT",
    tagline: "Registration and quarterly returns.",
    includes: [
      "VAT registration assessment and application",
      "Making Tax Digital-compliant quarterly returns",
      "Flat rate vs standard scheme comparison",
      "Import/export VAT handling for cross-border trade",
      "Deadline tracking and HMRC correspondence",
    ],
    whoFor: "UK-incorporated businesses trading above the VAT threshold, or founders who want to register voluntarily ahead of it.",
  },
  {
    category: "advisory",
    group: "Advisory",
    slug: "business-consulting",
    title: "Business Consulting",
    tagline: "Strategy for growth-stage founders.",
    includes: [
      "Business model and market-entry review",
      "Jurisdiction and structuring strategy across UAE and UK",
      "Operational process review",
      "Growth planning tied to real financial constraints",
      "Direct access to an advisor, not a generic playbook",
    ],
    whoFor:
      "Founders past the initial setup stage who need a sounding board for the next decision — expansion, restructuring, or a new market.",
  },
  {
    category: "advisory",
    group: "Advisory",
    slug: "cfo-services",
    title: "CFO Services",
    tagline: "Fractional finance leadership.",
    includes: [
      "Monthly management accounts and board-ready reporting",
      "Cash flow forecasting and runway modeling",
      "Budgeting and financial planning",
      "Investor and lender reporting support",
      "Finance function setup as you hire your first internal team",
    ],
    whoFor: "Scaling businesses that need senior finance leadership but aren't ready for a full-time CFO hire.",
  },
  {
    category: "advisory",
    group: "Advisory",
    slug: "tax-planning",
    title: "Tax Planning",
    tagline: "Structure for what's next.",
    includes: [
      "Cross-border UAE/UK tax exposure review",
      "Corporate structure optimization",
      "Profit extraction and remuneration planning",
      "Transaction and exit structuring",
      "Coordination with legal counsel where structuring requires it",
    ],
    whoFor:
      "Business owners and groups planning a significant change — a new entity, an exit, or cross-border expansion — who want the tax implications mapped before, not after.",
  },
  {
    category: "advisory",
    group: "Advisory",
    slug: "payroll",
    title: "Payroll",
    tagline: "Accurate, compliant payroll runs.",
    includes: [
      "Monthly payroll processing across UAE and/or UK entities",
      "WPS (Wage Protection System) compliance for UAE payroll",
      "PAYE, National Insurance, and pension compliance for UK payroll",
      "Payslip issuance and record-keeping",
      "End-of-service and leaver calculations",
    ],
    whoFor: "Employers running payroll in the UAE, the UK, or both, who want it accurate and compliant without running it themselves.",
  },
  {
    category: "advisory",
    group: "Advisory",
    slug: "business-licensing",
    title: "Business Licensing",
    tagline: "Renewals and amendments, handled.",
    includes: [
      "Trade licence renewal tracking and processing",
      "Activity amendments and additions",
      "Shareholder and structure changes",
      "Licence cancellation where a business is winding down",
      "Compliance calendar so nothing lapses",
    ],
    whoFor: "Existing UAE company owners who want licence admin handled proactively rather than discovered as a deadline that's already passed.",
  },
];

export const SERVICES: Service[] = SERVICE_CATALOGUE.map((service) => {
  const directAnswer = DIRECT_ANSWERS[service.slug];
  return directAnswer ? { ...service, directAnswer } : service;
});

export function getService(category: string, slug: string) {
  return SERVICES.find((service) => service.category === category && service.slug === slug);
}
