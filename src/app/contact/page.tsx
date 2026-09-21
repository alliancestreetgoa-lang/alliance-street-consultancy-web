// src/app/contact/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { ContactSection } from "@/components/sections/contact-section";
import { pageMetadata } from "@/lib/content/metadata";
import { pageHero } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/contact");

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero {...pageHero("/contact")} />
      <ContactSection />
    </>
  );
}
