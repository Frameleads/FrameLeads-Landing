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
- This release deliberately never copies `?a=` into `data-whop-affiliate`. Incoming raw referrals with undecided consent hold at the privacy-choice gate; a **consented** referral triggers a fail-closed review message instead of an uncredited sale. A buyer who **declines optional tracking** may still use the Sandbox checkout without payable attribution. Referral decisions here are browser display gates only, not durable verified commission evidence.
- Official Whop documentation references: https://docs.whop.com/third-party-integrations/embedded-checkouts/framer-checkout and https://docs.whop.com/third-party-integrations/embedded-checkouts/attribute-affiliates-embedded-checkout. The second guide's arbitrary URL affiliate script is **not** acceptable as a substitute for FrameLeads' validated consent-proof contract.

## Environment gates

`FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED` defaults OFF. Only when set to `true` on an authorized preview, and `WHOP_ENVIRONMENT=sandbox` with the exact existing sandbox Core account/product/plan and an approved `WHOP_SANDBOX_RETURN_URL`, does the real embed render. Enterprise is deliberately blocked because no verified disposable Sandbox Enterprise plan exists.

**Production is hard-blocked in code** whenever `VERCEL_ENV=production`, regardless of flag value. The embed also requires `VERCEL_ENV=preview` exactly; unset/local-development values fail closed. The Whop HTML element explicitly declares `data-whop-checkout-environment="sandbox"` to prevent the JavaScript loader from defaulting to live Whop. A later reviewed change must implement the authorized validated immediate-affiliate checkout contract before any production enablement.

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

## GitHub-only hardening checkpoint — 2026-10-22

- Corrected the embed to explicitly set `data-whop-checkout-environment="sandbox"`, matching the checkout attribute documented for embedded Sandbox usage. This is essential: a Sandbox plan ID alone does not authorize assuming a Sandbox browser payment environment.
- Switched the checkout accent configuration to the documented `data-whop-checkout-theme-accent-color="orange"` and removed unsupported data attributes. The outer page retains the precise FrameLeads orange `#FF5A1F`; internal Whop payment iframe styling stays under Whop's control.
- Preview policy fails closed unless `VERCEL_ENV=preview` **and** the Sandbox flag, verified Sandbox Core IDs and approved non-FrameLeads return URL match.
- Consent-aware referral decisions cover undecided, accepted, rejected and previously observed referrals. Buyers who reject optional tracking are not blocked solely by a raw URL parameter; buyers with accepted but unverified referrals cannot silently become direct affiliate-uncredited payments.
- Added an isolated Chromium suite `tests/browser/checkout-preview.test.mjs`: verifies real DOM routes for Sandbox Core / blocked Enterprise, referral consent states, correct Sandbox embed attributes, no raw affiliate passthrough, and absence of JavaScript exceptions. **External Whop/pixel calls are always stubbed**, and no payment can occur from this browser suite.
- GitHub Actions `embedded-checkout-ci.yml` now runs typecheck, Node regression tests, production build, then the isolated Chromium checks. Do not report these tests passing until the corresponding workflow concludes successfully.
- Whop guidance consulted: https://webflow.com/integrations/whop (embedded environment and accent attributes), https://whop.com/blog/whop-sandbox/ (Sandbox isolation, distinct plan IDs and browser `environment`), https://whop.com/blog/add-checkout-to-nextjs-app/ (Next.js and signed payment verification).
- Connected Vercel plugin can discover project metadata, but the `frameleads` team scope still returns 403; no Vercel modifications are attempted. GitHub-only CI can continue independently.
- The current `CHECKOUT_INITIATED` browser observation is emitted on first allowed checkout embed presentation, not as a payment-authorized or purchase event. Final measurement naming and attribution must be validated before sending paid traffic.
- **Still blocked:** real Whop Sandbox payment, Enterprise Sandbox provision, durable consent-proof backend, provider-confirmed affiliate commission, signed webhook processing against Sandbox, actual SaaS entitlement, and Safari/Apple Pay verification.

## V2 checkout design handoff integration — 2026-10-22

- The standalone workspace report described a dark-summary/white-payment UI, current reference prices, and a Whop iframe that requires an externally configured embed URL. That implementation was **not present in this repository** and no local patch was provided, so no unreviewed iframe or local source was imported.
- Instead, the approved V2 visual layout was implemented directly into PR #7: `src/components/CheckoutOrderSummary.tsx` owns presentation; `src/app/checkout/[plan]/page.tsx` provides responsive 46/54 dark-summary/white-payment split and merchant/legal identity; `src/components/EmbeddedWhopCheckout.tsx` keeps Whop's native loader and uses its light theme.
- The native loader is deliberate. Whop's Framer documentation recommends SDK injection on the parent page instead of wrapping the entire checkout in a sandboxed iframe, which can interfere with Apple Pay: https://docs.whop.com/third-party-integrations/embedded-checkouts/framer-checkout .
- Left side includes plan description, production reference monthly price, order details, total due today **without an unverified amount**, collapsible mobile features, and support. Whop still owns actual Sandbox/production charge, promo entry, buyer details, payment validation and purchase processing. Prices ($147/$697) are **reference labels, not a decision to override or change Whop**.
- No fake promo field, custom payment inputs, client-side purchase confirmation, direct affiliate URL-to-provider passthrough, new pixel, new whop product or production deployment.
- Added Chromium UI assertions for actual color split, payment light theme, legal links, plan details and mobile overflow; external Whop/pixel network requests are stubbed. A passing fake-script browser test does **not** establish Whop runtime form rendering.
- The V2 work was made as changes on PR #7's isolated branch, not to main. Its upstream Landing PR #5 and Brand Brain PR #12 remain separate. Production remains hard-blocked under the original policy.
- Previous standalone-workspace `npx tsc --noEmit` and `git diff --check` evidence does not validate PR #7. Confirm the new PR #7 CI run separately before marking V2 verified.

