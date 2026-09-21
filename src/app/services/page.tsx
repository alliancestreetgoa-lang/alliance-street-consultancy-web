// src/app/services/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { ServicesIndex } from "@/components/sections/services-index";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { pageMetadata } from "@/lib/content/metadata";
import { pageHero, pageBanner } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/services");

export default function ServicesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero {...pageHero("/services")} />
      <StatementBanner {...pageBanner("/services")} />
      <ServicesIndex />
      <BookConsultationCTA />
    </>
  );
}
