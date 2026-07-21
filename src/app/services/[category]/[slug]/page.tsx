// src/app/services/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/sections/service-detail";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { SERVICES, getService } from "@/lib/services-data";

type Params = { category: string; slug: string };

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ category: service.category, slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) return {};
  return {
    title: `${service.title} | Alliance Street Consultancy`,
    description: service.tagline,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) notFound();

  const related = SERVICES.filter((item) => item.group === service.group && item.slug !== service.slug).slice(0, 4);

  return (
    <>
      <ServiceDetail service={service} related={related} />
      <BookConsultationCTA />
    </>
  );
}
