// src/app/case-studies/page.tsx
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { CaseStudiesHero } from "@/components/sections/case-studies-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { CaseStudyGrid } from "@/components/sections/case-study-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { pageMetadata } from "@/lib/content/metadata";
import { pageBanner } from "@/lib/content/page-intros";

export const metadata = pageMetadata("/case-studies");

export default function CaseStudiesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Case Studies", path: "/case-studies" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <CaseStudiesHero />
      <StatementBanner {...pageBanner("/case-studies")} />
      <CaseStudyGrid />
      <BookConsultationCTA />
    </>
  );
}
