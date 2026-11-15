# FrameLeads native affiliate signup — launch gate report (15 Nov 2026)

## Verified facts

- Draft PR #43 implements user-approved signup: name/email + consent → Resend email confirmation → encrypted environment-scoped 20-minute token → real Whop merchant affiliate enrollment → exact Core and Enterprise plan read-back → two plan-specific 30% `all_payments` overrides → Resend welcome email with verified referral links. No Whop Sandbox checkout is part of this simplified release.
- Owner-provided 15 Nov screen recording demonstrates the complete protected Preview path and both delivered emails and links in Whop. This is **functional acceptance evidence**, not payment or public-traffic security evidence.
- Plan policy deliberately refuses unapproved repricing: $149 Core and $499 Enterprise at 30% recurring. The hypothetical $99/$299 and 25% plan is not active.
- The complete user-approved 23-screenshot ZIP is committed at `public/resources/frameleads-affiliate-full-product-proof-23.zip`. The affiliate page highlights the four featured images with Inbox Triage as the recommended opening; individual downloads and both four-image and full-library ZIP options are offered. The welcome email includes clickable Core/Enterprise links and the full ZIP download. No Google Drive sharing dependency.
- Affiliate data handling and partner promotion limitations are described in the updated draft Privacy Policy and Terms pages. **Owner should approve these before public publication.**
- Vercel Firewall contains an inactive, production-domain-only rate-limit rule for POST `/api/affiliates/`: 20 requests per 600 seconds per IP, returned as 429 after threshold. It is **not enabled yet**. Default Vercel firewall rules remain otherwise unchanged.
- Server verifies same-origin, payload sizes and email validation; sends no applicant/Whop link in client API response; applies short token expiry, encryption at rest in token (no database), transaction Idempotency-Key for repeat welcome sends, per-instance best-effort throttle, and production-only Turnstile. Live signup endpoints additionally require canonical HTTPS `frameleads.io` hostname (www redirects to apex) and Turnstile **success + matching hostname + `affiliate_signup` action**. A separate fail-closed helper enforces this server-side, with route-level tests.
- Protected Preview remains limited to one approved email, Vercel Authentication and one feature branch. Its credential/env keys must not be reused indiscriminately for Production.

## Remaining required launch gates

1. **Cloudflare Turnstile free widget**: owner creates a widget for `frameleads.io` (the configured `www.frameleads.io` alias redirects to apex), with action `affiliate_signup` emitted by the client. Configure its public site key `NEXT_PUBLIC_AFFILIATE_TURNSTILE_SITE_KEY` and Sensitive `AFFILIATE_TURNSTILE_SECRET` in Vercel Production only. The code fails closed without these. No domain migration is needed.
2. **Production-only credentials (without posting in chat)**: `AFFILIATE_WHOP_API_KEY`, `AFFILIATE_WHOP_COMPANY_ID`, `AFFILIATE_RESEND_API_KEY`, `AFFILIATE_MAIL_FROM`, a distinct 256-bit `AFFILIATE_EMAIL_TOKEN_KEY`, and the *exact* live `AFFILIATE_CORE_PLAN_ID` and `AFFILIATE_ENTERPRISE_PLAN_ID`. `WHOP_ENVIRONMENT=production`. Do not change existing checkout credentials or production billing settings.
3. **Operational abuse protection**: review and enable the prepared WAF rate-limit rule at launch (Hobby plan's quota limits apply; obtain owner's confirmation before any billable upgrade). Turnstile is required even with WAF. Whop/Resend reject conflicting changes, but there is not yet an independent durable token replay ledger. Whop override read-back and Resend email idempotency mitigate repeated confirmations; more stringent durable replay tracking can be added after launch if required by a separate security review.
4. **Owner sign-off** on partner program privacy/terms and legal claims, plus final Production release approval. The PR must pass affiliate tests, whole-site Next security QA, Vercel build and a read-only post-deployment smoke test. Do not set `AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED` without documented review approval.
5. **Controlled activation**: first merge PR #43 without enabling public registration, verify information page and 23 ZIP work. Then separately enable `AFFILIATE_NATIVE_REGISTRATION_ENABLED=true` and `AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED=true` after the above steps, rebuild Production, verify protected normal form now shows Live (no Preview banner), and monitor safe anonymized function error codes.
6. **Track first real referral** through Whop after organic launch. A paid checkout test or Whop Sandbox purchase is not a prerequisite for publishing the native program; payout/renewal behavior remains provider-dependent and must not be represented as already proven by a test sale.

## Hosting plan compliance consideration (not caused by affiliate code)

The currently connected Vercel team was shown as **Hobby** in owner screenshots. Vercel's published terms as of 19 Oct 2026 restrict Hobby to personal/non-commercial use and define commercial usage broadly. The FrameLeads website advertises paid subscriptions, so the owner should review the plan requirement before continuing commercial operation. **No paid upgrade is authorized or performed.** This is separate from the technical readiness of PR #43. Sources: https://vercel.com/legal/terms and https://vercel.com/docs/limits/fair-use-guidelines.

## Explicit non-actions

Do not create or change Whop plans, enable any public endpoint or switch Production flags, merge or deploy Production, share private credentials, modify unrelated Supabase or checkout systems, or incur charges without explicit owner authorization. The pre-existing affiliate Sandbox PRs and Issue #17 independent review loop are out of scope for this native Whop Option A implementation.

## Links

- PR: https://github.com/Frameleads/FrameLeads-Landing/pull/43
- Turnstile widget configuration: https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/
- Production domain: https://frameleads.io

## Latest Preview QA and release configuration (15 Nov)

- The current isolated Preview commit includes the first-party `frameleads.io` hostname check and server-side Turnstile `hostname` + `affiliate_signup` action binding. Both GitHub CI workflows and the Vercel Preview deployment pass. It does **not** enable public traffic.
- Connected Vercel environment-variable listing shows that the Whop API key, company ID, Resend sender/key, Core and Enterprise plan IDs and email-verification encryption key are **Preview-only**. There is no corresponding Production configuration yet. The Whop environment label exists in Production but is insufficient on its own.
- No Production Turnstile site key or secret was configured at this checkpoint. The live registration route fails closed without them.
- The static 23-screen ZIP is stored in the repository (identical to the owner-approved Google Drive source). Its four featured previews now lead with Inbox Triage, Intent & Context and the Decision Packet, leaving outbound sandbox as optional context.
- The Vercel Hobby restriction is a **commercial-hosting licensing issue**, not an implementation defect. No paid plan upgrade or billing action has been performed. An owner decision on compliant commercial hosting and associated costs must precede public launch.
- The prepared firewall rule remains inactive and must be explicitly reviewed before activation. No independent external security approval is represented by the self-authored functional tests.
