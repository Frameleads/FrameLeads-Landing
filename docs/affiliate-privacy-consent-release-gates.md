# FrameLeads affiliate consent and commission attribution — release-gate packet

**Date:** 28 October 2026  
**State:** PROPOSED; review-only. This file does not authorize database migrations, data collection, policy publication, live traffic, or affiliate payments.

## Confirmed business choices versus pending approvals

**Owner-approved in principle:** FrameLeads under the BrandFlow Studio display name, operated by Akram Walid in the UAE; the operator may be identified by name in the public Privacy Policy. The user also approved *draft* disclosure that eligible compensated partner referrals may be linked to an Audit and subsequent purchases. Users must be able to complete the Audit and buy without optional affiliate measurement. The owner emphasizes fairness to partners if buyers purchase several days later.

**Not approved:** A published controller identity/legal-basis assessment, whether advertising and affiliate measurement may use one checkbox or require separate consent, recipient list/Whop-visible buyer data, cross-border transfer and processor obligations, retention/deletion periods, the precise partner commission rate or eligible payments, an attribution window (30 days is a *proposal*), and any migration or deployment.

## Full purpose-specific flow

| Stage | Required behavior | Disallowed |
|---|---|---|
| Incoming Whop external partner link `?a=CODE` | Treat as undecided *client-side* hint pending a lawful choice; do not persist/send until permitted | Raw code is not a verified Whop commission or a server consent receipt |
| Preference selection | Disclose compensated partner commission and processing purposes/recipients; distinguish essential checkout from optional ads/referral analytics; store a versioned affirmative server receipt only if approved | Browser `advertising=true`, old advertising acceptance, passive page view, or dark-pattern bundled consent do not alone authorize paid attribution |
| Receipt issuance | Store receipt UUID, notice/version/digest, specific purpose, server decision time, subject-bound pseudonymous handle, lifecycle status and withdrawal time, with policy-justified fields only | Additional fingerprint, residential address, identity-verification documents, or Audit answers in a consent receipt |
| Referral observation | Associate one validated partner code digest with receipt and observed link, plus immutable observation ID; reject conflicting codes | Reconstruct a declined/withdrawn referral from email matching, Whop cookies, ad identifiers or hidden sessions |
| Immediate Buy Now | Subject-bound, authorized one-time purchase intent must be validated server-side; Whop merchant must validate exact eligible partner+plan and issue a provider `ch_...` checkout configuration; use current Core/Enterprise plans | Trust direct query code or force Audit completion just to pay |
| Audit-to-checkout | Use validated email-verified continuation and one eligible consent-bound observation; after withdrawal deny future affiliate association while preserving normal checkout | Treat nurture message or Audit capture as proof of payable commission |
| Whop payment | Process a real Whop-confirmed transaction with signed webhook, idempotent event insert and existing SaaS membership gate. Link back to eligible attempt only if all provider identifiers match | Emit a second browser Purchase, grant access from success URL, double-credit a transaction |
| Refund/cancel/dispute | Reconcile provider events; follow published partner terms, privacy restrictions and controlled adjustments | Quietly keep or claw back an earned partner commission against published terms |

## Needed server contract (not yet installed)

- **Consent receipt:** `receipt_id` UUID, pseudonymous session/prospect handle, `purpose`, `notice_version`, `notice_digest`, `decision_at`, optional `withdrawn_at`; no extra raw Audit answers/IP/UA.
- **Referral observation:** `observation_id`, `receipt_id`, partner-code digest and limited provider validation evidence, `observed_at`, `invalidated_at`, attribution-conflict status.
- **Checkout claim:** the server-derived receipt/observation + offer, verified Whop company/product/plan, attempt UUID and checkout-configuration ID. A `begin_verified_affiliate_checkout_attempt` transaction must lock the receipt and observation, confirm affirmative notice/purpose, no withdrawal or expiry, one eligible code, exact buyer/plan, and *atomically* claim the attempt before issuing a provider configuration.
- **Withdrawal:** record withdrawal in the same trusted store; lock/recheck against pending checkout claims. A later withdraw must prevent all *new* attribution; do not rewrite a previously completed, contractually earned payment without explicit retention/contract analysis.
- **Least privilege:** deny API grants to `anon` and `authenticated` for private evidence and checkout claim; enable RLS for any exposed-schema tables; use dedicated secure RPC, explicit grants and fixed search_path. Do not add permissive `SECURITY DEFINER` functions in an exposed schema.
- **Replay and concurrency:** test double-submit, simultaneous withdrawal and issue, expired notice, duplicate code, reversed provider events, lost redirect, and contradictory provider commission receipts.

## Data retention proposals — require applicable legal approval and a real deletion implementation

