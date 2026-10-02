# Firebase lead capture

Project: `alliance-street-leads` (Alliance Street Leads)
Console: https://console.firebase.google.com/project/alliance-street-leads/firestore
Database: `(default)`, Standard edition, London (`europe-west2`), on the Blaze (pay-as-you-go) plan — usage within the free quotas costs nothing — deletion protection enabled, daily backups (14-day retention) and 7-day point-in-time recovery enabled 2026-10-02.

## Flow

- The consultation and appointment forms validate their required fields, then save to Firestore before revealing step two.
- Continue saves contact details, selected services, notes, source route, server timestamps and notice version. It does not wait for a final enquiry or booking choice.
- A temporary anonymous Firebase identity is stored for the browser session. Its UID is the lead document ID. Retrying or editing in that session updates the same record. A new browser session can produce another lead; this is not global deduplication by email.
- Send enquiry records `enquiryRequested: true`. It does not send an email or notify Telegus.
- Book appointment records `bookingRequested: true` before exposing the Zoom link. This means a preference, not a confirmed booking. The two choices can both be true.
- Server acknowledgement is required before showing success. On failure the form keeps the details and provides a retry; it never claims a failed write succeeded.
- Details remain in Firebase if the visitor abandons the flow or closes the tab after saving. Unsaved form values are not persisted to local storage.

## Reviewing leads

Staff use the **staff portal → Leads** (<https://alliance-street-leads.web.app/leads>), signing in with a Google account on the staff list (`staff/{email}` in Firestore, managed in the portal's Team & access screen). See [client-guide.md](client-guide.md) §8 and [cms-setup.md](cms-setup.md) for roles and the first-administrator bootstrap. The Firebase console still works for project owners.

Staff follow-up (status, meeting confirmed, internal notes) is stored in `leadAdmin/{leadId}`, with an append-only `history` subcollection. It is never written into the visitor's own document.

## Security

`firestore.rules` permits a visitor to create, read and update only their own session's lead, exactly as before. It rejects listing, deletion, invalid fields, unsupported services, ownership changes, changes to creation time, and reversing recorded choices.

Staff access is an explicit allowlist: a Google account with a verified email whose lower-case address has an active `staff/{email}` document. Staff can list and read leads and write `leadAdmin`; they cannot change visitor-submitted fields. Only `admin` can delete leads or manage the staff list, and an admin cannot change or remove their own entry. Everything else is denied by default. Tested in `tests/firestore-rules.test.ts` (`npm run test:rules`).

`src/lib/firebase-config.json` is the public web application configuration, not an administrator credential. It is intentionally included in the static build. Never add service-account keys or Firebase CLI tokens to this repository or browser bundle.

Deploy database rules and sign-in providers with:

```sh
npx firebase-tools deploy --only auth,firestore:rules --project alliance-street-leads
```

Firebase Hosting on this project serves only the staff portal and content editor (`alliance-street-leads.web.app`); the public website and the client's domain are not on it.

The site uses the existing GitHub Pages review deployment. Firebase Hosting and the client’s custom domain are not changed by this integration.

## Verification

`node scripts/check-firebase-leads.mjs` uses synthetic values in the dedicated project to test access rules. It creates a synthetic lead and records the ID in ignored `.firebase-test-records.json`; remove that test lead through an authorized admin after verification. It removes its test authentication identities. It never operates on real leads.

Initial verification: 14 live data/access checks passed, browser submission persisted, choice updates persisted, retry preserved entries, editing updated the existing record, lint/content/unit tests and static production build passed.

## Before public launch and future integration

- Register deployed hosts and enable Firebase App Check for abuse protection. The current setup supports localhost and the GitHub Pages client-review host. Strict rules protect confidentiality, but anonymous authentication alone does not prevent automated spam submissions.
- Review Firebase usage quotas and arrange staff monitoring of the console. Set a budget alert in Google Cloud Billing so unexpected usage (for example form spam) is noticed; the form reports save failure.
- Connect Telegus with server-side credentials and idempotent sync keyed by the Firebase lead ID. Add delivery status, retries and notifications there, updating rules to support any new server-owned fields.
- Use verified Zoom webhooks and a supported correlation mechanism before marking appointments confirmed. Never infer confirmation from a click or calendar opening.
- Have the client review the updated factual privacy notice, retention arrangements and database location before public launch.
- The Next.js framework and its lint configuration were updated before preview publication. Firebase’s gRPC transitive dependency is overridden to a patched compatible version. The website currently exports static pages and uses Firestore Lite in the browser.
