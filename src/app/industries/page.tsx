// src/app/industries/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { IndustriesBanner } from "@/components/sections/industries-banner";
import { IndustriesGrid } from "@/components/sections/industries-grid";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "The industries we work in closely enough to know their regulatory detail — and the same standard of UAE and UK setup, tax and compliance work behind each.",
  alternates: { canonical: "/industries" },
  openGraph: {
    url: "/industries",
    title: "Industries We Serve | Alliance Street Consultancy",
    description:
      "The industries we work in closely enough to know their regulatory detail — and the same standard of UAE and UK setup, tax and compliance work behind each.",
  },
};

export default function IndustriesPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Industries", path: "/industries" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
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
