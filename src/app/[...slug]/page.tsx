import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/page-renderer";
import { getPageByPath, getPublishedPages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/content/metadata";

type Params = { slug: string[] };

/**
 * Every page except the homepage and service detail pages: the core pages
 * (/about, /pricing, …) and any page created in the CMS. Only published pages
 * are generated; there is no runtime, so anything else is a 404.
 */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getPublishedPages()
    .filter((page) => page.path !== "/")
    .map((page) => ({ slug: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageByPath(`/${slug.join("/")}`);
  return page ? pageMetadata(page) : {};
}

export default async function ContentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPageByPath(`/${slug.join("/")}`);
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
