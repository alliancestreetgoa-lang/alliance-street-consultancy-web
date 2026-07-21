import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SERVICES } from "@/lib/services-data";

const GROUPS: { title: string; category: string }[] = [
  { title: "UAE Setup", category: "uae" },
  { title: "UAE Tax & Compliance", category: "uae" },
  { title: "UK Services", category: "uk" },
  { title: "Advisory", category: "advisory" },
];

export function ServicesIndex() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid gap-16 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-6">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">{group.title}</span>
            <ul className="flex flex-col gap-1">
              {SERVICES.filter((service) => service.group === group.title).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.category}/${service.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <span>
                      <span className="block font-display text-lg font-medium text-foreground">{service.title}</span>
                      <span className="block text-sm text-muted-foreground">{service.tagline}</span>
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}
