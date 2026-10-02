import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { cardGlassClassName } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import testimonialsContent from "@/content/testimonials.json";
import type { SectionOf } from "@/lib/content/page-schema";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location?: string;
  service?: string;
  approved: boolean;
};

const IS_PREVIEW = process.env.NODE_ENV === "development";

// Only quotes from real clients who agreed to be quoted ship. Sample entries
// show on the local preview — badged — so the layout can be judged before the
// real words arrive, and never reach a production build.
const TESTIMONIALS = (testimonialsContent.items as Testimonial[]).filter(
  (t) => t.approved || IS_PREVIEW
);

/** The "SAMPLE — …" lead-in is a note to the editor, not part of the quote. */
const displayQuote = (quote: string) => quote.replace(/^SAMPLE\s*—[^.]*\.\s*/i, "");

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export function Testimonials({ section }: { section: SectionOf<"testimonials"> }) {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="relative py-24 sm:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={section.eyebrow || undefined}
          title={section.heading}
          align="center"
          className="mx-auto"
        />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, index) => (
            <StaggerItem key={`${t.name}-${index}`} className="flex">
              <figure
                className={cn(
                  cardGlassClassName,
                  "relative flex w-full flex-col gap-6 bg-background transition-shadow duration-300 hover:shadow-card-hover"
                )}
              >
                {!t.approved ? (
                  <span className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-primary">
                    Sample — not published
                  </span>
                ) : null}

                <div className="flex flex-col gap-4">
                  {/* Large opening mark in the brand red, drawn rather than typed
                      so it never picks up the quote's own font metrics. */}
                  <svg
                    aria-hidden
                    viewBox="0 0 32 24"
                    className="h-6 w-8 fill-primary"
                  >
                    <path d="M0 24V14.4C0 6.4 4.4 1.6 12 0l1.6 3.2C9.2 4.6 7.2 7.4 7 11.2H13V24H0Zm19 0V14.4C19 6.4 23.4 1.6 31 0l1 3.2c-4.4 1.4-6.4 4.2-6.6 8H32V24H19Z" />
                  </svg>
                  {t.service ? <span className="as-eyebrow as-eyebrow-accent">{t.service}</span> : null}
                </div>

                <blockquote className="flex-1 text-lg leading-relaxed text-foreground">
                  <p className="text-foreground">&ldquo;{displayQuote(t.quote)}&rdquo;</p>
                </blockquote>

                <figcaption className="flex items-center gap-4 border-t border-border pt-5">
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  >
                    {initials(t.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.role}
                      {t.location ? ` · ${t.location}` : ""}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
