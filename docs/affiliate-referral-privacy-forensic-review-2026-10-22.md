# FrameLeads affiliate-referral privacy review — 22 October 2026

**STATUS: REVIEW COMPLETE AS TO INSPECTED SOURCE; POLICY SIGNOFF AND LAUNCH NOT APPROVED. DO NOT PUBLISH THIS DOCUMENT OR ENABLE FLAGS.**

**Scope:** Landing PR #5 at `7092618cc5346d6f177e0a53cbf5e27a473adfd5`, Brand Brain PR #12 at `2aa398e1e2cef92a7006b00cf63b0dfdc05d0219`; the existing published Landing Privacy Policy on `main`; official Whop Privacy Policy; guidance of UK ICO and EDPB. These are source-based findings, not legal advice or jurisdictional determination. All app-driven commerce remains unverified in the hosted sandbox.

## 1. Fixed business decision and scope

The owner approved **requiring advertising consent as a prerequisite for initial Audit-based affiliate attribution**, subject to lawful purpose, disclosure, consent, permits and review. This does **not** approve publishing copy, enabling any flag, processing non-consenting users, or activating Whop commissions. Keep the free Audit diagnosis and normal purchasing available without advertising consent. A stored code is only an **unverified referral observation**. Whop is authoritative for any commission.

## 2. Findings (source-backed)

| ID | Severity for approval | Observation | Concrete source | Disposition |
|---|---|---|---|---|
| P1 | BLOCKER | Current public privacy policy covers optional advertising measurement/referrals generically, but not the specific compensation-bearing Audit-to-later-purchase linkage or Whop partner visibility. | Landing `main:src/app/privacy/page.tsx`; existing `docs/affiliate-referral-privacy-approval-draft.md` | Final text + short in-Audit notice must be reviewed and published before enabling feature. |
| P2 | BLOCKER | No demonstrated **durable server-side consent receipt** for affiliate capture: `PrivacyConsent` records preference and `savedAt` in localStorage; public Audit request sends only `advertisingConsent: boolean`, and the validated payload forwarded to Brand Brain omits that field. The stored referral observation records code/time/provenance, not the exact visitor-facing consent notice/version/choice. This is an evidentiary gap, not proof of an unauthorized historical capture. | `src/privacy-consent.ts`; `src/components/PipelineAudit.tsx`; `src/app/api/audit-lead/route.ts`; `app/api/marketing/audit-lead/ingest/route.ts`; `20261019120000_audit_affiliate_observations.sql` | Define minimal server-side consent receipt linked to observation, privacy notice version, purpose, captured choice and timestamp, subject to reviewer and privacy minimization. Test without storing unnecessary browsing IDs. |
| P3 | BLOCKER | Advertising withdrawal does not reliably clear earlier affiliate attribution from `frameleads:marketing-attribution:v1` if analytics remains enabled: clearing this sessionStorage key is currently under **analytics** withdrawal, while advertising withdrawal only clears ad cookies and selected b71 IDs. `captureMarketingAttribution` may merge a stored `affiliateCode` back into session attribution while analytics remains on. Public Audit ingress still strips affiliateCode whenever advertisingConsent is false, but local storage and renewed-consent semantics remain unclear. | `src/privacy-consent.ts`; `src/marketing-events.ts`; `src/audit-capture.ts` | On advertising withdrawal, clear affiliate/referral data from applicable session stores and ensure re-enabling does not resurrect stale evidence without a fresh qualifying referral. Add tests for analytics-on/advertising-off, withdrawal, repeated Audit and re-consent. |
| P4 | BLOCKER | No implemented lifecycle/deletion matrix demonstrated for stored Audit affiliate observations, consent evidence, request limits, checkout continuations, payment linkage, exceptions or provider records. **Expiry is not erasure:** verification links expire in 20 minutes and checkout session tokens in 30 minutes, but the SQL does not delete expired records. `affiliateObservations` accumulates unique codes on the Audit row. | `20261019120000_audit_affiliate_observations.sql`, `20261019170000_secure_audit_checkout_continuation.sql`, `20261019171000_audit_checkout_payment_reconciliation.sql`, `20261020120000_whop_environment_isolation.sql` | Set documented purpose/retention criteria grounded in legal requirements; implement approved scheduled deletion/anonymisation/data-subject request path before promising it. Avoid inventing day-counts. Preserve necessary tax, purchase dispute and fraud evidence only under reviewed criteria. |
| P5 | BLOCKER | Whop's official privacy policy says that purchase confirmation, username, contact and certain account profile information **may be shared with particular Sellers & Affiliates**. Whether the specific FrameLeads partner dashboard exposes each field is unverified. Statements such as “partners never see customer information” cannot be supported. | https://whop.com/privacy/ | Confirm Whop Sandbox affiliate user-visible fields and applicable provider settings through approved read-only access; make notice truthful at the category level without guaranteeing anonymisation. |
| P6 | REVIEW | The current Audit lead-capture form says referral capture is limited to the advertising-consent choice, but does not plainly say the referrer **may be paid**; it also offers “relevant FrameLeads follow-up.” Backend Audit ingestion can schedule automated nurture after capture. Marketing email lawful basis/preferences, unsubscribe operation and geographic scope require separate review. | `src/components/PipelineAudit.tsx`; `app/api/marketing/audit-lead/ingest/route.ts` | Add compensation disclosure near capture; separately verify requested service email versus optional marketing nurture, opt-out and suppression. Do not represent affiliate consent as marketing-email consent. |
| P7 | REVIEW | Browser-side advertising consent + a second server and public feature gate is good fail-closed defense, but consent is client-reported and no dedicated affiliate preference exists. Owner's consent-prerequisite approach is preserved; privacy counsel must judge whether a more granular **optional referral purpose** is required for target jurisdictions and actual notice/UX. | `src/marketing-events.ts`; `src/audit-capture.ts`; `app/api/marketing/audit-lead/ingest/route.ts` | Policy counsel/legal reviewer determines sufficient granularity and jurisdictions. Do not silently opt non-consenting visitors in. |

