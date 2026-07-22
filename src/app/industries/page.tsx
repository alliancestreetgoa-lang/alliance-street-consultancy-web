// src/app/industries/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { IndustriesBanner } from "@/components/sections/industries-banner";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        badge="Industries"
        title="Different businesses, the same advisory standard."
        subhead="We work across a handful of industries closely enough to know what actually breaks — not generic advice with your sector name swapped in."
      />
      <IndustriesBanner />
      <IndustriesGrid />
      <BookConsultationCTA />
    </>
  );
}