- Unpurchased eligible referral observation: **90 days candidate**, not agreed.
- Unused temporary challenge/issued token: **7 days candidate** for purge; cryptographic validity should be much shorter (existing checkout link verification uses 20 minutes, capability 30 minutes).
- Abandoned checkout attempt: **30 days candidate** for purge/review, subject to disputes and reconciliation.
- Actual paid commissions, customer relationship evidence and financial audit records: legal/accounting retention must be determined separately; never advertise a made-up 30-day deletion guarantee.
- Withdrawal should suppress future optional collection immediately and require a purpose-scoped deletion/retention workflow; retention expiration is **not proof of deletion**.

## Provider and partner fairness

Whop's external HTML embedded checkout documentation describes `data-whop-affiliate` using `?a=`, but that is **not** proof the FrameLeads React Elements Checkout or hosted fallback automatically credits purchases without a validated provider association. A proper Whop Sandbox commission record for both immediate and delayed flows must be inspected before partner promises.

Propose a transparent partner agreement specifying the eligible partner, first-vs-recurring payment scope, 30-day *candidate* window, competing referrals, refund/chargeback treatment, fraud exclusions, change notice, and a documented process to challenge missing commission. If buyer refused consent and no valid evidence exists, do not secretly restore attribution; investigate only evidence the buyer/partner can lawfully and voluntarily provide. No automatic claim is made that Whop permits retroactive reassignment.

## Approval checklist (all required before enabling affiliate traffic)

- [ ] Independent privacy/legal review of exact controller disclosure and optional consent purposes/granularity
- [ ] Notice version, purpose ID, digest and policy retention/deletion schedule approved
- [ ] Whop-specific visibility of customer information to partners and international transfers verified
- [ ] Prior refused hosted Migration 16 reviewed/authorized through original safety process; no alternative execution route
- [ ] Additive database and atomic claim contract reviewed, granted safely and verified against disposable database **and authorized Sandbox**
- [ ] Browser opt-out/withdrawal, race, replay, conflicted referral and no-cookie purchase tests pass
- [ ] Provider-eligible affiliate checkout configuration works for current Core/Enterprise Whop plans; attributed hosted fallback independently validated
- [ ] Whop Sandbox confirms affiliate ID, commission, payment status, signed webhook, idempotent reconciliation and SaaS entitlement/login
- [ ] Separate review of any grandfathered Enterprise allowances and monthly renewal changes (SaaS PR #18 remains draft)
- [ ] Final partner terms, enrollment and commission scope/window approved, then explicit production release authorization

**Current state:** Landing [PR #19](https://github.com/Frameleads/FrameLeads-Landing/pull/19) and Brand Brain [PR #28](https://github.com/Frameleads/Brand-Brain/pull/28) are staged and default-disabled. None of the unchecked tasks may be marked complete merely because static TypeScript or mocked provider tests pass.

## Additional protection staged — versioned affiliate notice (28 October 2026)

The current draft Landing branch now **requires a fresh explicit choice for the exact new compensated-referral notice**. The legacy `frameleads:privacy-consent:v1` preference continues to govern existing advertising/analytics, but cannot authorize affiliate attribution on its own.

- Public release needs **both** `NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` **and** a valid explicitly approved `NEXT_PUBLIC_AFFILIATE_CONSENT_NOTICE_VERSION` (identifier, not a secret). A missing/invalid version fails closed for affiliate capture.
- The browser saves `affiliateNoticeAcceptedVersion` only after a user explicitly saves/accepts the disclosed new optional purpose. An older acceptance, a different version, or a declined notice never qualifies a partner code. The UI presents a new choice for old *affirmative advertising* preferences; users may **retain their previous advertising choice while declining the partner referral purpose**.
- Version rotation invalidates stored affiliate attribution without revoking the user's existing unrelated analytics/advertising choices. The URL referral is not silently sent while the user decides. Explicit withdrawal still clears the stored code and scrubs its URL.
- A purpose-specific `decline` under the new affiliate notice explicitly **scrubs the URL and stored code**, including when the visitor keeps prior advertising measurement enabled. The same rejection in another browser tab also clears local referral evidence, without clearing UTM campaign fields. A later click on a *fresh* affiliate link is required to reconsider a previously refused code.
- Browser localStorage is not authenticated. Version markers are UX/collection controls **only** and are **not** a durable, server-issued consent receipt. The Audit server still strips affiliate codes, and the payable checkout RPC stays absent until independent policy/database authorization.
- Regression tests cover historical advertising acceptance, fresh acceptance, declining referral while retaining advertising, notice-version rotation, URL code leakage and withdrawal, plus existing checkout tests. These pass in GitHub Actions.
