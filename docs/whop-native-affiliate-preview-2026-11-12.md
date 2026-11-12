# FrameLeads Whop-native affiliate signup — Preview implementation

Date: 2026-11-12. Status: DRAFT / Preview-only. DO NOT MERGE OR ENABLE PRODUCTION.

## Approved commercial policy

- Core: $149/month, commission 30% on FIRST qualifying payment only.
- Enterprise: $499/month, commission 30% on FIRST qualifying payment only.
- Renewals: no affiliate commission. Micro-Pilot excluded.
- Possible future $99/$299 pricing and 25% commission is NOT active or automatic. The backend fails closed when price differs from the current approved amounts.
- Exact current plan IDs from merged Landing checkout policy: Core plan_GQTDPXnvijugf and Enterprise plan_uGDGf5WKW7hlE.
- No changes to current live prices, existing Whop global affiliate settings, subscriptions, or historic affiliate obligations.

## Scope implemented

1. /affiliates — branded name/email registration form with terms consent, honeypot, accessible input states and responsive design.
2. /api/affiliates/apply — same-origin JSON route. On Vercel Preview validates locally and returns a clearly labeled dry-run status; does NOT persist email, send mail or call Whop.
3. Gated future production path — Turnstile siteverify, bounded per-instance throttling, 20-minute AES-256-GCM sealed email confirmation token, and transactional email from a separately configured MailerSend sender.
4. /affiliates/confirm and /api/affiliates/confirm — token in URL fragment (not sent in GET or referrer), explicit confirmation click and POST; only then may a verified email enroll.
5. Whop API integration — create/find affiliate, read existing per-plan overrides, reject any conflict, create missing 30%-first_payment overrides, independently read back reward scope, return only provider-generated HTTPS checkout links. The individual links go ONLY to the email verified in the double opt-in, never in the public response.
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
- Confirm production merchant ID, exact plan ownership and current amounts; verify Whop API accepts email identifiers for real intended users and returns first_payment overrides and direct links.
- Verify transactional mail delivery, Whop API-created invitation behavior, Whop accounts for unregistered emails, and bounce/retry/duplicate handling.
- Approve partner terms, application privacy disclosure, commission/refund policy, and reconcile existing global recurring affiliate settings.
- Controlled attributed buyer purchase: proof of first-payment commission, zero renewal commission, and correct SaaS membership/access. No public activation without approval.
- Keep old affiliate PR #19 (Landing), Brand Brain PR #28, Supabase consent/tracking work, and the blocked Issue #17 persistence changes preserved and inactive. This new route has no dependency on those blocked custom-affiliate systems.

No production checkout changes, migrations, Whop invitations, payments, or feature flag activation are authorized by this draft.
