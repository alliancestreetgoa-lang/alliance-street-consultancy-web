// src/app/pricing/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { PricingFactors } from "@/components/sections/pricing-factors";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { pageMetadata } from "@/lib/content/metadata";
import { pageHero, pageBanner } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/pricing");

export default function PricingPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero {...pageHero("/pricing")} />
      <StatementBanner {...pageBanner("/pricing")} />
      <PricingFactors />
      <BookConsultationCTA />
    </>
  );
}
