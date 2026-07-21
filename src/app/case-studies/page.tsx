// src/app/case-studies/page.tsx
import { CaseStudiesHero } from "@/components/sections/case-studies-hero";
import { CaseStudyGrid } from "@/components/sections/case-study-grid";

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <CaseStudyGrid />
    </>
  );
}
