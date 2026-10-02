# Alliance Street Consultancy website

Next.js 16 static site (GitHub Pages) with a git-based CMS, a staff portal and Firebase lead capture.

| | |
| --- | --- |
| Live review site | https://alliancestreetgoa-lang.github.io/alliance-street-consultancy-web/ |
| Staff portal + content editor | https://alliance-street-leads.web.app |
| Client guide | [docs/client-guide.md](docs/client-guide.md) |
| Technical setup, roles, backups | [docs/cms-setup.md](docs/cms-setup.md) |
| Leads | [docs/firebase-leads.md](docs/firebase-leads.md) |

## Develop

```sh
npm ci
npm run optimize:images          # once after a fresh clone (generates the image manifest)
npx next dev -p 3007             # site
npm run admin:dev                # staff portal + editor on :5175 (add ?emulator to use Firebase emulators)
```

Content lives in `src/content/` (pages are `src/content/pages/*.json`: an ordered list of typed sections, see
`src/lib/content/page-schema.ts`). Section components are mapped in `src/components/page/page-renderer.tsx`; the
editor's forms are `admin/public/cms/config.yml`. Tests keep the three in step.

## Check

```sh
npm test && npx tsc --noEmit && npm run lint && npm run build
npm run test:rules    # Firestore rules (Java 21)
npm run test:e2e      # built site, desktop + mobile
npm run test:portal   # staff portal against the emulators
```
