# Search launch and client review

Current status: client review only. Do not migrate DNS or replace Webflow until the client approves.

## Domain and indexing

- `alliancestreet.ae` currently points to the existing Webflow site. GitHub Pages is a separate review copy.
- The root layout marks GitHub/local review builds `noindex, follow`; crawling stays allowed so engines can see that tag. This is not authentication: review URLs remain public.
- For the approved domain launch, set `NEXT_PUBLIC_SITE_URL=https://alliancestreet.ae` and remove `NEXT_PUBLIC_BASE_PATH` from the deployment workflow. Configure the domain on the chosen host and DNS together. On GitHub Pages, configure the custom domain, verify it and enforce HTTPS after certificate provisioning. Do not make only one of these changes.
- Keep www/non-www and HTTP/HTTPS redirects consistent with the chosen canonical host.
- Inventory the existing Webflow sitemap and indexed URLs before switching. Preserve valuable paths or provide permanent redirects at a host that supports them. GitHub Pages cannot implement arbitrary server-side redirects; select the hosting plan accordingly. Do not silently discard existing service URLs.
- Before launch, inspect the production export: self-referencing canonicals, public-domain sitemap and schema IDs, image URLs, no GitHub base path, and no preview noindex. Retain noindex on admin and style-guide pages.

## Search accounts: owner access required

1. Verify the domain property in Google Search Console using the owner's DNS access. Add Bing Webmaster Tools (import the verified Google property if appropriate).
2. Alternative HTML verification is supported through `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` build environment variables. These must be the real values issued to the property owner. Never invent them. DNS verification does not require meta tags.
3. Submit `https://alliancestreet.ae/sitemap.xml` after the approved launch, then inspect representative UK, UAE and e-invoicing pages. Do not submit the GitHub review sitemap for indexing.
4. Request indexing for materially changed priority pages. Submission is discovery, not an assurance of indexing or ranking.
5. Verify the real Google Business Profile and Bing Places listing. Use the actual company name, address, phone, eligibility and office details. Do not invent a UK office, reviews, credentials or service locations.

## Content and credibility review

- Every service has its own geographic search title, description, overview, preparation information and customer question. The visible answer is reused in FAQ structured data.
- Existing numerical tax answers retain their source links and verification dates. A qualified firm reviewer must confirm jurisdiction-specific tax wording before publication, particularly qualifying free-zone income treatment. An SEO change is not a professional tax review.
- Client must confirm the offered scope on each service page, legal company identity, exact office address, professional accreditations and any approved public profiles. Add those verifiable details to About and organization markup when supplied.
- Case studies are explicitly illustrative. Replace with permissioned, substantiated outcomes when available; do not turn examples into claimed client results.
- Keep policy dates and sourced answers accurate when requirements change. Update sitemap modification dates only for meaningful changes.
- Do not add keyword lists, duplicate city pages, purchased links, fabricated statistics, review stars or FAQ claims of guaranteed rich results. FAQ markup does not make a commercial consultancy eligible for Google's restricted FAQ rich-result display.

## Measurement and ongoing work

- Record a Search Console and Bing baseline after ownership is verified: indexed pages, impressions, clicks, queries, country and conversions.
- Start with service-specific UAE/UK queries listed in the client-review keyword map. These are intent hypotheses, not paid-tool search-volume estimates.
- Monitor branded and service discovery in Google, Bing and AI assistants with a consistent set of questions, noting date, country and cited URLs. Search output varies; a single response is not a rank report.
- Measure mobile Core Web Vitals on the approved public domain using PageSpeed Insights and field data when available. No field-performance score is claimed by the local build checks.
- Publish useful articles based on actual client questions and qualified advice, earn relevant editorial mentions, and collect genuine client feedback through approved channels.
- No account submissions, directory messages, DNS changes or public publishing were performed during this review.

## Primary guidance

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Console: https://search.google.com/search-console/about
- Bing Webmaster Tools: https://www.bing.com/webmasters/