## V3 FINAL checkout visual checkpoint — 2026-10-22 (supersedes V2 visual layout)

- **Authoritative visual spec:** Edge-to-edge 50/50 desktop split with #242424 left, #FFFFFF right, zero outer black frame/card/navbar. Tablet remains stacked where needed to protect a usable payment-field width; mobile is one column (compact charcoal confirmation, followed immediately by white native Whop payment).
- **Only routine left-column content:** small FrameLeads identity and true merchant ("by BrandFlow Studio"), tier name, single-sentence summary, current published reference price per month, and one "Billed monthly" line. On an authorized Sandbox Core preview, add a short factual warning that the displayed published price is a reference rather than the Sandbox test charge. No other claims about payable totals.
- **Removed:** benefits, redundant feature pitch, plan cards, order-summary price duplication, hypothetical total due today, promo explainer, accordion, extra support paragraphs, full-width dark navbar, black outer gutter, trust badges, and duplicate checkout commentary.
- **Payment side:** plain white, single heading, existing native Whop loader in supported light mode, native wallet/card/promo handling only, required legal/provider footer in muted type. Whop remains the sole payment processor and final-amount authority. Avoid importing alternate workspace's unverified iframe URL implementation.
- **Test coverage:** browser suite now checks V3 background colors, absent benefits/accordion/duplicated pricing, merchant text, legal link, native Sandbox attributes, responsive horizontal overflow at widths 390/768/1024/1440, and Core/Enterprise screenshots with all third-party requests intercepted. No real Whop form, payment, or Apple Pay support can be inferred from synthetic screenshots.
- **Still required:** Final active plan price/Whop reconciliation, authorized real Whop Sandbox Core and Enterprise payment tests, commission and consent-proof review, signed-webhook reconciliation, subscription access and returning-user verification, plus owner authorization for production release.
- **Safety unchanged:** No modification to main checkout CTAs or existing hosted links, no new products, production flags, database migrations, pixel configuration, outbound data, or live payments. PR #7 remains a draft based on Landing PR #5; the blocked Brand Brain migration stays blocked.
- The separate-workspace report is not verification of this branch. Use the GitHub Actions run triggered by the V3 commit for validation; do not report green until confirmed.

## Stage-gate decision — owner UI sign-off on 2026-10-22

**UI/UX stage CLOSED — V3 visually accepted for now.** The owner reviewed the combined Core/Enterprise desktop/mobile previews and confirmed the V3 layout "looks good for now," explicitly reserving simple visual adjustments for a later pass. This sign-off is for **the minimal page shell only**, not Whop's actual payment fields (intentionally blocked in synthetic screenshots), payments, pricing, merchant terms, affiliate commission, deployment, or production launch. Do not reopen UI design work without a new specific request or a functional/accessibility issue uncovered in genuine Sandbox tests.

**Baseline:** PR #7 at `1d72f8268764d226f1ee662722f001016587135f`, GitHub Actions `39812830764`: 62/62 Node tests, 6/6 isolated Chromium scenarios, TypeScript and production build passed; test/browser externals were stubbed. Subsequent documentation-only commits do not constitute new runtime verification.

**Next phase: Whop Sandbox E2E / release-readiness validation (OPEN).** Follow the gates below in order:
1. Read-only inventory of the exact FrameLeads Vercel preview deployment, team scope, permitted Sandbox Core account/product/plan and nonproduction return URL; **do not reauthorize through unsafe bypasses**. A successful GitHub preview build is not proof the runtime environment has the required Sandbox variables.
2. Verify real Whop loader visibility and payment methods (desktop/mobile and Safari where available) **only** on a controlled HTTPS Sandbox preview with `data-whop-checkout-environment="sandbox"`. Ensure the generated checkout targets the expected Sandbox account/plan, not any live plan.
3. Perform a genuine **Sandbox Core test purchase** using sanctioned test payment means, then validate Whop-signed webhook intake, signature verification, idempotent processing, order/subscription reconciliation, plan-specific entitlement issuance, `app.frameleads.io` redirect and returning-customer login. A `/checkout/complete` page alone never proves success.
4. Establish a separate verified **Sandbox Enterprise** product/plan before enabling or purchasing that tier. Do not repurpose production Enterprise IDs.
5. Complete the existing affiliate privacy/consent-proof, immediate-affiliate and delayed Audit continuation contracts (Landing PR #5 / Brand Brain PR #12). Test accepted, declined and withdrawn consent; verify real provider-confirmed commission evidence without trusting raw query strings or client-provided events.
6. Confirm Apple Pay domain registration, payment fallbacks, real UI/accessibility errors, cancellation/refunds, and price/currency/renewal disclosures. Any layout adjustments discovered are narrowly scoped functional fixes, not a V4 redesign.
7. Only after all gates pass and separately explicit owner release approval: resolve dependent PRs, coordinate backend before landing deployment, switch live CTAs with rollback available, and run production consent-safe smoke tests.

**No authorization was given to merge PR #7, deploy production, modify Vercel/Whop/Supabase, change prices, apply the refused migration `20261004202441_website_audit_ingestion.sql`, or enable affiliate tracking.**
