// src/app/terms-and-conditions/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { LegalContent } from "@/components/sections/legal-content";
import { COMPANY } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing use of the Alliance Street Consultancy website and the basis on which we accept client engagements.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: { url: "/terms-and-conditions", title: "Terms & Conditions | Alliance Street Consultancy" },
};

const SECTIONS = [
  {
    heading: "Introduction",
    body: `These terms govern your use of this website and, where a separate engagement letter is signed, your engagement of ${COMPANY.name} for company formation, tax, accounting, or advisory services.`,
  },
  {
    heading: "Services",
    body: "Services described on this website are subject to a formal scope and quote agreed directly with you before any engagement begins. Nothing on this website constitutes a binding offer of services or pricing.",
  },
  {
    heading: "Client Responsibilities",
    body: "You agree to provide accurate, complete information required for formation, tax, or advisory work. Delays or errors caused by inaccurate information supplied to us are not our responsibility.",
  },
  {
    heading: "Fees & Payment",
    body: "Fees for any engagement are agreed in writing before work begins, per the pricing approach described on our Pricing page. Payment terms are set out in your individual engagement letter or invoice.",
  },
  {
    heading: "Limitation of Liability",
    body: "We provide services with reasonable skill and care but do not guarantee specific regulatory outcomes (such as visa approval timelines or bank account approval), which rest with third-party government and financial institutions.",
  },
  {
    heading: "Termination",
    body: "Either party may terminate an ongoing engagement per the notice terms set out in the relevant engagement letter. Fees for work already completed remain payable.",
  },
  {
    heading: "Governing Law",
    body: "These terms are governed by the laws of the United Arab Emirates, without prejudice to any UK-specific terms agreed separately for UK entity work.",
  },
  {
    heading: "Contact",
    body: `Questions about these terms can be sent to ${COMPANY.email} or ${COMPANY.address}.`,
  },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHero
        badge="Legal"
        title="Terms & Conditions"
        subhead="The terms governing use of this website and our engagements."
      />
      <LegalContent lastUpdated="21 July 2026" sections={SECTIONS} />
    </>
  );
}
