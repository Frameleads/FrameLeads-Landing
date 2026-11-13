# FrameLeads Whop-native affiliate signup — Preview implementation

Date: 2026-11-12. Status: DRAFT / Preview-only. DO NOT MERGE OR ENABLE PRODUCTION.

## Approved commercial policy

- Core: $149/month, commission 30% on ALL qualifying initial and recurring subscription payments.
- Enterprise: $499/month, commission 30% on ALL qualifying initial and recurring subscription payments.
- Renewals: 30% affiliate commission on eligible payments. Micro-Pilot excluded.
- Possible future $99/$299 pricing and 25% commission is NOT active or automatic. The backend fails closed when price differs from the current approved amounts.
- Exact current plan IDs from merged Landing checkout policy: Core plan_GQTDPXnvijugf and Enterprise plan_uGDGf5WKW7hlE.
- No changes to current live prices, existing Whop global affiliate settings, subscriptions, or historic affiliate obligations.

## Scope implemented

1. /affiliates — branded name/email registration form with terms consent, honeypot, accessible input states and responsive design.
2. /api/affiliates/apply — same-origin JSON route. On Vercel Preview validates locally and returns a clearly labeled dry-run status; does NOT persist email, send mail or call Whop.
3. Gated future production path — Turnstile siteverify, bounded per-instance throttling, 20-minute AES-256-GCM sealed email confirmation token, and transactional email from a separately configured MailerSend sender.
4. /affiliates/confirm and /api/affiliates/confirm — token in URL fragment (not sent in GET or referrer), explicit confirmation click and POST; only then may a verified email enroll.
5. Whop API integration — create/find affiliate, read existing per-plan overrides, reject any conflict, create missing 30%-all_payments overrides, independently read back reward scope, return only provider-generated HTTPS checkout links. The individual links go ONLY to the email verified in the double opt-in, never in the public response.
6. Automated unit/contract tests cover policy, gating, token expiry, Whop override idempotency and failures.

Whop API references:
https://docs.whop.com/api-reference/affiliates/create-affiliate
https://docs.whop.com/api-reference/affiliates/list-overrides
https://docs.whop.com/api-reference/affiliates/create-override

Whop's native manual invitation has shown an email in an earlier user test. Whether affiliate creation through the API sends the same email is UNVERIFIED. MailerSend is a separately gated fallback, NOT provisioned or paid for by this change.

## Future production configuration (all absent until separately approved)

- Platform: VERCEL_ENV=production
- Two activation gates: AFFILIATE_NATIVE_REGISTRATION_ENABLED=true and AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED=true
- WHOP_ENVIRONMENT=production
- AFFILIATE_WHOP_COMPANY_ID = verified real BrandFlow Studio merchant; NOT Sandbox biz_6YudF3G7nc8Wdw
- AFFILIATE_CORE_PLAN_ID=plan_GQTDPXnvijugf
- AFFILIATE_ENTERPRISE_PLAN_ID=plan_uGDGf5WKW7hlE
- Secret-only: AFFILIATE_WHOP_API_KEY (scoped live account, affiliate and plan permissions)
- Secret-only: AFFILIATE_EMAIL_TOKEN_KEY (independent 64-character hexadecimal secret)
- Secret-only: AFFILIATE_MAILERSEND_API_KEY and AFFILIATE_MAIL_FROM (verified transactional sender)
- Secret-only: AFFILIATE_TURNSTILE_SECRET
- Public site key: NEXT_PUBLIC_AFFILIATE_TURNSTILE_SITE_KEY

Never paste secrets into chat or GitHub. Do not configure or activate live values based solely on Preview CI.

## Required gates before real invitations

- Preview desktop/mobile UI QA; GitHub Actions build, types and tests; Vercel Preview protection and branch isolation.
- Independent security review: confirm serverless replay, origin checks, provider identity, idempotency and distributed throttling. Current in-memory per-instance rate limiter is NOT a reliable public abuse barrier, and 20-minute confirmation tokens can be replayed; require reviewed durable protection before public launch.
- Confirm production merchant ID, exact plan ownership and current amounts; verify Whop API accepts email identifiers for real intended users and returns all_payments overrides and direct links.
- Verify transactional mail delivery, Whop API-created invitation behavior, Whop accounts for unregistered emails, and bounce/retry/duplicate handling.
- Approve partner terms, application privacy disclosure, commission/refund policy, and reconcile existing global recurring affiliate settings.
- Controlled attributed buyer purchase: proof of eligible initial and renewal commissions, and correct SaaS membership/access. No public activation without approval.
- Keep old affiliate PR #19 (Landing), Brand Brain PR #28, Supabase consent/tracking work, and the blocked Issue #17 persistence changes preserved and inactive. This new route has no dependency on those blocked custom-affiliate systems.

No production checkout changes, migrations, Whop invitations, payments, or feature flag activation are authorized by this draft.


