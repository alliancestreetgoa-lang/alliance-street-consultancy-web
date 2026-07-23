export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  title: string;
  links: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "UAE Setup",
    links: [
      {
        label: "Free Zone Company Formation",
        href: "/services/uae/free-zone-company-formation",
        description: "Set up in a UAE free zone with 100% ownership.",
      },
      {
        label: "Mainland Company Formation",
        href: "/services/uae/mainland-company-formation",
        description: "Trade anywhere in the UAE and beyond.",
      },
      {
        label: "Offshore Company Formation",
        href: "/services/uae/offshore-company-formation",
        description: "Asset protection and international structuring.",
      },
      {
        label: "PRO Services",
        href: "/services/uae/pro-services",
        description: "Visas, licensing, and government liaison.",
      },
      {
        label: "Corporate Bank Account Assistance",
        href: "/services/uae/corporate-bank-account-assistance",
        description: "Get banked faster with the right documentation.",
      },
    ],
  },
  {
    title: "UAE Tax & Compliance",
    links: [
      {
        label: "Corporate Tax",
        href: "/services/uae/corporate-tax",
        description: "Registration, filing, and planning.",
      },
      {
        label: "VAT Registration",
        href: "/services/uae/vat-registration",
        description: "Get VAT-registered correctly the first time.",
      },
      {
        label: "VAT Return Filing",
        href: "/services/uae/vat-return-filing",
        description: "Accurate, on-time quarterly filings.",
      },
      {
        label: "Audit Support",
        href: "/services/uae/audit-support",
        description: "Be ready before the auditor arrives.",
      },
      {
        label: "Bookkeeping",
        href: "/services/uae/bookkeeping",
        description: "Clean books, every month.",
      },
    ],
  },
  {
    title: "UK Services",
    links: [
      {
        label: "UK Company Formation",
        href: "/services/uk/company-formation",
        description: "Incorporate with Companies House.",
      },
      {
        label: "UK Accounting",
        href: "/services/uk/accounting",
        description: "Statutory accounts, done right.",
      },
      {
        label: "Self Assessment",
        href: "/services/uk/self-assessment",
        description: "Personal tax returns, filed on time.",
      },
      {
        label: "Corporation Tax",
        href: "/services/uk/corporation-tax",
        description: "Compliance and relief planning.",
      },
      {
        label: "UK VAT",
        href: "/services/uk/vat",
        description: "Registration and quarterly returns.",
      },
    ],
  },
  {
    title: "Advisory",
    links: [
      {
        label: "Business Consulting",
        href: "/services/advisory/business-consulting",
        description: "Strategy for growth-stage founders.",
      },
      {
        label: "CFO Services",
        href: "/services/advisory/cfo-services",
        description: "Fractional finance leadership.",
      },
      {
        label: "Tax Planning",
        href: "/services/advisory/tax-planning",
        description: "Structure for what's next.",
      },
      {
        label: "Payroll",
        href: "/services/advisory/payroll",
        description: "Accurate, compliant payroll runs.",
      },
      {
        label: "Business Licensing",
        href: "/services/advisory/business-licensing",
        description: "Renewals and amendments, handled.",
      },
    ],
  },
];

export const PRIMARY_NAV: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Industries", href: "/industries" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Knowledge Centre", href: "/knowledge-centre" },
  { label: "Contact", href: "/contact" },
];

export const COMPANY = {
  name: "Alliance Street Consultancy",
  email: "hello@alliancestreet.ae",
  // Placeholder — real number pending from client. See
  // docs/superpowers/specs/2026-07-21-phase1-design-system-design.md
  phone: "+971 4 XXX XXXX",
  // Placeholder — real WhatsApp number pending from client. See
  // docs/superpowers/specs/2026-07-21-phase1-design-system-design.md
  whatsapp: "+971 5X XXX XXXX",
  address: "Business Bay, Dubai, United Arab Emirates",
};
