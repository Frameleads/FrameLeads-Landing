# FrameLeads feedback — gated Vercel runtime validation

**Updated:** 2026-11-13 (Asia/Dubai)  
**Status:** PLAN ONLY. This document does not authorize a deployment, public release, key exposure, or live writes.  
**Projects:** Vercel `frameleads-landing` and Supabase Brand Brain `campgoqhyvniokwvjvtb`. **Never** use Affiliate Sandbox `kutkuprsehzxmbwasirw`.

## Grounded evidence (already complete)

- On November 12 the owner performed one genuine **loopback Next.js HTTP** POST to `/api/feedback`, which returned `201 {"saved":true}`. An authorized Supabase readback identified exactly one synthetic `offer_clarity` row and its daily pseudonymous rate-limit row. Both were deleted by a guarded transaction; independent readback verified zero remaining.
- On November 13 the owner used the authenticated Supabase CLI to select exactly `frameleads_feedback_server_v1` with `sb_secret_` prefix and transferred it without displaying or saving its value into the **existing Production-only Sensitive** Vercel `FEEDBACK_SUPABASE_SECRET_KEY`.
- Vercel metadata independently confirmed that the same env variable ID remained Production-only and Sensitive, with an updated timestamp. The three plain flags remain `false`:
  - `FEEDBACK_COLLECTION_ENABLED`
  - `FEEDBACK_PRODUCTION_RELEASE_APPROVED`
  - `NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED`
- All records in both feedback tables are zero. Both dedicated hourly cleanup jobs remain active.
- This **does not** yet prove the new Vercel Secret works inside a serverless runtime. Existing live deployments do not automatically inherit newly changed environment values.

## Stage 0 — review before any new production-target build

1. Resolve / explicitly review separate security issue **#44**, draft PR **#45** (Next.js patched `16.4.6`). Do not merge until generated lockfile, unit tests, lint, build, dependency audit and buyer flow QA are validated. Verify feedback PR **#42** is updated onto a vetted base only after those checks, without overwriting unrelated changes.
2. Preserve locked-down `public.website_feedback` and `public.website_feedback_rate_limits`: RLS ON, no public policies, RPC callable only by service role, no raw-IP storage.
3. Approve privacy text and effective date before any public feedback collection.
4. Verify connected Vercel project ID `prj_RZK6ci9krd8EQPzpFF2vNHI7S3tV`, team `team_jX56ywj76j7NPQT2CaY19x6u`, Git commit SHA, and the **three false flags**. Do not use any credential-decrypting inspection.
5. Obtain **separate explicit deployment authorization** after the proposed build/QA evidence is reviewed. Previous credential authorization is **not** a general deployment authorization.

## Stage 1 — nonpromoted production-environment deployment (after approval only)

Use the authenticated Vercel CLI on a reviewed, exact checkout; use `vercel deploy --prod --skip-domain` (optionally `--prebuilt` after `vercel build --prod` if its limitations are addressed). Vercel's documented `--skip-domain` avoids automatically assigning the site's live production domains. This is **still a new production-target deployment**, so do not run as part of a read-only review or ordinary preview promotion. A deployment URL is not by itself proof of authentication protection.

Observe:
- Deployment is `READY` and has the exact approved Git commit.
- It has **no aliases** `frameleads.io` or `www.frameleads.io`. Compare the existing production aliases before and after, and stop on any mismatch.
- Public feedback switches remain `false` in Vercel metadata.
- `GET /api/feedback` returns expected `405`.
- A synthetic `POST /api/feedback` returns expected disabled `503` with no database writes. This proves **fail-closed gating**, NOT the Supabase secret's ability to write.
- The website, /privacy, checkout, and mobile flows show no unexpected changes. Inspect serverless errors and no-store caching headers.

## Stage 2 — Vercel-origin credential attestation (separate approval only)

The standard `/api/feedback` route intentionally returns `503` while collection is off, **before** reading the server secret or calling Supabase. It is impossible to truthfully infer runtime credential validity from Stage 1.

A full Vercel-origin `201` requires a separately reviewed and time-limited mechanism that can reach Supabase while preventing any unapproved public feedback writes. **Do not** temporarily set the existing Production or `NEXT_PUBLIC_` release flags to `true`, even in a staged production deployment, and do not expose a diagnostic route with only an obscure path, guessable nonce, or client-controlled header as security. An unpromoted `*.vercel.app` URL may still be externally accessible.

Before considering this stage, require:
1. Verified authentication/protection at the edge for the exact deployed endpoint and a mechanism that cannot accidentally persist in a production merge.
2. One fixed synthetic submission with unique marker, allowlisted origin/path, controlled rate-limit fingerprint, and zero visitor-facing writes; never read, print or echo the Secret API key.
3. Supabase admin readback of exactly one matching row and rate fingerprint, followed by guarded deletion of **only** those exact rows and independent zero-row verification. Any unexpected rows, flags, aliases or security conditions must abort.
4. Document source SHA, deployment ID, protection evidence, POST status, DB record, cleanup result, and rollback/disable checks.

**Stop condition:** Without an approved and verifiably nonpublic Stage 2 mechanism, declare `Vercel runtime credential: NOT YET VERIFIED` and do not enable feedback collection. The prior successful local HTTP test and Vercel environment metadata are not substitutes.

## Explicit prohibitions

No new paid environments or Supabase branches; no key rotation/revocation; no public feedback release; no production domain assignment; no PR merges; no changes to FrameLeads pricing, checkout, affiliates or other applications; no secret values in chat, commands, files, logs, screenshots, GitHub or `NEXT_PUBLIC_` variables.

### Official Vercel documentation

- https://vercel.com/docs/cli/deploy (Production deployment `--skip-domain`)
- https://vercel.com/docs/deployments/promoting-a-deployment
- https://vercel.com/docs/environment-variables
