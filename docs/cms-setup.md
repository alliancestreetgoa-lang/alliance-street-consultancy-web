# CMS setup

One-time technical setup for the content editor at `/admin`. Do this before
handover; the client never needs to repeat it.

## Why a worker is needed at all

The site is a static export on GitHub Pages — it serves files and runs no
server code. Logging in with GitHub uses the OAuth authorization code flow,
whose final step exchanges a code for a token using a **client secret**. That
exchange must happen somewhere that can hold a secret, which a static host
cannot.

GitHub has not shipped client-side PKCE for single-page apps (it was planned
for Q4 2025 and is on hold), so this cannot currently be avoided. The worker
below exists only to complete that handshake. It stores nothing, and it sees no
content.

## 1. Create a GitHub OAuth app

<https://github.com/settings/developers> → **New OAuth App**

| Field | Value |
| --- | --- |
| Application name | Alliance Street CMS |
| Homepage URL | the live site URL |
| Authorization callback URL | `https://<worker>.workers.dev/callback` (fill in after step 2, then come back) |

Keep the **Client ID** and generate a **Client secret**. The secret is shown
once.

## 2. Deploy the OAuth worker

Sveltia publishes one for Cloudflare Workers. The free tier covers this
comfortably — it handles a handful of logins a month.

```sh
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
npx wrangler deploy
```

Then set the secrets (never commit these):

```sh
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ALLOWED_DOMAINS   # the live site's hostname
```

`ALLOWED_DOMAINS` matters: without it the worker will complete a login for any
site that points at it.

Go back to the OAuth app and set the callback URL to the deployed worker's
`/callback`.

## 3. Point the CMS at it

In `public/admin/config.yml`, replace the placeholder:

```yaml
backend:
  base_url: https://REPLACE-ME.workers.dev   # ← the worker URL
```

Commit and push. The admin is live at `<site>/admin/`.

## 4. Give the client access

Editing commits to this repository, so the client needs a GitHub account with
**write access** to it. Repo settings → Collaborators → add them.

Write access is the whole permission model. Anyone who can log in can edit
everything the CMS exposes — there are no per-section roles. If that is too
broad, the alternative is a separate content repo, which is a larger change.

## What protects the site from a bad edit

`npm run prebuild` runs `validate:content`, so every build re-validates the
content against `src/lib/content/schema.ts`. A malformed or incomplete edit
fails the build and **never reaches the live site** — the deploy step does not
run. Verified behaviour, not theory:

```
$ npm run build            # with a tax figure whose sources were deleted
direct-answers.json → corporate-tax.sources: a figure needs at least one primary source
build exit: 1
out/ absent — nothing was emitted
```

The live site keeps serving the previous version until the content is fixed.

`tests/cms-config.test.ts` separately keeps `config.yml` honest against the
content files, because Sveltia reads that config in the browser: a misspelled
field name would not fail the build, it would just silently fail to save.

## What is deliberately not editable

- **Advisor credentials** (`ADVISORS`, `REGISTRATIONS` in `src/lib/site-config.ts`).
  An ACCA or ICAEW number is checkable against a public register. These are
  added in code, with the certificate in hand.
- **Page layout and design.** The CMS edits content, not structure.
- **Service URLs** are editable but flagged in the UI: changing one breaks
  inbound links and search rankings.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Login loops or "redirect_uri mismatch" | Callback URL in the OAuth app does not exactly match the worker's `/callback`. |
| "Failed to authenticate" | `ALLOWED_DOMAINS` does not include the site's hostname. |
| Saves succeed, site does not change | Check the Actions tab — the build likely failed validation. The error names the file and field. |
| A section shows no fields | `config.yml` path or field name drifted from the content file. `npm test` reports exactly which. |
