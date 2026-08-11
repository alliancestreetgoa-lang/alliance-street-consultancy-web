// src/app/privacy-policy/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { LegalContent } from "@/components/sections/legal-content";
import { COMPANY } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Alliance Street Consultancy collects, uses and protects information submitted through this website.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { url: "/privacy-policy", title: "Privacy Policy | Alliance Street Consultancy" },
};

const SECTIONS = [
  {
    heading: "Introduction",
    body: `${COMPANY.name} ("we", "us") respects your privacy. This policy explains what information we collect through this website and how we use it.`,
  },
  {
    heading: "Information We Collect",
    body: "When you submit a form on this site (such as the contact or newsletter form), we collect the information you provide directly — typically your name, email address, and message. We do not currently collect information automatically through cookies or tracking scripts beyond standard hosting logs.",
  },
  {
    heading: "How We Use Information",
    body: "Information submitted through this site is used only to respond to your enquiry or, for newsletter sign-ups, to send occasional updates you can unsubscribe from at any time. We do not sell or rent your information to third parties.",
  },
  {
    heading: "Data Sharing",
    body: "We do not share your information with third parties except where required to deliver the service you've requested (for example, a regulator or bank as part of a formation engagement you've explicitly instructed us on) or where required by law.",
  },
  {
    heading: "Data Retention",
    body: "We retain enquiry and client information for as long as necessary to provide our services and to meet our own legal and regulatory record-keeping obligations.",
  },
  {
    heading: "Your Rights",
    body: `You can request access to, correction of, or deletion of your personal information by contacting us at ${COMPANY.email}.`,
  },
  {
    heading: "Contact",
    body: `Questions about this policy can be sent to ${COMPANY.email} or ${COMPANY.address}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subhead="How we handle information submitted through this website."
      />
      <LegalContent lastUpdated="21 July 2026" sections={SECTIONS} />
    </>
  );
}
