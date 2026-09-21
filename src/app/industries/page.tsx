// src/app/industries/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { pageMetadata } from "@/lib/content/metadata";
import { pageHero, pageBanner } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/industries");

export default function IndustriesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Industries", path: "/industries" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero {...pageHero("/industries")} />
      <StatementBanner {...pageBanner("/industries")} />
      <IndustriesGrid />
      <BookConsultationCTA />
    </>
  );
}
