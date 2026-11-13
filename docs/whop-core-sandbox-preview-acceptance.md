# Temporary protected Core Sandbox preview — acceptance record

**Date:** November 13, 2026  
**Purpose:** Validate Whop Core Sandbox checkout rendering/handoff and VSL behavior while security PR #45 stays unchanged. **NEVER MERGE THIS TEST BRANCH INTO MAIN OR PR #45.**

## Strict scope

- Source: security PR #45 exact base commit `aa4bb9fff8e6b02e091e33f825773ea8a1284435`.
- Git branch: `test/whop-core-sandbox-pr45-20261113`.
- Only Vercel **Preview** environment variables scoped to this exact branch; 8 keys written/metadata verified.
- Provider: Whop **sandbox.whop.com**, merchant `biz_6YudF3G7nc8Wdw`, specifically approved Core Sandbox plan `plan_kgrX8LpuAH2Ba`.
- On provider read-only check November 13, this Core Sandbox plan displayed **$5.00/month**. Different legacy Core Sandbox plan from an old branch showed **$149.00/month** and was rejected.
- **Core only** is available in this test. Micro-Pilot and Enterprise Sandbox remain unavailable. The live Core $149 offer is never substituted in Preview.
- Preview-only return page `/login?source=whop-checkout` displays an informational notice and intentionally **does not grant entitlement** or claim payment success.
- No public aliases, no new paid resources, no payment submission, no Supabase changes, no production env changes.
- Deployment protection remains enabled; do NOT disable it for automated browser tests. Use Vercel's limited preview access if needed.

## Configuration

Branch-only variables:
`WHOP_ENVIRONMENT=sandbox`
`WHOP_SANDBOX_COMPANY_ID`
`WHOP_CORE_SANDBOX_PLAN_ID`
`WHOP_CORE_SANDBOX_CHECKOUT_URL`
`FRAMELEADS_WHOP_SANDBOX_RETURN_URL`
`FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED=true`
`FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED=true`
`FRAMELEADS_WHOP_SANDBOX_CORE_ONLY_TEST_ENABLED=true`

All have only `target=["preview"]` and `gitBranch="test/whop-core-sandbox-pr45-20261113"`. No secrets in source.

## Acceptance requirements (not all automatically verifiable)

1. GitHub tests and checks pass: exact Core-only URL/plan mapping, no live fallback, other plans disabled, no-entitlement return, full unit/lint/build/security audit.
2. Protected preview `/checkout/core` clearly says **Sandbox Test** and **$5/month**; Whop-hosted checkout is sandbox only and payment fields remain provider-owned. Inspect without entering payment details.
3. `/checkout/micro-pilot` and `/checkout/enterprise` are unavailable; no production links.
4. Consent/referral query `?a=sample` waits until choices are recorded, then uses Whop hosted Sandbox checkout; it must never forward the raw referral code or turn on production.
5. Mobile video first tap must be observed on a **real physical iPhone or Android**. Browser UA emulation is not sufficient for native playback proof. No automation should claim a physical-device PASS without evidence.
6. Real Sandbox **payment completion**, webhook, order creation, and SaaS access are out of this task's scope and remain unverified.
7. After QA, delete this temporary test branch/env variables only with a separate approved cleanup instruction. Do not merge this test-only code.

## Release note

This branch is a test harness. Security PR #45 remains a distinct release candidate and must not be merged based solely on an isolated checkout branch test. Track observed limitations on the actual PR review.
