// src/app/privacy-policy/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { LegalContent } from "@/components/sections/legal-content";
import { COMPANY } from "@/lib/site-config";
import { pageMetadata } from "@/lib/content/metadata";
import { pageHero } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/privacy-policy");

const SECTIONS = [
  {
    heading: "Introduction",
    body: `${COMPANY.name} ("we", "us") respects your privacy. This policy explains what information we collect through this website and how we use it.`,
  },
  {
    heading: "Information We Collect",
    body: "When you press Continue on our consultation or appointment form, we save your name, country, address, email, contact number, selected services and any notes you provide. We also record the submission time and whether you request an enquiry follow-up or choose appointment booking. These details are saved even if you do not finish the booking. A temporary authentication identifier is kept for the browser session to protect and update your submission.",
  },
  {
    heading: "How We Use Information",
    body: "We use the details you submit to respond to your service enquiry, follow up on your request and coordinate appointments. We do not sell or rent your information to third parties.",
  },
  {
    heading: "Data Sharing",
    body: "We use Google Firebase to store consultation and appointment enquiries. The enquiry database is hosted in London, United Kingdom. Access is restricted through authentication and database rules. If you choose to book an appointment, you open Zoom’s scheduling service and provide booking information there under Zoom’s own privacy terms. Form details are not automatically transferred to Zoom.",
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
      <PageHero {...pageHero("/privacy-policy")} />
      <LegalContent lastUpdated="1 October 2026" sections={SECTIONS} />
    </>
  );
}
