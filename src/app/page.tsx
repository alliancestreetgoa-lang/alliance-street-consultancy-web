// src/app/page.tsx
import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { WhyAllianceStreet } from "@/components/sections/why-alliance-street";
import { ServicePreview } from "@/components/sections/service-preview";
import { Process } from "@/components/sections/process";
import { HomeFAQ } from "@/components/sections/home-faq";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { Newsletter } from "@/components/sections/newsletter";

// Title and description come from the root layout's `default` — the homepage
// is the one route where the site-wide wording is the right wording. Only the
// self-referencing canonical is set here.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
import { Surface } from "@/components/ui/surface";

export default function Home() {
  // Sections alternate white → black → red down the page.
  return (
    <>
      <Surface tone="light">
        <Hero />
      </Surface>
      <Surface tone="dark">
        <WhyAllianceStreet />
      </Surface>
      <Surface tone="brand">
        <ServicePreview />
      </Surface>
      <Surface tone="light">
        <Process />
      </Surface>
      <Surface tone="dark">
        <HomeFAQ />
      </Surface>
      <Surface tone="brand">
        <BookConsultationCTA />
      </Surface>
      <Surface tone="light">
        <Newsletter />
      </Surface>
    </>
  );
}
