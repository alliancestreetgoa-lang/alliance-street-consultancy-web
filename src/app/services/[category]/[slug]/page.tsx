// src/app/services/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/sections/service-detail";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import { SERVICES, getService } from "@/lib/services-data";
import { buildBreadcrumbJsonLd, buildServiceJsonLd, jsonLdScriptProps } from "@/lib/schema";

type Params = { category: string; slug: string };

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ category: service.category, slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) return {};
  const path = `/services/${service.category}/${service.slug}`;
  return {
    // Bare title — the root layout's `title.template` appends
    // " | Alliance Street Consultancy". Appending it here too would double it.
    title: service.title,
    description: service.tagline,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: `${service.title} | Alliance Street Consultancy`,
      description: service.tagline,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) notFound();

  const related = SERVICES.filter((item) => item.group === service.group && item.slug !== service.slug).slice(0, 4);

  // 3-level trail, not 4: there is no /services/[category] index route, and a
  // BreadcrumbList item pointing at a URL that doesn't resolve is invalid.
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.category}/${service.slug}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(buildServiceJsonLd(service))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <ServiceDetail service={service} related={related} />
      <BookConsultationCTA />
    </>
  );
}
