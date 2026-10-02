# CMS — technical setup and operations

Audience: the developer or administrator who sets the system up and keeps it
running. The client-facing guide is [client-guide.md](client-guide.md).

## Architecture in one page

| Piece | Where | Cost | Holds |
| --- | --- | --- | --- |
| Public website | GitHub Pages (static export of this repo) | Free | Nothing private |
| Content | JSON in `src/content/` + media in `public/brand/`, in this repo | Free | Every version, forever (git history) |
| Content editor | Sveltia CMS at `https://alliance-street-leads.web.app/cms/` | Free | Nothing — it edits the repo through the GitHub API |
| Staff portal | `https://alliance-street-leads.web.app/` (Firebase Hosting) | Within Blaze free quota | Nothing — reads GitHub and Firestore as the signed-in person |
| Sign-in worker | Cloudflare Worker `alliance-street-cms-auth` (code in `admin/auth-worker`) | Free tier | The GitHub token used to save and publish |
| Leads | Firestore `alliance-street-leads` (London) | Within Blaze free quota | Enquiries + staff follow-up |

```
editor saves ──► branch cms/… + pull request ("draft")      live site unchanged
                    │
                    ├─► "Validate content" → Publish check (schemas, links, media, types, lint, tests, build)
                    └─► "Deploy to GitHub Pages" → builds main + every draft → /_preview/pr-<n>/
                                                   → "Preview" status on the draft (View Preview button)
admin checks the preview ─► Publish = merge into main ─► rebuild ─► live in ~2–4 min
rollback = revert pull request ─► previewed and published like any other change
```

### Why the admin is separate from the public site

Draft previews are served from the same origin as the public site
(`alliancestreetgoa-lang.github.io`). A draft can contain code written by
anyone with write access. If the editor also ran on that origin, a crafted
draft preview could read the admin's stored sign-in. So the editor and
staff portal live on `alliance-street-leads.web.app`, a different origin, and
`/admin/` on the public site is only a redirect. Draft code is built in an
unprivileged job with a read-only token and no secrets; the deploy job only
copies the built files.

## The admin account

There is exactly one user, username **admin**, for the staff portal and the
content editor.

- **Password:** stored (hashed) in Firebase Authentication as the user
  `admin@alliance-street-leads.firebaseapp.com` (Firebase needs an email-shaped
  identifier; people type `admin`). Changed from the portal's **Account** page.
  Firebase throttles repeated failures; the worker also limits sign-in attempts
  to 10 a minute per IP address.
- **Leads:** `firestore.rules` admit only a verified username/password account on
  the staff list (`staff/admin@alliance-street-leads.firebaseapp.com`). Google
  sign-in is switched off. Visitors' anonymous form sessions are unchanged.
- **Website:** the editor's **Sign In** button opens the sign-in worker
  (`admin/auth-worker`). After a correct password it hands the editor the GitHub
  token stored as the worker secret `GITHUB_TOKEN`; the portal gets the same
  token from the worker's `/token` endpoint using its Firebase session. The token
  is only ever delivered to `https://alliance-street-leads.web.app`.
- **What a password guess would expose:** everything — publishing to the live
  site and every enquiry. Use a long passphrase.
- The GitHub ruleset on `main` stays on. The token belongs to the repository
  owner, which bypasses review, so publishing works without a second person;
  the rules still block force-pushes, branch deletion and failing checks.

## One-time setup

Steps 1–3 need an account owner; none of them can be done from CI.

### 1. Turn on the GitHub rules (2 minutes)

```sh
bash scripts/setup-github-access.sh
```

Creates the "Protect the live site" ruleset on `main` and confirms the workflow
token is read-only. Re-runnable. Until this has been run, **anyone with write
access can still merge their own drafts**: the roles are not yet enforced.

### 2. Sign-in worker and GitHub token

The worker is deployed (`cd admin/auth-worker && npx wrangler deploy`) on the
Cloudflare account shaukinsv@gmail.com (workers.dev subdomain `alliance-street`).
It needs one secret, a **fine-grained personal access token** created by the
repository owner — this step has to be done by a person:

1. <https://github.com/settings/personal-access-tokens/new> (signed in as
   `alliancestreetgoa-lang`)
   - Token name: `Alliance Street CMS`; Expiration: the longest allowed (note the date)
   - Repository access: **Only select repositories** → `alliance-street-consultancy-web`
   - Repository permissions: **Contents** read & write, **Pull requests** read & write,
     **Issues** read & write (draft labels), **Commit statuses** read,
     **Deployments** read, **Actions** read (Metadata read is automatic)
2. Generate, copy, then in a terminal:
   ```sh
   cd admin/auth-worker && npx wrangler secret put GITHUB_TOKEN   # paste when asked
   ```
3. Before it expires, generate a new one and repeat step 2.

