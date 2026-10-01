import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { SERVICES } from "@/lib/content";

const GROUPS = [...new Set(SERVICES.map((service) => service.group))];

export function ServicePreview() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Services" title="Everything we do, in one place." />
          <Button variant="ghost" size="lg" asChild><Link href="/services">View All Services</Link></Button>
        </div>
        <Stagger className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-14">
          {GROUPS.map((group) => (
            <StaggerItem key={group} className="as-neon-card rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h3 className="mb-5 text-xl font-semibold">{group}</h3>
              <ul>
                {SERVICES.filter((service) => service.group === group).map((service) => (
                  <li key={service.slug} className="border-t border-border">
                    <Link href={`/services/${service.category}/${service.slug}`} className="as-service-link group -mx-3 flex items-start justify-between gap-4 rounded-lg px-3 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      <span>
                        <span className="block font-semibold">{service.title}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">{service.tagline}</span>
                      </span>
                      <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-primary transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
