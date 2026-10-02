// src/app/services/[category]/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/sections/service-detail";
import { Cta } from "@/components/sections/content-sections";
import { getPageByPath } from "@/lib/content/pages";
import { SERVICE_PAGE } from "@/lib/content/settings";
import type { SectionOf } from "@/lib/content/page-schema";
import { SERVICES, getService } from "@/lib/services-data";
import { buildBreadcrumbJsonLd, buildServiceJsonLd, buildFaqJsonLd, absoluteUrl, jsonLdScriptProps } from "@/lib/schema";

import heroImages from "@/content/service-hero-images.json";

type Params = { category: string; slug: string };

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ category: service.category, slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) return {};
  const path = `/services/${service.category}/${service.slug}`;
  const title = service.search?.title ?? service.title;
  const description = service.search?.description ?? service.tagline;
  const hero = heroImages.images.find((image) => image.service === `${category}/${slug}`);
  const images = hero ? [{ url: absoluteUrl(hero.src), alt: hero.alt }] : [];
  return {
    // Bare title — the root layout's `title.template` appends
    // " | Alliance Street Consultancy". Appending it here too would double it.
    title,
    description,
    twitter: { card: "summary_large_image", title, description, images },
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: `${title} | Alliance Street`,
      images,
      description,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const service = getService(category, slug);
  if (!service) notFound();

  // The closing call to action mirrors the one on the Services page, so it is
  // edited in one place.
  const closingCta = SERVICE_PAGE.showClosingCta
    ? getPageByPath("/services")?.sections.find((s): s is SectionOf<"cta"> => s.type === "cta" && !s.hidden)
    : undefined;

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
      {service.search && <script {...jsonLdScriptProps(buildFaqJsonLd(service.search.faqs))} />}
      <ServiceDetail service={service} related={related} />
      {closingCta ? <Cta section={closingCta} /> : null}
    </>
  );
}