Positive safeguards reviewed:
- Client captures `?a=` only with advertising consent **and** public affiliate-privacy flag; Landing public API strips affiliate code if consent is false or server privacy flag is off; Brand Brain ingestion separately strips if its flag is off.
- Affiliate code is expressly omitted from generic marketing event analytics payloads.
- Browser checkout capability cookie is Secure / HttpOnly / bounded / host-only, and subsequent flow requires explicit continuation + email verification + plan choice.
- Whop checkout config sends validated code and checkout-attempt linkage, not full Audit answers; provider payments are verified separately. Full provider-side visibility has not been independently inspected.
- These safeguards do not substitute for legal notice, retention, evidence or hosted E2E tests.

## 3. Proposed visitor-facing wording — NOT YET APPROVED FOR PUBLICATION

**Privacy Policy §2, Partner referrals:**

> If you arrive through an affiliate referral link and choose to allow optional advertising tracking, FrameLeads may record a referral partner code and limited referral context alongside a Reply Workflow Audit you choose to submit. We may connect that observation to a later email-verified checkout and a confirmed purchase to evaluate referral credit. A referral code alone does not establish a commission.

**Privacy Policy §3, Referral compensation:**

> Some eligible referral partners may receive compensation when a qualifying customer purchases FrameLeads. Where you have permitted referral tracking, we use referral identifiers, Audit-to-checkout linkage and relevant purchase status to administer and check attribution, prevent duplicate or fraudulent credit, and resolve disputes. Whop processes checkout and administers affiliate commissions under its own terms.

**Privacy Policy §4, Choices:**

> Audit diagnosis and purchasing are available without agreeing to optional advertising tracking. For this initial referral-tracking feature, advertising tracking consent is required before FrameLeads records an affiliate referral through the Audit. You may decline or later change that choice in Privacy settings. Changes affect future referral capture; they do not automatically erase records previously stored. To request access, correction or deletion of existing information, contact akram@frameleads.io. Any lawful retention exception will be explained when we respond.

**Privacy Policy §5, Sharing:**

> To operate purchases and affiliate compensation, we share relevant checkout and referral information with Whop. Whop's Privacy Policy states that it may share purchase confirmation, usernames, contact information and certain account-profile information with particular sellers and affiliates. The exact information visible to an individual partner may vary with Whop's features and policies. FrameLeads does not intentionally send your full Audit answers to an affiliate through its referral-tracking integration.

**Short notice at Audit contact-capture form:**

> If you came through a partner link, the referring partner may be paid for an eligible later purchase. With optional advertising tracking enabled, FrameLeads may connect your referral code to this Audit and a later checkout to assess referral credit. Tracking is optional; your Audit and ability to purchase do not depend on it. See our Privacy Policy and Privacy settings.

**Privacy Policy §6, retention:** Do not publish a numerical schedule yet. Reviewer must approve a source-backed retention/erasure schedule and technical enforcement for the categories in §4 below.

