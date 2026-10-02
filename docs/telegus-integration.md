# Telegus CRM — future integration point

Status: **deferred**. Nothing is sent to Telegus today; the staff portal shows
"CRM (Telegus): Not connected" on every lead.

## Where it plugs in

- **Source of truth:** Firestore `leads/{leadId}` (visitor-submitted, immutable
  to staff) and `leadAdmin/{leadId}` (staff follow-up).
- **Idempotency key:** the lead ID (the visitor's anonymous Firebase UID). A
  visitor who edits and resubmits in the same session updates the same
  document, so sync must upsert by this ID, never insert blindly.
- **Trigger:** a Cloud Function on `leads/{leadId}` write (`onDocumentWritten`)
  → upsert the contact in Telegus. The project is already on the Blaze plan,
  so Cloud Functions are available (cost at this volume is negligible). A no-billing
  alternative is a scheduled GitHub Action, but that puts a Firebase service
  account and the Telegus key in GitHub secrets. Prefer the function.
- **Credentials:** the Telegus API key goes into Secret Manager for the
  function. Never into this repository, the website bundle or the portal.
- **Delivery state:** add server-owned fields to a new `crmSync/{leadId}`
  document (`status`, `telegusId`, `lastAttemptAt`, `error`). Writing it from
  the function with the Admin SDK bypasses the rules. Then add a read-only rule
  for staff so the portal can show the real state instead of "Not connected":
  ```
  match /crmSync/{leadId} { allow read: if isStaff(); allow write: if false; }
  ```
- **Retries:** let the function retry on failure (`retry: true`) and record
  the error; surface failures in the portal.
- **Bookings:** to mark meetings as confirmed automatically, use verified Zoom
  webhooks and a supported correlation (e.g. the visitor's email in the Zoom
  booking). Never infer confirmation from the calendar being opened.

## What not to change

The visitor rules for `leads` should stay as narrow as they are. CRM state
belongs in its own collection, not in the visitor's document.
