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
| GitHub sign-in helper | Cloudflare Worker (`sveltia-cms-auth`) | Free tier | Only the OAuth client secret |
| Leads | Firestore `alliance-street-leads` (London) | Within Blaze free quota | Enquiries + staff follow-up |

```
editor saves ──► branch cms/… + pull request ("draft")      live site unchanged
                    │
                    ├─► "Validate content" → Publish check (schemas, links, media, types, lint, tests, build)
                    └─► "Deploy to GitHub Pages" → builds main + every draft → /_preview/pr-<n>/
                                                   → "Preview" status on the draft (View Preview button)
publisher approves (GitHub review) ─► Publish = merge into main ─► rebuild ─► live in ~2–4 min
rollback = revert pull request ─► previewed and published like any other change
```

### Why the admin is separate from the public site

Draft previews are served from the same origin as the public site
(`alliancestreetgoa-lang.github.io`). A draft can contain code written by
anyone with write access. If the editor also ran on that origin, a crafted
draft preview could read a publisher's stored GitHub login. So the editor and
staff portal live on `alliance-street-leads.web.app`, a different origin, and
`/admin/` on the public site is only a redirect. Draft code is built in an
unprivileged job with a read-only token and no secrets; the deploy job only
copies the built files.

## Roles and what enforces them

| Role | Website (enforced by GitHub) | Leads (enforced by `firestore.rules`) |
| --- | --- | --- |
| Administrator | Repository owner. Publishes anything; bypasses review; manages access. Must approve tax figures, code and config. | Everything, incl. managing the staff list and deleting leads |
| Publisher | Collaborator listed for `/src/content/` and `/public/brand/` in `.github/CODEOWNERS`. Approves and publishes other people's drafts. Their own drafts need a second publisher or the administrator. | View, update status, export |
| Editor | Collaborator not in CODEOWNERS. Edits everything, saves drafts, marks them ready. Cannot publish. | View, update status |

Website and lead access are separate lists on purpose. The portal's
**Team & access** screen manages both.

GitHub enforces the website roles through the ruleset created by
`scripts/setup-github-access.sh`. Merges into `main` need an approving code
owner review and passing checks. Only the repository admin can bypass. A
personal (non-organisation) repository has no Maintain role, so publishers
can't publish their own work alone. Moving the repo into a free GitHub
organisation would let publishers bypass review via the Maintain role. That
also changes the github.io address, so it's a decision for later.

## One-time setup

Steps 1–3 need an account owner; none of them can be done from CI.

### 1. Turn on the GitHub rules (2 minutes)

```sh
bash scripts/setup-github-access.sh
```

Creates the "Protect the live site" ruleset on `main` and confirms the workflow
token is read-only. Re-runnable. Until this has been run, **anyone with write
access can still merge their own drafts**: the roles are not yet enforced.

### 2. "Sign in with GitHub" (15 minutes)

The GitHub OAuth code exchange needs a client secret, which a static host can't
keep. A tiny Cloudflare Worker does that one step and stores nothing else.
Until it exists, staff can sign in with a fine-grained personal access token
(Contents, Pull requests, Commit statuses: read/write; Actions: read) on this
repository.

1. **Create the OAuth app.** GitHub has no API for this.
   <https://github.com/settings/developers> → New OAuth App
   - Application name: `Alliance Street CMS`
   - Homepage URL: `https://alliance-street-leads.web.app`
   - Callback URL: `https://alliance-street-cms-auth.<subdomain>.workers.dev/callback` (fix it after step 2b)
   - Generate a client secret.
2. **Deploy the worker** to the Cloudflare account the client will own:
   ```sh
   git clone --depth 1 https://github.com/sveltia/sveltia-cms-auth.git && cd sveltia-cms-auth
   sed -i '' 's/^name = "sveltia-cms-auth"/name = "alliance-street-cms-auth"/' wrangler.toml
   npx wrangler deploy                                 # prints the worker URL
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   npx wrangler secret put ALLOWED_DOMAINS             # alliance-street-leads.web.app
   ```
   Type the secrets yourself; don't paste them into chats or tickets.
   `ALLOWED_DOMAINS` stops other sites using your OAuth app.
3. Set the OAuth app's callback to `<worker-url>/callback`.
4. Put the worker URL in `admin/public/cms/config.yml` → `backend.base_url`
   (no trailing slash) and merge. The editor and portal read this file from
   `main`, so nothing needs redeploying.

### 3. Firebase (10 minutes)

Logged in with `npx firebase-tools login` as a project owner:

```sh
npx firebase-tools deploy --only firestore:rules,auth --project alliance-street-leads   # rules + Google sign-in
npm run admin:deploy                                                                    # staff portal + editor
```

Then add the **first administrator** to the staff list. Nobody can sign in to
the lead tools until someone is on it. Firebase console → Firestore →
Start collection `staff` → Document ID = their Google email in lower case →
fields:

| field | type | value |
| --- | --- | --- |
| `role` | string | `admin` |
| `active` | boolean | `true` |
| `addedBy` | string | `bootstrap` |
| `addedAt` | timestamp | now |

Everyone else is then added from the portal's **Team & access** screen.

Also in the Firebase console: Authentication → Settings → Authorized domains
must include `alliance-street-leads.web.app` (present by default) and the
GitHub Pages host (needed by the public form's anonymous sign-in).

## Inviting and removing people

Done from the staff portal → **Team & access**; the steps below are the manual equivalent.

- **Website editor:** they create a free GitHub account → an administrator
  invites the username (repo Settings → Collaborators, or the portal). They must
  accept the emailed invitation.
- **Make someone a publisher:** add `@username` to the `/src/content/` and
  `/public/brand/` lines of `.github/CODEOWNERS` (the portal does this for you).
- **Lead access:** add their Google email on the staff list with a role.
- **Remove:** remove the collaborator (and their CODEOWNERS entry); delete or
  pause their staff-list entry. Both take effect immediately. If someone leaves
  on bad terms, also revoke their GitHub OAuth authorisation for the app
  (GitHub → Settings → Applications) and review open drafts they authored.

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
| "Sign in with GitHub" loops / redirect_uri mismatch | OAuth app callback isn't exactly `<worker>/callback` |
| "Failed to authenticate" | `ALLOWED_DOMAINS` lacks `alliance-street-leads.web.app` |
| Publish button fails "needs approval" | Working as intended — a publisher must approve; see Roles |
| Draft has no "View Preview" | The preview builds after the publish check (a few minutes). Failing builds show "Preview: failed" with a log link. |
| Saves succeed, site doesn't change | Draft not published yet, or the publish build failed (Actions tab) |
| A section shows no fields | `config.yml` drifted from the schema; `npm test` names it |
| Staff member "not on the staff list" | Their Google email isn't on it, is paused, or differs in spelling |
