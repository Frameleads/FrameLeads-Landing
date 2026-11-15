# FrameLeads private checkout feedback — Phase 2 controlled validation review

**Review date:** 2026-11-15, Asia/Dubai  
**Decision:** **SAFE TO CONTINUE READ-ONLY AND PREVIEW-ONLY QA; NOT APPROVED FOR PRODUCTION RELEASE OR A STORED VERCEL-RUNTIME WRITE.**  
**Source of truth:** This document supersedes the stale statuses in earlier Phase 2 drafts and runbook entries, but does **not** retroactively authorize operations they describe.

## Immutable scope and release restrictions

- Repository `Frameleads/FrameLeads-Landing`, draft feedback **PR #42**, branch `feat/private-feedback-preview`.
- Already-deployed secure website `main` at `54bb655a64f54fb64f8ff249967667434bec468c` was merged **into the feature branch only** through maintenance **PR #50** on November 15. This does **not** merge PR #42 into `main`.
- Feedback production remains **OFF**. Do not merge PR #42 to `main`, publish the new privacy wording, activate any feedback setting, redeploy production, or make paid infrastructure changes without **separate explicit owner authorization**.
- Keep Sandbox-only Whop PR #49 and Supabase Affiliate Sandbox `kutkuprsehzxmbwasirw` entirely outside this task.
- Do not read, echo, export, log, commit, or use `FEEDBACK_SUPABASE_SECRET_KEY` or `FEEDBACK_RATE_HMAC_SECRET` outside a separately approved server-only runtime path. Do not include them in `NEXT_PUBLIC_` variables, scripts, browser tools, or diagnostic responses.
- No new Supabase branches/projects, Vercel paid plan, public diagnostic endpoint, or production alias reassignment.

## A. Grounded verification completed — Nov 15

### GitHub and Vercel