## 2026-11-12 — Real merchant connection check (isolated Preview)

The production merchant cannot be authenticated from the connected Vercel tools because
its stored Whop key and company ID are **write-only**. The existing real merchant's
Whop credential remains in Brand Brain production, not Landing. Its value was never
copied, revealed, printed, or shared with this PR. A short-lived test sandbox was
closed without sending requests to Whop.

A dedicated **read-only**, branch-scoped endpoint was added:
- Operator page: \`/affiliates/readiness\`
- API: \`POST /api/affiliates/readiness\`
- Hard guards: \`VERCEL_ENV=preview\`, branch \`feat/whop-native-affiliate-preview-20261112\`,
  and \`AFFILIATE_NATIVE_PROVIDER_READONLY_PROBE_ENABLED=true\`.
- Vercel Preview has SSO protection enabled; keep it enabled.
- Checks: credential validity, actual live company ownership, exact Core/Enterprise
  plan IDs and USD prices, \`affiliate:basic:read\` permissions.
- No POST to Whop, no write permissions needed, no personal or affiliate records
  returned, no emails, and no service credentials included in response.
- This test cannot establish \`affiliate:create\` permission, provider-generated
  link correctness, invitation delivery, or attributed purchases.

**Vercel branch-scoped, non-secret variables already set** in \`frameleads-landing\`:
- \`WHOP_ENVIRONMENT=production\`
- \`AFFILIATE_CORE_PLAN_ID=plan_GQTDPXnvijugf\`
- \`AFFILIATE_ENTERPRISE_PLAN_ID=plan_uGDGf5WKW7hlE\`
- \`AFFILIATE_NATIVE_PROVIDER_READONLY_PROBE_ENABLED=true\`

**The only two values to supply via Vercel's secure Environment Variables UI**,
targeting *Preview → this specific branch only*, are:
- \`AFFILIATE_WHOP_COMPANY_ID\`: your **real BrandFlow Studio Whop merchant** \`biz_...\`,
  never the Sandbox business
- \`AFFILIATE_WHOP_API_KEY\`: an API key belonging to the real merchant,
  preferably dedicated to this check, with \`plan:basic:read\` and
  \`affiliate:basic:read\` scopes. Use **Sensitive** type. Never paste it in chat.
After saving both, redeploy the latest PR branch Preview (not Production), then
open its protected \`/affiliates/readiness\` page and click
**Run read-only Whop check**. It must report \`merchantVerified=true\` and
each plan and affiliate-read check must pass.

**Safety:** Do not set \`AFFILIATE_NATIVE_REGISTRATION_ENABLED=true\` or
\`AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED=true\` in production. Even after the
read-only check passes, live invitations are blocked pending approved anti-abuse
and replay controls, test email verification, Whop create-affiliate permissions,
customer-specific links, and actual welcome-email delivery. The old blocked
persistence work is not part of this checker.

## 2026-11-13 — ROOT CAUSE CONFIRMED AND CORRECTED

Whop changed its Plans API on 2026-06-09, replacing company_id with account_id in request parameters and plan.company with plan.account in responses. New API keys default to newer dated schemas; earlier FrameLeads code omitted the version header and therefore incorrectly interpreted the provider response.

FIX: src/affiliate-native.ts exports WHOP_API_VERSION = 2025-01-01 and all native Whop enrollment and read-only readiness requests now send Api-Version-Date with that value. Whop explicitly documents the original version and overriding an API key's default pin: https://docs.whop.com/developer/api/versioning.

**Provider-backed evidence (NOT mocks):** A one-time protected Preview build-time check with the user's existing branch-specific credentials returned sanitized values: contract 2025-01-01; connected true; merchantVerified true; core VERIFIED; enterprise VERIFIED; affiliate_read VERIFIED; catalog MATCH_FOUND; writes 0.

The two configured plans therefore passed ID, company ownership, USD monthly renewal price, renewal billing, zero extra upfront fee, visibility and buy-now requirements. The previous COMPANY_MISMATCH and NOT_RECURRING outputs were API-version contract artifacts. No Whop merchant products or settings were altered.

The optional company-list endpoint returned 400 even though specific plan ownership and merchant-scoped affiliate read were already verified. The checker now skips that unnecessary request once merchant ownership checks pass.

The temporary credentialed build-time probe and its prebuild hook were removed immediately after successful verification, to avoid persistent use of production API credentials during Preview builds. No credentials were committed or logged. The protected /affiliates/readiness endpoint remains available.

**Still NOT verified:** actual affiliate creation, 30% all_payments override writes/read-back, invitation email, affiliate clicks and purchases, renewal payout, delivery retries, replay/abuse protections, and production security approval. PR remains draft, Production gates remain OFF. Do not claim automatic email delivery is verified until tested.

Docs: https://docs.whop.com/developer/api/versioning
