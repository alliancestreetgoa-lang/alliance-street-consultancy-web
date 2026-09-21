import { Container } from "@/components/ui/container";
import { FramedImage } from "@/components/ui/framed-image";
import { Reveal } from "@/components/ui/scroll-reveal";

type StatementBannerProps = {
  /** The large statement line. Set at the live site's h4 (26px/600). */
  statement: string;
  body: string;
  image: { src: string; alt: string };
  /** Which side the photograph sits on. Defaults to the left. */
  imageSide?: "left" | "right";
  /** Optional two-tone Space Mono eyebrow, e.g. ["Business setup", "simplified"]. */
  eyebrow?: [string, string];
};

/**
 * The live site's image-and-statement band.
 *
 * Replaces four near-identical components (services-banner, industries-banner,
 * pricing-banner, case-studies-banner) that differed only in copy, photograph
 * and which side the photograph sat on.
 */
export function StatementBanner({
  statement,
  body,
  image,
  imageSide = "left",
  eyebrow,
}: StatementBannerProps) {
  const figure = (
    <Reveal delay={imageSide === "left" ? 0 : 0.1}>
      <FramedImage
        src={image.src}
        alt={image.alt}
        aspectClassName="aspect-[3/4]"
        sizes="(min-width: 1024px) 420px, 100vw"
      />
    </Reveal>
  );

  const copy = (
    <Reveal delay={imageSide === "left" ? 0.1 : 0} className="flex flex-col gap-4">
      {eyebrow ? (
        <p className="as-eyebrow">
          {eyebrow[0]} <span className="as-eyebrow-accent">{eyebrow[1]}</span>
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
          imageSide === "left"
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