1. Sync through maintenance PR #50 merged deployed `main` changes onto feedback only; the PR #42 source branch remained **draft/unmerged**, with **zero commits behind main** after sync.
2. GitHub Actions on synced feature commit `cc8d94fd6704bc18bc424fd2ef70e9ce32cb1ddd`:
   - `Feedback validation tests` [run 43715822475](https://github.com/Frameleads/FrameLeads-Landing/actions/runs/43715822475) — **SUCCESS**.
   - `Whop native checkout verification` [run 43715822510](https://github.com/Frameleads/FrameLeads-Landing/actions/runs/43715822510) — **SUCCESS**.
3. Protected Vercel **Preview** for that commit: `https://frameleads-landing-qp95ryvf3-frameleads.vercel.app`, state **READY**. This is not a production deployment.
4. Preview HTTP: `GET /api/feedback` returned **405**; an intentionally invalid-for-release **POST** with a synthetic reason returned **503** and `Cache-Control: no-store` (the collection flag is OFF); there was no Supabase request through this disabled path.
5. Browser preview: feedback panel opened, submission button was initially disabled until a reason was selected, clicking Send showed the preview-only/no-save message and generated **zero** `/api/feedback` network requests. A 390px viewport dialog stayed within screen width with a close button. No actual private feedback was stored.
6. Vercel environment metadata (never decrypted): `FEEDBACK_SUPABASE_SECRET_KEY` and `FEEDBACK_RATE_HMAC_SECRET` are **Sensitive, Production only**; `FEEDBACK_SUPABASE_PROJECT_REF=campgoqhyvniokwvjvtb` is **Production only**; the three release flags remain exactly **false**:
   - `FEEDBACK_COLLECTION_ENABLED`
   - `FEEDBACK_PRODUCTION_RELEASE_APPROVED`
   - `NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED`
   `NEXT_PUBLIC_FEEDBACK_PREVIEW=true` is scoped to the feature branch's Preview environment and never enables storing feedback.
7. Earlier owner-run no-copy Supabase-to-Vercel credential transfer reported success and independent metadata confirmed the correct existing Vercel Sensitive variable was updated. This **does not** establish that a Vercel Node.js function has authenticated successfully with that key.

### Brand Brain Supabase — READ ONLY

- Project `campgoqhyvniokwvjvtb`, never Affiliate Sandbox.
- Both `public.website_feedback` and `public.website_feedback_rate_limits`: **RLS enabled**, **zero policies** (intentional server-only posture), and **zero stored records** after the preview test.
- Anonymous and authenticated roles: no SELECT, INSERT, UPDATE, DELETE privileges on either table. `service_role`: INSERT-only to `website_feedback`; SELECT/INSERT/UPDATE on rate-limit table, no table DELETE grant.
- `public.accept_website_feedback(text,text,text,text,text)`: **SECURITY INVOKER** (not DEFINER), fixed search path; EXECUTE granted to service role only, denied for anon/authenticated.
- Cron jobs `feedback-delete-expired-submissions` (hourly at minute 00, threshold **90 days**) and `feedback-delete-expired-rate-limits` (hourly at minute 05, threshold **48 hours**) are active; latest execution statuses on Nov 15 are **succeeded**, with **zero failures** in the inspected prior 48 hours. Hosted expired-row deletion under real retention aging is not independently established simply by empty-table success.
- Supabase advisor reports `rls_enabled_no_policy` as an **INFO** item for the two feedback tables; this is expected because they are deliberately not accessible from the Data API. No feedback-specific WARN/ERROR was found. Other unrelated project warnings remain outside this change.
- Request-IP header `x-vercel-forwarded-for` is documented by Vercel as equivalent to the platform's forwarded client IP, including protection against direct spoofing of `x-forwarded-for`. Runtime behavior still needs validation before a public launch. See https://vercel.com/docs/headers/request-headers.

## B. Privacy/security review — not final legal approval

1. Staged `src/app/privacy/page.tsx` discloses selected purchase concerns, optional comments (max 1,200 characters), source path (without query), plan context, submission time, pseudonymous rate limiter, Vercel/Supabase processors, 90-day and 48-hour retention, potential international processing, contact `akram@frameleads.io`, and limits of locating anonymous comments. No public review/testimonial is implied and optional advertising consent is independent.
2. **RELEASE HOLD:** The policy is unapproved and **not published** on `frameleads.io`. Obtain owner/legal review for processor naming, privacy rights handling, jurisdictional obligations, sensitive volunteered text, transfer wording, and the stated retention.
3. **DATE CORRECTION REQUIRED ON APPROVED RELEASE ONLY:** The shared `src/components/LegalPageShell.tsx` currently renders **Effective October 13, 2026** for both Terms and Privacy. Publishing a materially amended privacy policy under that old date would misrepresent its effective date. At a separately approved policy publication, make the Privacy effective date correct **without silently changing the Terms effective date**.
4. The UI must continue to say preview/no-save until public collection is separately approved. A visible panel in protected Preview is not an authorization to accept or store production feedback.
5. Do not claim an IP-derived pseudonym is anonymous or claim deletion at exactly 90 days; the scheduled job runs hourly. Do not send visitor message text or raw IPs to CI, browser logs, or PR comments.

## C. Controlled validation plan — explicit gates

### Stage 0 — COMPLETE (no stored feedback)
The synced code passed CI, preview fail-closed GET/POST and no-save UI checks, and Supabase read-only grants/RLS/Cron/status readback. No further stage-0 writes or infrastructure are required.

### Stage 1 — only after **separate permission to make a staged production-environment deployment**
- Lock and review the exact PR #42 commit SHA after any pending edits and green CI.
- Review production project `frameleads-landing` (`prj_RZK6ci9krd8EQPzpFF2vNHI7S3tV`), team `team_jX56ywj76j7NPQT2CaY19x6u`, and release flags **false**.
- Use the authenticated Vercel CLI with **`vercel deploy --prod --skip-domain`** only after explicit owner authorization. Do not use the generic Git deployment API that may automatically assign production domains. A staging production-target build is still a deployment and may consume the free team's quota.
- Verify its source SHA, READY status, absence of any aliases `frameleads.io`/`www.frameleads.io` (compare aliases before and after), and verifiable authentication/protection on the **exact** nonpromoted URL.
- Confirm `GET /api/feedback => 405`, normal synthetic `POST /api/feedback => 503` with `no-store`, and **zero** database rows before/after. Check policy/checkout pages and runtime errors.
- **Interpretation:** proves fail-closed gating only. Since the route returns 503 **before reading its key**, this CANNOT verify Supabase Secret key validity.

### Stage 2 — actual Vercel-runtime-to-Supabase credential test, separately approved
- **NOT IMPLEMENTED OR AUTHORIZED.** Requires a reviewed, explicitly owner-approved one-time, nonpublic approach to test the production server's credential without exposing a writable public endpoint.
- Do not flip either global production release flag to `true`, even temporarily; do not use an obscure route, public bearer nonce, client-supplied header, or unprotected `*.vercel.app` URL as a security boundary.
- Design a *separately authenticated and time-bounded* test harness bound to the exact protected deployment, callable only by the approved tester, not included in production `main`. Prove its access protection before any real write. Keep credentials server-only and never include them in log payloads.
- Before execution: check rows still zero; choose exactly one fixed synthetic `offer_clarity` submission with a unique marker, source `/checkout/core`, plan `core`, and separate test rate-limit fingerprint. Never use real visitor data.
- Require actual Vercel route `HTTP 201 {saved:true}`, then authorized Supabase admin exact-ID readback, guarded deletion of only the synthetic row and its exact rate-limit key, and independent zero-row verification. On mismatch or unexpected data, STOP without claiming success. Do not silently change schema or data.
- If no verifiably protected mechanism is available without cost or public exposure, report **Vercel runtime credential: NOT VERIFIED** and retain the release hold.

### Stage 3 — public launch (not permitted by this request)
Only after Stage 2, legal approval, updated Privacy effective date, browser/mobile UX, operational retention review, and a new explicit owner decision, may the feature PR be considered for merging/deployment and its collection switches enabled. Treat **feedback PR merge, public UI activation, and public server collection** as separate approvals.

## D. Stop conditions and evidence

Stop for any unexpected paid prompt, public alias change, public preview write capability, environment mismatch, secret/key exposure, unauthorized Supabase row, failed RLS/ACL assertion, CI regression, or checkout behavior change. Keep local test results, GitHub SHA/CI run links, deployed/preview deployment ID, URL **without authentication tokens**, exact response statuses, and sanitized zero-row verification.

**No public feedback, no production deployment, no paid resource, no test credential extraction, no PR #42 merge has been performed in this November 15 review.**
