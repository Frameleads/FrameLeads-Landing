# First-party B7.1 measurement

Public `/api/measurement` forwards bounded browser observations to Brand Brain
using the existing Audit secret/URL and source-scoped Vercel OIDC. There is no
browser Supabase access, prospect ID, or canonical conversion submission.

Anonymous ID is a random UUIDv4 in first-party localStorage with a fixed 365-day
expiry. Session ID is a random UUIDv4 per tab, rotating after 30 minutes of
inactivity; every observed interaction renews last activity. If storage is denied,
IDs remain in memory for this page. IDs encode no personal or Audit information.
Only allowlisted attribution fields are normalized. Landing paths omit query/hash;
referrer is a hostname. PII-like/URL/control-character values are rejected.

PAGE_VIEW fires once per path/session. AUDIT_STARTED fires on the first actual
answer. AUDIT_COMPLETED fires when diagnosis completes, independently of work
email capture; it is not CAPTURED_LEAD. VSL_ENGAGED requires 30 cumulative seconds
of verified YouTube playback, excluding pauses and seek jumps. CHECKOUT_INITIATED
is deliberately uninstrumented: this landing's CTA links do not confirm an actual
checkout start. Existing visual design and Audit form behavior are retained.

Provider cookies are read only when present and that provider's browser gate is
exactly `true`. `_fbp`/`_fbc` map to fbp/fbc, `_ttp` to ttp; fbclid/ttclid are
captured from the URL, never invented. Pixel scripts require valid IDs plus
`NEXT_PUBLIC_META_TRACKING_ENABLED=true` / `NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED=true`.
IDs use `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID`. Defaults are OFF.
No email/name advanced matching is implemented. First-party collection works
without Pixels; provider failures never block Audit submission.

Meta browser mapping: PageView, FrameLeadsVslEngaged (custom), AuditStarted
(custom), AuditCompleted (custom), InitiateCheckout (actual start only).
TikTok PAGE_VIEW maps to ViewContent; remaining observations use distinct custom
names or InitiateCheckout. No browser Purchase, captured Lead or qualified Lead
is automatically sent. Legacy marketing notifications remain local UI events.

`observationEventId` and `providerEventId` reproduce B7/PostgreSQL SHA-256 JSON
array identities. `sendPixelCopy` accepts a stable provider ID for a deliberately
matching server copy. Different logical events never share identities. Provider
outage handling/configuration and official references are documented in Brand
Brain `docs/paid-conversion-delivery.md`.

YouTube playback verification uses the official iframe API:
https://developers.google.com/youtube/iframe_api_reference
