// src/app/pricing/page.tsx
import { PageHero } from "@/components/sections/page-hero";
import { PricingBanner } from "@/components/sections/pricing-banner";
import { PricingFactors } from "@/components/sections/pricing-factors";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export default function PricingPage() {
  return (
    <>
      <PageHero
        badge="Pricing"
        title="A real quote, not a rate card."
        subhead="Company formation and advisory pricing depends on your structure — here's what actually shapes the number."
      />
      <PricingBanner />
      <PricingFactors />
      <BookConsultationCTA />
    </>
  );
}
