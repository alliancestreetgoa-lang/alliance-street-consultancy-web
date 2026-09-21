// src/app/pricing/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
import { PricingFactors } from "@/components/sections/pricing-factors";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Company formation and advisory pricing depends on your structure. Here's what actually drives the number — and how to get a real quote rather than a rate card.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    url: "/pricing",
    title: "Pricing | Alliance Street Consultancy",
    description:
      "Company formation and advisory pricing depends on your structure. Here's what actually drives the number — and how to get a real quote rather than a rate card.",
  },
};

export default function PricingPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <PageHero
        badge="Pricing"
        title="A real quote, not a rate card."
        subhead="Company formation and advisory pricing depends on your structure — here's what actually shapes the number."
      />
      <StatementBanner
        eyebrow={["Pricing", "explained"]}
        imageSide="right"
        image={{ src: "/brand/finance-chart.jpg", alt: "Financial data on a tablet screen" }}
        statement="The number depends on what we're actually solving, not a rate card."
        body="A quote reflects your jurisdiction, entity count, and whether the work is one-time or ongoing — the same detail that determines whether the engagement actually fits."
      />
      <PricingFactors />
      <BookConsultationCTA />
    </>
  );
}
