# FrameLeads Feedback Intelligence — Phase 2 handoff

**Status: IMPLEMENTED IN CODE, NOT ENABLED.** Owner approved the Phase 1 UI. This is a private Phase 2 implementation draft, not permission to activate production collection.

## Infrastructure and scope
- Marketing application: FrameLeads-Landing (Next.js 16).
- Storage target **only**: Brand Brain Supabase project `campgoqhyvniokwvjvtb`; **never** Affiliate Sandbox `kutkuprsehzxmbwasirw`.
- Draft database DDL: `docs/feedback-phase2-schema-DRAFT.sql` (NOT applied to any live project).
- Public browser POST: `/api/feedback`. The API is disabled unless `FEEDBACK_COLLECTION_ENABLED=true` (server-only).
- UI collection mode is separately disabled unless `NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED=true` (public build flag). The existing Phase 1 `NEXT_PUBLIC_FEEDBACK_PREVIEW=true` keeps a non-collecting preview visible.
- The server uses `FEEDBACK_SUPABASE_SECRET_KEY` (server-only, ideally a dedicated limited-purpose Supabase secret key) and `FEEDBACK_RATE_HMAC_SECRET` (random secret >= 32 characters). **Do not print, paste into chat or commit either.** No production env vars have been set.
- The RPC URL is pinned to Brand Brain to prevent accidentally using Affiliate Sandbox.
- Do not enable collection on any public preview unless it uses a separate authorized staging Supabase branch/project. An SSO-protected Vercel preview is not a staging database.

## Submission contract
- Client sends only `reason` (optional), `optional_message` (optional, <=1200 chars), `plan_context` (known enum).
- At least one of the reason or nonblank message is required. Unknown keys and categories are rejected.
- Server validates origin, JSON content, body size, source path, and option enum, then derives `source_page` from a same-origin referrer (no query string).
- `plan_context` is determined from the checkout route where present. On the homepage it is a contextual hint from the pricing-card UI; do not represent that as independently verified.
- Supabase supplies `created_at` via `now()`; browser cannot set timestamp, identity or arbitrary source.
- Server invokes a role-restricted, SECURITY INVOKER Postgres function: one atomic hourly throttle check (max 4 attempts per pseudonymous key) plus insert.
- Raw IP and full Referer are never written to DB; short-lived rate keys are server-HMACed and rotated daily. The hosting edge must provide trustworthy `x-vercel-forwarded-for`. Missing it falls back to a shared conservative bucket and must be verified before launch.
- No browser localStorage, email collection, third-party chat service, direct Supabase access or publicly readable reviews.
- Success is shown **only** after the RPC returns `stored`. Any storage failure stays an error.

## Privacy and security launch blockers
1. Obtain owner approval of the privacy-policy disclosure, including purpose, retention, contact/rights process, handling of voluntarily submitted personal data in message text, and any relevant jurisdictional rules.
2. Review schema, grants, RLS, function permissions, non-exposed data pathways and security advisors. The DRAFT SQL must become an official Supabase migration through the CLI. Do not write to Brand Brain production before explicit release approval.
3. Choose and verify **automatic deletion**: proposed 90 days for feedback, 48 hours for throttling keys. The schema draft contains cleanup SQL, but no scheduler has been installed. Create an authorized Supabase Cron job (or equivalent), verify it executes, and document the policy.
4. Verify collection does not disclose feedback through Data API: anonymous and authenticated SELECT/INSERT denied; service endpoint can only insert, never list customer responses. Read feedback through Supabase's authenticated admin dashboard initially.
5. Configure new server secrets only in the intended gated environment. Do not reuse or print existing application-wide keys. Never put secrets in `NEXT_PUBLIC_` variables.
6. Verify rate limiting against spoofed headers, missing edge address, concurrent requests, repeat submissions, and request size limits. Add per-route WAF rate limiting if needed.
7. Run lint, tests, typecheck, build, browser QA (desktop/mobile), and an **actual** end-to-end staging submission + readback test. Verify saved rows have correct plan, source and timestamps, and preview-mode never claims save.
8. Conduct a final owner review and activate collection only after all gates pass. Keep the production website and Whop checkout untouched until then.

## Test procedure and expected results
- `npm test` runs the added input/context unit tests.
- `npx tsc --noEmit` verifies types; `npm run build` verifies Next.js route integration.
- Server POST when disabled: 503; GET: 405; untrusted Origin: 403; invalid payload: 400; oversize: 413; rate limit: 429 with Retry-After; successful staging insert: 201 `{ "saved": true }`.
- Database readback in staging: one private row with only reason, optional message, source path, plan context, server timestamp.
- The UI must preserve the approved horizontal desktop layout and mobile accessibility.

## Not part of Phase 2
- No weekly Excel reporting, email delivery or public testimonials yet (Phase 3).
- No admin dashboard web page yet. Secure Supabase dashboard is the initial admin viewer.
- No new paid platform, change to prices, checkout/Whop links, advertising or affiliate workflows.

**Warning:** Until the schema is applied to a controlled test database and secrets/retention/privacy are approved, this feature is not a functioning collection system. Keep collection flags OFF.
