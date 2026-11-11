# FrameLeads Feedback Intelligence — Zero-new-cost validation (local only)

Status: **Local PostgreSQL QA passed on the owner's Docker workstation; a scoped Brand Brain production DB installation was subsequently completed under owner delegation. Public collection remains OFF.** The local QA steps below remain available for regression testing; they do not authorize a public release.

## Why this path
- Owner declined the $0.01344/hour Supabase branch charge.
- No Supabase development branch/project was created.
- Do not delete or repurpose the existing Affiliate Sandbox or production tables.
- Do not use any live Supabase connection in local tests.
- The runner uses a disposable `postgres:17-alpine` container with `--network none`, no host ports and no persistent volumes. Docker must already be installed and its usage permitted; do not buy or install paid products.
- Source under test: `docs/feedback-phase2-schema-DRAFT.sql`. This is still a reviewed **draft**, not a deployed migration.

## Steps for Codex in the owner’s Windows workspace
1. Open the existing `FrameLeads-Landing` workspace; fetch `feat/private-feedback-preview` / PR #42 without losing uncommitted work.
2. Verify `docker version` and that Docker Desktop/Engine is already available. If absent, stop and report the missing prerequisite; **do not** incur charges or install new commercial products.
3. From Git Bash or WSL, run:
   ```bash
   bash scripts/feedback-local-db-qa.sh
   ```
   It must print `PASS: local PostgreSQL schema, access rules, validation, throttle and concurrency`. Preserve the full test output with secrets/IPs removed.
4. Run application tests:
   ```bash
   node --experimental-strip-types --test tests/feedback-validation.test.ts tests/feedback-target.test.ts
   npm run build
   ```
5. Investigate all failures. Do not misstate success or skip failed security assertions.
6. If available, run browser tests against **local** Next.js with collection OFF; verify the form says preview-only and never claims saved data.
7. Record test environment, Postgres version, output and any blockers in the draft PR.

## What the local database harness checks
- RLS enabled on feedback and throttling tables.
- `anon` / `authenticated` cannot read or write stored comments or rate-limit fingerprints.
- Neither public role can invoke the write function; service role uses SECURITY INVOKER.
- Four allowed writes per fingerprint/hour; the fifth is rejected.
- Invalid reason is rejected; text-only feedback is accepted.
- Stored data includes correct checkout context and server timestamps.
- Ten concurrent requests to a separate fingerprint persist **exactly four rows**.
- On exit, the Docker container is removed and all test data disappears.

## What it does NOT prove
- Supabase-hosted PostgREST authorization, production RLS configuration, Vercel edge IP authenticity, browser-to-API-to-database e2e integration, actual retention execution, or a production response readback.
- Such tests require a subsequent **explicit, separately approved** controlled production release/test after all security/privacy and cost checks.
- The current API is still disabled by `FEEDBACK_COLLECTION_ENABLED` and the UI is preview-only unless collection is explicitly enabled.
- Do not connect production secrets or set collection environment flags in Preview.
- Do not apply the draft SQL to Brand Brain production without separate owner approval.

## Preparing an official migration later
After local database QA passes, use a verified Supabase CLI in the workstation to create the migration using **`supabase migration new website_private_feedback`**. Copy the reviewed SQL into the CLI-generated file; do not invent a timestamp. Keep it on a non-production branch for review. Do not push/apply/merge a migration until the owner authorizes the production database change.

## Retention prerequisite
The proposed 90-day feedback / 48-hour rate-key deletion is not enforced yet. The final plan must explicitly schedule and verify cleanup before public activation, and the privacy disclosure requires approval. The tests here do not close that launch gate.

## Hosted installation follow-up
The reviewed feedback schema and retention jobs were installed into the existing Brand Brain project on November 11, 2026 UTC. The private RPC and retention boundary tests also passed inside rolled-back transactions; the database had zero surviving test records. For the current status and actual migration IDs, use `docs/feedback-phase2-runbook.md`. Live browser-to-Vercel-to-Supabase HTTP submission, Cron's first scheduled execution, and privacy publication remain outstanding.
