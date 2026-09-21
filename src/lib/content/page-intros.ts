import introsJson from "@/content/sections/page-intros.json";

/**
 * Hero and banner copy for the pages that share those two components.
 *
 * Stored flat (eyebrowLead/eyebrowAccent, imageSrc/imageAlt) rather than in the
 * nested tuple and object the components take. A CMS form edits named fields; a
 * two-element array where position carries meaning is not something an editor
 * can be expected to get right. The mapping back to component props happens
 * here, so the content stays shaped for the person editing it.
 */

type HeroContent = { badge: string; title: string; subhead: string };

type BannerContent = {
  eyebrowLead: string;
  eyebrowAccent: string;
  imageSide: "left" | "right";
  imageSrc: string;
  imageAlt: string;
  statement: string;
  body: string;
};

/** Indexed by route; stored as a list, because a route is not a legal field name. */
const intros = Object.fromEntries(
  (introsJson.intros as { route: string; hero?: HeroContent; banner?: BannerContent }[]).map(
    ({ route, ...content }) => [route, content]
  )
);

export function pageHero(route: string): HeroContent {
  const hero = intros[route]?.hero;
  if (!hero) throw new Error(`No hero content for "${route}" in page-intros.json`);
  return hero;
}

export function pageBanner(route: string) {
  const banner = intros[route]?.banner;
  if (!banner) throw new Error(`No banner content for "${route}" in page-intros.json`);
  return {
    eyebrow: [banner.eyebrowLead, banner.eyebrowAccent] as [string, string],
    imageSide: banner.imageSide,
    image: { src: banner.imageSrc, alt: banner.imageAlt },
    statement: banner.statement,
    body: banner.body,
  };
}
