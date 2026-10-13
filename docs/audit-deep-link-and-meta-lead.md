# Homepage Audit entry and genuine Meta Lead

## Entry and compatibility

`/?audit=open` displays the original homepage and opens its existing Audit.
Ordinary visits stay closed. CTA entry adds that parameter through Next.js's
native history integration. Close removes only the Audit parameter; campaign
parameters and the hash remain. Back/Forward synchronize the modal. Query-only
changes while open do not reset the questionnaire. `/audit` uses a temporary 307
redirect to the same homepage entry and preserves repeated query parameters.

The existing five-question diagnosis, progressive identity form and workflow
map remain. Opening does not count as activity: the first answer emits
AuditStarted, and the fifth produces AuditCompleted. Neither is a standard Lead.
Question advance is guarded against rapid repeated input. The modal traps focus,
inerts the background, restores scroll and returns focus after its exit completes.
Exit-intent is unmounted during the Audit. Existing privacy choices are preserved;
optional measurement remains off unless its relevant permission was granted.

## Conversion authority: CAPI only

Standard Meta Lead remains exclusively server-side. The local LEAD_CAPTURED UI
notification is not a Pixel event. No browser Lead copy, second Pixel, or new
conversion endpoint is introduced. Browser/CAPI deduplication is therefore not
needed for Lead; the existing server provider identity handles retries.

The public capture endpoint validates contact and Audit data and forwards it to
the existing authenticated Brand Brain ingress. It recognizes success only from
an `ok: true`, `source: WEBSITE_AUDIT` receipt with a valid prospect UUID. The client
likewise requires an explicit `success: true` response before displaying the map.

The concrete integration defect was missing original browser context at that
proxy boundary. Brand Brain's existing Meta projector requires this context for
a canonical captured Lead. With advertising permission, the proxy now forwards
the actual bounded User-Agent and same-origin production Referer, after removing
its query and fragment. Without permission, it forwards neither and strips
advertising matching identifiers. Analytics-only attribution also excludes ad
click and cookie identifiers. Campaign parameters otherwise remain intact.

Brand Brain's existing ingestion transaction creates CAPTURED_LEAD from valid
contact-capture evidence. Audit completion alone creates no Lead. Its existing
projection/outbox uniqueness rules create one provider event per canonical
capture; retries retain that identity. It sends hashed normalized email and
eligible matching/browser context, without Audit answers, diagnosis, company
research or raw email in the Meta payload. No schema or Brand Brain code changes
are included in this branch.

## Validation

- `npm test`: landing contracts, attribution, consent, validation and capture.
- `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build`.
- `npm run test:e2e`: starts a local production server on port 3106 and tests it
  using installed Chrome/Chromium/Edge (set CHROME_PATH when needed). Run a build
  first. Capture and measurement APIs plus external provider requests are
  intercepted. No genuine contacts, outreach, or provider conversions are sent.
  Screenshots are generated under ignored `.next/audit-qa`.
- Brand Brain main was inspected at 40024d8. Existing website Audit and paid
  delivery contract tests run separately with disposable in-memory PGlite and
  mocked transports, including exactly-one canonical Lead and repeated projection.

## Required production verification before advertising

Production activation is **not established by source code or Events Manager
showing an integration**. No authenticated Vercel/operator access was available
for this review; no flags, schedules, tokens, domain controls, campaigns or
production settings were changed.

An authorized operator must confirm all of the following on the actual serving
Brand Brain deployment and existing dataset:

1. The current ingress and canonical browser-context schema are deployed. Check
   the authenticated GET `/api/internal/measurement/paid-conversions` health
   response for `requested_enabled`, `configured`, `enabled`, and `active_from`.
2. META_CONVERSIONS_ENABLED is exactly true, META_CONVERSIONS_ACTIVE_FROM is an
   intentional valid cutoff, META_DATASET_ID matches the existing landing Pixel,
   and the server access token is configured. Inspect presence only; never share
   token values. Separately verify PAID_MEASUREMENT is RUNNING.
3. An authorized projection/dispatch worker actually runs. Enabled configuration
   alone does not drain the outbox. This branch does not activate that worker.
4. After approved deployment, a genuine authorized visitor with advertising
   permission can complete the homepage Audit and submit their real details.
   Use a LOW_CURRENT_PRESSURE diagnosis if checking capture without initiating
   nurture. No test contact or fabricated conversion should enter production.
5. Inspect the existing dataset in Meta Events Manager and the canonical outbox:
   one standard Lead with connection method Server, website action source,
   sanitized page URL, and a successful provider receipt. AuditStarted and
   AuditCompleted stay separate. Repeated capture/projection must retain one
   canonical provider ID. A denied-consent capture must have no Meta eligibility
   context and no Lead delivery for that capture.
6. For Events Manager Test Events, obtain a temporary code and separately
   authorize a bounded genuine capture/delivery test. Do not use the existing
   synthetic `test-smoke` action for this verification: it bypasses the actual
   website capture path and sends synthetic Lead/Purchase fixtures.

If server flags, capture-context persistence or the worker are unavailable,
contact capture still works, but live Meta Lead delivery is **NOT VERIFIED**.
