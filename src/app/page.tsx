import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/page-renderer";
import { getPageByPath } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/content/metadata";

const page = getPageByPath("/");

export const metadata = page ? pageMetadata(page) : {};

export default function Home() {
  if (!page) notFound();
  return <PageRenderer page={page} />;
}
