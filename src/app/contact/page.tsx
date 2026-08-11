// src/app/contact/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { ContactSection } from "@/components/sections/contact-section";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us what you're working on — by email, WhatsApp, or the form. An Alliance Street advisor replies within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact | Alliance Street Consultancy",
    description:
      "Tell us what you're working on — by email, WhatsApp, or the form. An Alliance Street advisor replies within one business day.",
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero
        badge="Contact"
        title="Tell us what you're working on."
        subhead="Email, WhatsApp, or the form below — an advisor replies within one business day."
      />
      <ContactSection />
    </>
  );
}
