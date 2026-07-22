// src/app/case-studies/page.tsx
import { CaseStudiesHero } from "@/components/sections/case-studies-hero";
import { CaseStudiesBanner } from "@/components/sections/case-studies-banner";
import { CaseStudyGrid } from "@/components/sections/case-study-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <CaseStudiesBanner />
      <CaseStudyGrid />
      <BookConsultationCTA />
    </>
  );
}