**Provider and controller text:** Confirm whether `BrandFlow Studio` is the accurate legal controller/trading entity name, applicable contact address and jurisdiction before finalizing. Do not claim a registration, regulator status or partner contract that has not been confirmed.

## 4. Retention / withdrawal inventory requiring owner decisions

| Category | Observed mechanism | Unresolved decision |
|---|---|---|
| Raw referral URL & browser session attribution | `a` query parameter; `frameleads:marketing-attribution:v1` sessionStorage | Explicit limit, removal on advertising withdrawal and re-consent semantics |
| Choice records | LocalStorage `frameleads:privacy-consent:v1` stores analytics, advertising, savedAt | Server-side evidence of approved notice/version + privacy-minimal lifecycle |
| Affiliate code observations/conflicts | Audit `website_audit_leads.attribution` with append-only-ish `affiliateObservations` and timestamps | Purpose, expiration/erasure, conflict handling; how consent withdrawal affects already-linked data |
| Audit content, email & company | `website_audit_leads` and prospect/interactions | Audit and marketing purpose split; unsubscribe and data-subject rights handling |
| Verification/checkout tokens | Hashed verification token expires 20m, session expires 30m; DB continuation rows remain | Delete expired tokens/rows on scheduled policy, while preserving necessary purchase references |
| Checkout attempts and reconciliation | `audit_checkout_attempts`, `whop_purchase_events`, relationship to prospect | Financial/legal retention, fraud disputes, reversals/refunds, deletion/anonymisation |
| Provider data and affiliate visibility | Whop checkout and affiliate services | Confirm what provider stores, surfaces and supports on rights requests; controller/provider responsibilities |
| Logs/diagnostics and request limits | Request limits and webhook/audit handling | Purpose, redaction, actual log retention and security exception policy |

## 5. Jurisdiction / official guidance notes for reviewer

- EDPB FAQ: nonessential storage/access technologies generally need informed consent; technically necessary ones are an exception: https://www.edpb.europa.eu/sme/find-practical-info/faq_en .
- EDPB consent guidelines: where multiple purposes require consent, unbundled specificity/granularity matters: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_en.pdf .
- UK ICO: advertising tracking technologies require consent, and the notice must explain sharing, purposes and control. Affiliate compensation linkage may have distinct purpose considerations; do not assume advertising measurement consent automatically covers it: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-the-rules-apply-to-online-advertising/ .
- Official UAE Federal Personal Data Protection Law (Decree-Law No. 45 of 2021) provides withdrawal rights and conditions; assess applicability, carve-outs, transfer rules and current implementing instruments with counsel rather than inferring that residence alone determines every obligation: https://uaelegislation.gov.ae/en/legislations/1972 .
- Whop privacy disclosure and jurisdictional rights: https://whop.com/privacy/ .

These references guide questions; they are **not a legal determination for FrameLeads' particular controller, buyers, countries, or processing roles**.

## 6. Acceptance checklist before setting privacy approval flags

- [ ] Responsible policy reviewer records identity, date, applicable audience jurisdictions and lawful basis; approves or requires refinement of the advertising-prerequisite/affiliate-purpose choice.
- [ ] Review confirms public policy/controller identity, approved text, effective version and in-Audit compensation notice; exact URLs and publication date documented.
- [ ] Narrow code/test changes resolve P2 consent receipt and P3 stale-referral opt-out; prove no capture or later resurrection without required user choice.
- [ ] Retention/deletion criteria approved for every category; implemented/tested cleanup and rights-request procedure, including financial-record exceptions.
- [ ] Whop Sandbox affiliate visibility and data recipient relationship verified; privacy notice does not promise anonymized or zero buyer data without proof.
- [ ] Review requested nurture/marketing email legal basis, suppression, unsubscribe and preference separation.
- [ ] Counsel/policy owner records written approval of exact final wording and implementation, not merely the business approach.
- [ ] Flags remain OFF until separate isolated-preview, database-authorization and synthetic E2E release gates are completed.

**Required engineering task, narrow only:** When policy reviewer decides retention/receipt standards, make targeted PR #5 / PR #12 changes and add focused no-consent, withdrawal, re-consent, persisted observation and erasure/cleanup tests. Do not broadly redesign the affiliate program.

**Release state:** REVIEW-ONLY. Nothing in this document authorizes migration 16, a production merge, publication, tracking flag activation, or real Whop affiliate enrollment.
