// src/app/contact/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { ContactSection } from "@/components/sections/contact-section";

export default function ContactPage() {
  return (
    <>
      <PageHero
        badge="Contact"
        title="Tell us what you're working on."
        subhead="Email, WhatsApp, or the form below — an advisor replies within one business day."
      />
      <ContactSection />
    </>
  );
}
