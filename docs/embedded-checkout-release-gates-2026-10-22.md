# FrameLeads embedded Whop checkout — isolated implementation / release gates

**Status: nonproduction implementation only. NOT LIVE.** This branch is stacked on Landing PR #5 head `bb264e07cdc24eb167c70a999ed4f2b1ddbabe0a`. It must not merge independently to `main` until its base and the affiliated Brand Brain contracts are resolved.

## Confirmed dependencies and architecture

- Existing public marketing site `frameleads.io`, in `Frameleads/FrameLeads-Landing`.
- New route shell `/checkout/core` and `/checkout/enterprise`; responsive FrameLeads presentation and the **native Whop embed** loader (`https://js.whop.com/static/checkout/loader.js`) rather than fabricated payment inputs or a sandboxed wrapper iframe.
- Production plan IDs remain Core `plan_sAEhr77rTrhX4` and Enterprise `plan_jdy5Z44fMKMAz`; published pricing copy remains $147/$697 pending separate verified pricing approval. Whop, not HTML, determines what is actually charged.
- Existing hosted Whop checkout URLs remain unchanged in **all current landing CTAs** as rollback/fallback. Do not redirect paid traffic to these new pages yet.
- Existing PrivacyChoices from Landing PR #5 loads `https://t.whop.tw/s.js` only with advertising consent. Do not install an additional Whop pixel, overwrite consent handling, or emit a synthetic Purchase event.
- Existing Meta/TikTok and first-party measurement policy is reused. This checkout records consent-gated `CHECKOUT_INITIATED` only; verified purchase and entitlement must continue from Whop signed webhooks and reconciliation in Brand Brain. `/checkout/complete` is informational and not purchase evidence.
- Existing secure email-verified Audit continuation (Landing PR #5, Brand Brain PR #12) is deliberately not replaced. PR #12 creates checkout configurations containing validated affiliate code and purchase metadata; the native standalone Whop plan embed cannot be assumed to preserve those records.
- This release deliberately never copies `?a=` into `data-whop-affiliate`. URL referrals are refused server-side and consenting recorded referrals trigger a fail-closed client notice, not a direct/uncredited payment.
- Official Whop documentation references: https://docs.whop.com/third-party-integrations/embedded-checkouts/framer-checkout and https://docs.whop.com/third-party-integrations/embedded-checkouts/attribute-affiliates-embedded-checkout. The second guide's arbitrary URL affiliate script is **not** acceptable as a substitute for FrameLeads' validated consent-proof contract.

## Environment gates

`FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED` defaults OFF. Only when set to `true` on an authorized preview, and `WHOP_ENVIRONMENT=sandbox` with the exact existing sandbox Core account/product/plan and an approved `WHOP_SANDBOX_RETURN_URL`, does the real embed render. Enterprise is deliberately blocked because no verified disposable Sandbox Enterprise plan exists.

**Production is hard-blocked in code** whenever `VERCEL_ENV=production`, regardless of flag value. A later reviewed change must implement the authorized validated immediate-affiliate checkout contract before any production enablement.

Never apply refused migration `20261004202441_website_audit_ingestion.sql` via SQL Editor, CLI, another connector, renamed SQL, or another path. Do not modify Vercel deployment/team settings, Supabase data, or production Whop in this PR.

## Required release work (not complete)

1. Independently review the privacy basis, retention, disclosures, withdrawal semantics and durable consent-proof verifier. Affiliate checkout/privacy flags all remain OFF.
2. Implement **server-validated immediate affiliate checkout** using the approved consent proof and eligibility contract. Verify that affiliate compensation works for purchases made immediately from the video landing page, and separately for delayed verified Audit/nurture continuation. No raw `?a=` passthrough.
3. Resolve the Sandbox migration safety refusal by authorized review only (no workaround). Configure and independently verify Whop Sandbox Enterprise plan with a matching isolated account/product.
4. Test payment methods on approved devices, domain verification for embedded Apple Pay, checkout loader/iframe, responsive UI, decline/cancel/fallback behavior, attribution and Whop provider-confirmed commission events.
5. Run local typecheck, build, regression and browser smoke tests, then **real** Sandbox end-to-end tests including signed webhook, idempotency, reconciliation, plan-specific SaaS entitlement and returning user login.
6. Compare/resolve PR #5 / PR #12 conflicts; only after signed owner approval and authorized Vercel access, remove production release block in a separate reviewed PR and switch pricing CTAs to same-domain routes.
7. Finalize accurate displayed prices in the landing page, Whop plans, checkout, and product description together; no silent pricing/billing changes.

## Verification checkpoint — 2026-10-22

- Read-only GitHub and Vercel status inspection confirms Vercel preview deployment checks completed successfully for the draft branch; this is not proof of checkout rendering or a successful payment.
- GitHub Actions job `39788077480` passed: `npx tsc --noEmit`, all **60/60** existing and new Node tests (`npm test`), and `npm run build` on Next.js 16.2.10, including the dynamic `/checkout/[plan]` route.
- Structural policy tests live in `tests/embedded-checkout-policy.test.ts`. Workflow: `.github/workflows/embedded-checkout-ci.yml`.
- The CI result is **not** a real browser, Whop Sandbox payment, commission, signed webhook, reconciliation, or SaaS access verification.
- Vercel account connector lists no authorized teams, so deployment environment inspection and enabling the Sandbox preview are blocked.
- Sandbox Enterprise: **blocked**. Production: **intentionally not deployed**.
