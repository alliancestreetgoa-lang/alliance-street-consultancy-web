import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";
import { Reveal } from "@/components/ui/scroll-reveal";
import type { SectionOf } from "@/lib/content/page-schema";


/**
 * The live site's image-and-statement band.
 *
 * Replaces four near-identical components (services-banner, industries-banner,
 * pricing-banner, case-studies-banner) that differed only in copy, photograph
 * and which side the photograph sat on.
 */
export function StatementBanner({ section }: { section: SectionOf<"statement"> }) {
  const { statement, body, imageSide } = section;
  const image = section.image?.src ? section.image : undefined;
  const figure = image ? (
    <Reveal delay={imageSide === "left" ? 0 : 0.1}>
      <FramedImage
        src={image.src}
        alt={image.alt}
        position={image.position}
        aspectClassName="aspect-[3/4]"
        sizes="(min-width: 1024px) 420px, 100vw"
      />
    </Reveal>
  ) : null;

  const copy = (
    <Reveal delay={imageSide === "left" ? 0.1 : 0} className="flex flex-col gap-4">
      {section.eyebrowLead || section.eyebrowAccent ? (
        <p className="as-eyebrow">
          {section.eyebrowLead} <span className="as-eyebrow-accent">{section.eyebrowAccent}</span>
        </p>
      ) : null}
      <p className="text-2xl font-semibold leading-snug text-foreground">{statement}</p>
      <p className="text-base text-muted-foreground">{body}</p>
    </Reveal>
  );

  return (
    <section className="py-24 sm:py-32">
      <Container
        className={
          !image ? "max-w-4xl" : imageSide === "left"
            ? "grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16"
            : "grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16"
        }
      >
        {imageSide === "left" ? (
          <>
            {figure}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {figure}
          </>
        )}
      </Container>
    </section>
  );
}
