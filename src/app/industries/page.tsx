// src/app/industries/page.tsx
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { StatementBanner } from "@/components/sections/statement-banner";
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
      <StatementBanner
        eyebrow={["Industries", "we know"]}
        imageSide="left"
        image={{
          src: "/brand/dubai-night.jpg",
          alt: "Dubai skyline at night, Burj Khalifa lit up",
        }}
        statement="Every industry below trades in and out of Dubai for a reason."
        body="Fast-moving free zones, real deadlines, and cross-border founders — the same city that makes these businesses possible is the one that makes the paperwork worth getting right."
      />
      <IndustriesGrid />
      <BookConsultationCTA />
    </>
  );
}
