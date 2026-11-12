# FrameLeads Feedback: controlled hosted HTTP test

**Status: PREPARED, NOT RUN.** Do not claim a successful website HTTP save until the actual request and admin readback have been observed.

## Why it is not running automatically
The connected Supabase app can query and migrate the Brand Brain database, but cannot create or retrieve a new **secret** API key. Public/publishable keys are not substitutes. To avoid reusing another service's privileged key, create one separately named key through the project's authenticated Supabase Dashboard.

The key is highly privileged; even though the route only invokes the feedback RPC, the key itself has broader project-level service-role privileges. It MUST stay in Vercel's **Production-only server-side Sensitive** environment variables. Never put it in source code, CLI arguments, a browser `NEXT_PUBLIC_` variable, a PR comment, or this chat.

## Step 1 — One secure dashboard action
- Open `https://supabase.com/dashboard/project/campgoqhyvniokwvjvtb/settings/api-keys`, use **Publishable and secret API keys**, and create a separate named `sb_secret_...` key for `frameleads-feedback-ingest`.
- Store it directly in Vercel project `frameleads-landing` → Settings → Environment Variables:
  `FEEDBACK_SUPABASE_SECRET_KEY`; scope **Production** only; type **Sensitive**. Do not paste the key into chat.
- We have already configured `FEEDBACK_RATE_HMAC_SECRET` (Sensitive), `FEEDBACK_SUPABASE_PROJECT_REF=campgoqhyvniokwvjvtb`, and three explicit `false` public/production collection gates in Production. **Do not turn any of those gates on.**
- If unable to create an independently revocable named secret key, **STOP**. Do not use another app's secret, an anon key, or a public function without authorization.

## Easier Windows option (recommended)

The Codex **cloud** chat cannot accept a secure-key prompt. Use a **Windows PowerShell terminal on your own computer** instead.

From a local checkout of PR #42 (`feat/private-feedback-preview`), run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-feedback-hosted-smoke.ps1
```

This helper checks for Node/npm, builds the code with the public form OFF, asks for the key with a no-echo local prompt, runs the one-shot test, and clears its temporary process environment on exit. It never reads Vercel's Sensitive value. The key can be obtained only through a secure owner-controlled channel, such as the authorized Supabase API Keys dashboard/password manager. If the original key is unavailable, do not attempt to extract it from Vercel; stop and handle key replacement safely.

If the source is not on the Windows computer, use an authenticated Git client to create a **fresh, separate checkout** from `https://github.com/Frameleads/FrameLeads-Landing` branch `feat/private-feedback-preview`, then run the same PowerShell helper there. Do not copy secrets into a cloud Codex environment or paste them in chat.

## Step 2 — Local HTTP smoke without exposing the website
Run this only in the existing PR #42 worktree after the correct Next.js build. No production deployment or public form is required.

The checked-in one-shot script `scripts/feedback-hosted-http-smoke.mjs` requires an explicit local opt-in `FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB=YES` and one dedicated Supabase `sb_secret_*` key supplied as a process environment variable. It creates a fresh local-only HMAC rate secret if none is supplied; **the stored Sensitive Vercel production HMAC secret is never exported.** The script starts Next.js on `127.0.0.1`, changes the collection flags **inside that local child process only**, makes ONE real POST to Brand Brain, and requires HTTP 201 `{saved:true}`.

**Important:** Vercel Sensitive/Secret environment values are not generally readable after saving. Do not assume `vercel env run` can retrieve or export them for this local script. Instead, pass the newly created dedicated key to the local process through a secure terminal prompt or a trusted local secrets manager, without saving it in the repository, shell history, or chat. Example for an authenticated owner-operated PowerShell terminal:

```powershell
$secureKey = Read-Host 'Paste the separately named Supabase secret key' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
  $env:FEEDBACK_SUPABASE_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $env:FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB = 'YES'
  node scripts/feedback-hosted-http-smoke.mjs
} finally {
  Remove-Item Env:\FEEDBACK_SUPABASE_SECRET_KEY, Env:\FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}
```

**Do not run** until the dedicated `sb_secret_...` key has been created and the proper application build is ready. Do not commit, log, or print environment secrets. The script prints only a synthetic UUID marker and test-only pseudonymous rate fingerprint. It must report `PASS` based on an actual HTTP 201 saved acknowledgment, not a mock.

## Step 3 — Privileged readback and exact cleanup
Use the authorized Supabase admin connector **after** a real HTTP 201. Read back the synthetic row using the exact marker printed by the smoke script and verify:
- Precisely one feedback record for the marker
- `reason='offer_clarity'`, `source_page='/checkout/core'`, `plan_context='core'`
- Server-set `created_at`

Then delete exactly that record by its verified `id`. Delete only the rate-limit row matching the script's printed fingerprint. Confirm both deleted rows are absent.

Do not delete other feedback or generic rate-limit rows. On any error, retain the marker for investigation and cleanup; do not claim full PASS until readback and cleanup succeed.

## Separate launch gates
- Hosted `cron.job_run_details`: confirm **actual successful scheduled executions** for both jobs, not merely active schedules.
- Privacy legal review of the staged changes, then publication and effective-date update in the real Privacy Policy.
- Hosted Vercel-to-Supabase integration still requires separate verification because this loopback smoke exercises the actual Next.js route + real Supabase backend, but **not Vercel's production edge**.
- Resolve/report unrelated baseline lint/test failures separately.
- Keep PR #42 draft and unmerged. Keep `FEEDBACK_COLLECTION_ENABLED=false`, `NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED=false`, `FEEDBACK_PRODUCTION_RELEASE_APPROVED=false` on Vercel until explicit public launch authorization.

**No new paid database, branch, subscription, or shared credential is required.**
