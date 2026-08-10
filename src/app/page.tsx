// src/app/page.tsx
import { Hero } from "@/components/sections/hero";
import { WhyAllianceStreet } from "@/components/sections/why-alliance-street";
import { ServicePreview } from "@/components/sections/service-preview";
import { Process } from "@/components/sections/process";
import { HomeFAQ } from "@/components/sections/home-faq";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { Newsletter } from "@/components/sections/newsletter";
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
