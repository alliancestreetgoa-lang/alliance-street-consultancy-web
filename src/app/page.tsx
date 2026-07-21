// src/app/page.tsx
import { Hero } from "@/components/sections/hero";
import { WhyAllianceStreet } from "@/components/sections/why-alliance-street";
import { ServicePreview } from "@/components/sections/service-preview";
import { Process } from "@/components/sections/process";
import { HomeFAQ } from "@/components/sections/home-faq";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { Newsletter } from "@/components/sections/newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <WhyAllianceStreet />
      <ServicePreview />
      <Process />
      <HomeFAQ />
      <BookConsultationCTA />
      <Newsletter />
    </>
  );
}