The old GitHub OAuth app ("Alliance Street CMS", client ID `Ov23lijnV3zCD1IhSiSn`)
and the worker secrets `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and
`ALLOWED_DOMAINS` are no longer used and can be deleted
(`npx wrangler secret delete <NAME>`; the OAuth app under GitHub → Settings →
Developer settings).

### 3. Firebase — done 2026-10-02

```sh
npx firebase-tools deploy --only firestore:rules,auth --project alliance-street-leads   # rules + email/password sign-in
npm run admin:deploy                                                                    # staff portal + editor
```

Already in place: the `admin` user (`admin@alliance-street-leads.firebaseapp.com`,
email marked verified, password sign-in only; its uid is `ADMIN_UID` in
`admin/auth-worker/wrangler.toml`), its `staff` document (role `admin`, active),
and Google sign-in switched off. If the admin user is ever recreated, update
`ADMIN_UID` and redeploy the worker, and recreate the `staff` document.

Also in the Firebase console: Authentication → Settings → Authorized domains
must include `alliance-street-leads.web.app` (present by default) and the
GitHub Pages host (needed by the public form's anonymous sign-in).

## Adding people

By design there is one account. Adding more people (with their own logins and
roles) is a developer change: the earlier GitHub/Google per-person setup is in
the git history (before commit "Single admin login").

## Day-to-day operations

| Task | How |
| --- | --- |
| See if the site is live / building / failed | Portal → Website publishing, or the repo's Actions tab |
| A publish failed | The live site keeps the previous version. Open the build log (link in the portal); the failing check names the file and field. |
| Roll back a published change | Portal → Recently published → Roll back → publish the rollback draft |
| Roll back a developer's direct commit | `git revert <sha>` and push (administrator) |
| Rebuild without changes | Actions → Deploy to GitHub Pages → Run workflow |
| Redeploy the portal after code changes | `npm run admin:deploy` |

## Backups and recovery

- **Website content:** every published and draft version is in git. A clone of
  the repository is a complete backup; GitHub keeps it redundantly. To restore
  any file: `git checkout <commit> -- <path>`, commit, push (or use the
  portal's rollback).
- **Media:** in `public/brand/`, versioned the same way.
- **Leads:** the project is on the Blaze (pay-as-you-go) plan with deletion
  protection on. Since 2026-10-02:
  - **Daily backups**, kept 14 days (`firestore:backups:schedules:list` to check).
  - **Point-in-time recovery**, which keeps every version from the last 7 days.

  Restore a backup into a new database with
  `npx firebase-tools firestore:databases:restore --backup <backup-name> --database <new-db> --project alliance-street-leads`
  (list backups with `firestore:backups:list`), then copy back what is needed.
  For PITR, export or read the database as of an earlier time (see Google's
  "Firestore point-in-time recovery" guide). When changing database settings
  from the CLI, always pass `--delete-protection ENABLED`: the update command
  defaults it to disabled. Admins can also export CSV from the portal.
- **Configuration:** `firebase.json`, `firestore.rules` and
  `admin/public/cms/config.yml` are in the repo; redeploy with the commands in
  step 3.
- **Lost administrator:** the repository owner account
  (`alliancestreetgoa-lang`) and the Firebase project owner
  (`alliancestreetgoa@gmail.com`) can always recover access. Keep 2FA and
  recovery codes for both.

## What protects the site from a bad edit

- `tests/content.test.ts` runs in the publish check and again before every
  build. It covers every page and setting against its schema, core pages
  present at their addresses, no duplicate or reserved addresses, every
  internal link pointing at a published page, every media file existing, size
  limits, sourced tax figures, and only known `{{placeholders}}`.
- `tests/cms-config.test.ts` keeps the editor's forms in step with the schemas,
  so a field can't silently fail to save.
- A failing build never deploys; the live site keeps serving the previous version.

## Tests

```sh
npm test            # unit + content + CMS-config tests
npm run test:rules  # Firestore rules in the emulator (needs Java 21)
npm run test:e2e    # built site in Chromium, desktop + mobile, with fixture pages
npm run test:portal # staff portal against the Firebase emulators (synthetic data)
```

## What still needs a developer

- New **section types** or layout changes: add to `src/lib/content/page-schema.ts`,
  `src/components/page/page-renderer.tsx` and `admin/public/cms/config.yml`
  (the tests fail until all three agree).
- New **service categories** or form fields: also touch `firestore.rules`.
- Changing a published **page address** or **service URL** safely (redirects).
- Advisor credentials (`ADVISORS` in `src/lib/site-config.ts`).
- Moving to a custom domain: see the comments in `.github/workflows/deploy-pages.yml`.
- The Telegus integration ([telegus-integration.md](telegus-integration.md)).
- Connecting the newsletter and contact message forms to a real destination.
  Neither stores anything today; see the client guide.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| "Too many attempts" | Wait a minute (worker limit) or a few minutes (Firebase lockout) |
| Editor/portal says "missing GitHub token" or publishing "expired" | Set or renew `GITHUB_TOKEN` (One-time setup §2) |
| Draft has no "View Preview" | The preview builds after the publish check (a few minutes). Failing builds show "Preview: failed" with a log link. |
| Saves succeed, site doesn't change | Draft not published yet, or the publish build failed (Actions tab) |
| A section shows no fields | `config.yml` drifted from the schema; `npm test` names it |
| Leads say "no permission" | The admin's `staff` document is missing or inactive, or the account lost its verified flag |
