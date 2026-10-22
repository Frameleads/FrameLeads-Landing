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

---

## 7. Landing remediation and updated verified behavior — 22 October 2026

**Status:** engineering proposal and source review only. The wording below remains **DRAFT — NOT APPROVED FOR PUBLICATION**. This addendum does not change the live Privacy Policy or enable any feature.

### Verified source behavior after the narrow Landing change

- Browser affiliate capture still requires `advertising === true` and `NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"`. The public Audit route independently removes `affiliateCode` unless its request says advertising is enabled and `AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"`; Brand Brain has its own gate.
- On an advertising preference change from enabled to disabled, Landing removes `affiliateCode` from `frameleads:marketing-attribution:v1`, preserves any other stored attribution fields (including allowed UTMs), removes the `a` referral query parameter from the current URL while preserving other query parameters and the hash, and clears the known advertising IDs/cookies. Where the session storage API fails, current-page capture fails closed for the prior code. A cross-tab local-storage preference event applies the same cleanup in that tab.
- Analytics-only consent continues to permit allowed campaign attribution; it does not permit affiliate referral capture. If analytics is also withdrawn, the existing broader measurement cleanup still applies.
- Re-enabling advertising consent does not restore the cleared session referral or old URL parameter. A new qualifying referral URL after valid consent and the privacy gate can be captured. A browser cannot retract an already-forwarded server observation by clearing its local session; existing server records need a separately approved retention/deletion process.
- Affiliate IDs remain excluded from generic marketing event properties. The Audit diagnosis and ordinary checkout entry points do not depend on advertising consent.
- `advertisingConsent` is still a client-reported boolean at the public boundary. Server gates enforce the technical prerequisite and fail closed, but this is **not independent evidence** that a particular notice and choice were presented or accepted.

The Landing change and its tests are limited to browser withdrawal/recapture behavior. No backend schema, hosted database, migration, privacy page, or policy approval was changed.

## 8. Minimal server-side consent-receipt specification for separate review

This is a design proposal, not an implemented receipt and not a legal approval. It requires a separate authorized Brand Brain schema/API task and review; do not run Migration 16 or implement against the hosted database as part of this Landing work.

### Proposed record and flow

1. Serve a versioned notice identifier and purpose identifier with the privacy-choice UI, e.g. `affiliate_referral_attribution` and a reviewer-approved notice version. The present notice/version must be fixed server-side for the environment; the client must not choose an arbitrary version string.
2. When rendering/starting the choice flow, issue a short-lived, single-use server challenge scoped to the notice version and purpose. On affirmative submission, the endpoint validates the challenge, origin/CSRF controls, purpose, expected version, and active server privacy approval gate. It records a server timestamp and a random receipt UUID. Do not treat a client timestamp or boolean as authoritative evidence.
3. Store only: receipt UUID; purpose; affirmative choice; server `recorded_at`; exact notice version and immutable notice URL or content digest; challenge-consumed state; and later withdrawal/preference-change event references. No IP, user-agent, fingerprint, advertising cookie, or new analytics ID is needed for this design.
4. Return a signed, scoped, short-lived receipt reference to the browser. The Audit submission may include that reference with its referral observation. The ingest service validates signature, purpose, version, affirmative state, expiry, and single-use/linkage policy, then binds the server-known receipt ID to the exact referral observation in one transaction. It must not trust a client-supplied receipt UUID or `advertisingConsent: true` alone.
5. Record withdrawal or relevant preference change as a server-timestamped event linked to the receipt. Apply it to future captures immediately; policy owners must decide whether and how a previous observation remains eligible for attribution and what deletion/retention obligations apply. A receipt is evidence of a recorded interaction, not proof of identity, comprehension, or legal sufficiency.

### Proposed schema boundary and tests

Prefer a small append-only `privacy_consent_receipts` table plus a linked `privacy_consent_events` table, or equivalent minimal columns/tables, with service-role-only access and no public reads. Add a nullable receipt foreign key to the specific Audit referral observation (not merely the mutable aggregate lead attribution object). Preserve the existing unverified-observation and Whop-authority distinctions. Define data subject deletion/correction handling and financial-record exceptions before choosing append-only semantics. Any foreign keys, indexes, privileges, RPC behavior, and migration number must be reviewed in the separate backend task.

Required backend contract tests: challenge bound to purpose and notice version; affirmative server timestamp; reject boolean-only, missing, expired, replayed, wrong-purpose, wrong-version, revoked, or client-invented receipt; link receipt to exactly the referral observation created by that Audit capture; atomically reject or safely handle a failed link; record withdrawal/preference changes; ensure no receipt or referral observation is created with either server feature gate off; verify no unnecessary IP/device identifiers are stored; and exercise the approved deletion/export path without deleting evidence subject to a reviewed legal hold.

## 9. Retention and deletion decision table

The tables below distinguish code and database behavior verified in source from decisions still requiring the responsible owner and legal/policy reviewer. No retention period is approved here.

| Information | Source-backed current behavior / deletion mechanism | Decision and implementation still required |
|---|---|---|
| Referral URL parameters (`a`, UTMs, click IDs) | Browser URL. On advertising withdrawal Landing now removes only `a` from the current URL. URL/query history, browser history, access logs, referrer propagation, and provider/network logs are not erased by that action. | Approve handling of incoming query values, history/log exposure and provider logs; define whether/how long any server-side request logs are retained. |
| Browser/session attribution | `frameleads:marketing-attribution:v1` in sessionStorage; advertising withdrawal removes only the affiliate code and retains permitted analytics/campaign fields. Analytics withdrawal clears this session key. Session end is browser behavior, not a durable deletion guarantee. Consent choices remain in localStorage until changed/cleared. | Define client storage lifecycle and withdrawal behavior for each purpose; test browsers/tabs/storage denial. Do not claim client cleanup deletes server records. |
| Consent evidence | Current implementation has localStorage preferences and `savedAt`; there is no durable server receipt linked to an observation. | Select approved purpose, notice/version, evidence and withdrawal model; then authorize a separate schema/API design and retention/deletion path. |
| Audit referral observations and conflicts | Brand Brain migration `20261019120000_audit_affiliate_observations.sql` stores unique codes, timestamps and verification status in `website_audit_leads.attribution`; conflicting codes stay as `affiliateObservations` and mark `CONFLICTED_UNVERIFIED`. No timed cleanup appears in the inspected migration. | Decide retention for observation, code, timestamps, conflicts, and withdrawal. Specify per-observation erasure/anonymization without silently altering unrelated Audit content. Parent Audit deletion cascades to checkout-continuation records, but no automated parent deletion process was found. |
| Audit answers, contact details and prospect linkage | Audit lead is stored/updated by the ingestion pipeline; the inspected referral migration does not define a deletion schedule. Related prospect/interactions and nurture state are separate linked records. | Approve purpose separation for Audit delivery, follow-up/nurture and attribution; map full relational deletion/export impact and suppression records. |
| Verification tokens and checkout continuation sessions | `audit_checkout_continuations` stores token hashes. RPC checks enforce 20-minute verification expiry and 30-minute session expiry; cancellation clears the session hash. These checks do not delete expired rows. | Choose cleanup timing and preserve any minimum linkage needed for in-flight or completed checkout records. Expiry is not erasure. |
| Checkout request limits | `audit_checkout_request_limits` rows are scoped to a continuation and cascade if that continuation is deleted. A one-hour counter reset and 24-hour issuance limit are rate-limit rules, not cleanup. | Decide when to delete limit rows with their parent and verify no separate backup/log copy retains them longer. |
| Checkout attempts | `audit_checkout_attempts` holds plan/account, affiliate code/ID, state and timestamps. It cascades with continuation or Audit lead deletion, but payment reconciliation adds restrictive purchase linkage; no automatic cleanup was found. | Decide lifecycle for abandoned attempts and approved preservation/decoupling for paid, disputed, reversed or fraud-reviewed attempts. |
| Whop purchase/reconciliation records | `whop_purchase_events` records provider event/payment identifiers, buyer email, amount/currency, status, fingerprint and attribution linkage. Reviewed migrations show inserts/updates and reconciliation, but no deletion schedule. Related purchase interactions/outcomes may also retain linkage. | Finance/legal owner must approve retention, minimization, deletion exceptions, correction, and provider-side requests. Financial, tax, fraud and dispute evidence must not be destroyed without an approved policy. |
| Conflicted affiliate, fraud, dispute and commission evidence | Conflicts are in the Audit attribution JSON; purchase mismatch/review states and affiliate linkage are in checkout/purchase rows. The migrations provide integrity/status controls but no expiry or erasure workflow. Whop remains authoritative for commission/payout. | Define dispute/fraud purpose, access controls, hold/release conditions, reviewable audit trail, and what may be retained after deleting ordinary marketing/Audit data. Do not infer provider-side deletion from Landing or Brand Brain behavior. |
| Provider-side records and visibility | Landing source does not establish Whop's actual per-account affiliate dashboard fields or its retention/deletion completion. Whop's public policy describes possible sharing categories; account-specific visibility remains unverified. | Verify through approved read-only provider evidence and document controller/processor roles, rights routing, transfers, provider retention and partner-visible data before publication. |

**Confirmed deletion mechanisms in inspected source:** client-side removal of applicable session fields on withdrawal; cascade constraints from deleting an Audit lead or continuation to some dependent rows; cancellation clears the active continuation session hash. **Not demonstrated:** scheduled deletion, expiration-triggered row deletion, deletion API/worker, data-subject deletion workflow, backup expiry, Whop deletion, or a policy-driven financial/fraud hold and release process. The cascade constraints are capabilities, not proof that parent records are actually deleted.

## 10. Updated draft visitor wording and unresolved approvals

All following wording is **DRAFT — NOT APPROVED FOR PUBLICATION**.

**Proposed Privacy Policy — affiliate compensation and attribution:**

> Some eligible referral partners may receive compensation when a customer makes a qualifying purchase. If you arrive through a partner link and allow optional advertising tracking, FrameLeads may record the referral code with a Reply Workflow Audit you choose to submit and connect that observation to a later email-verified checkout and confirmed purchase status to assess referral credit. A referral observation alone does not establish a commission. Whop processes checkout and administers affiliate commissions under its own terms. Whop's Privacy Policy describes categories of purchase and account information that may be shared with certain sellers or affiliates; the exact information visible to a particular partner has not been independently verified by FrameLeads.

**Short Reply Workflow Audit disclosure:**

> If you arrived through a partner link, that partner may receive compensation for an eligible purchase. If you allow optional advertising tracking, FrameLeads may connect the referral code to this Audit and a later checkout to assess referral credit. The Audit diagnosis and your ability to purchase remain available if you decline tracking.

**Decline or withdrawal explanation:**

> If you decline advertising tracking, this Audit flow will not capture an affiliate referral code. If you later withdraw that choice, Landing removes the referral code from this browser's applicable session attribution and current URL; permitted analytics attribution may remain if analytics consent stays on. Re-enabling tracking does not restore that cleared code; a new qualifying referral interaction after valid consent is needed. This browser cleanup does not automatically erase an Audit referral record already sent to FrameLeads. Use the privacy contact to ask about information already held; applicable retention exceptions must be assessed under an approved policy.

**Unresolved owner/legal decisions before policy approval:** identify controller/trading entity and contact details; determine audience jurisdictions and applicable laws; assess lawful basis and whether referral attribution requires a distinct granular choice; approve purpose and notice/version; distinguish requested workflow-map delivery from optional marketing email and its lawful basis/consent/unsubscribe; confirm Whop roles, actual affiliate-visible data, provider retention and data-sharing settings; assess international transfers and rights handling; approve retention/deletion and financial/fraud/dispute exceptions; and designate an accountable policy reviewer and effective date. None is resolved by code tests.

**Focused tests after formal policy/schema approval:** browser consent/withdrawal/recapture and cross-tab tests; end-to-end API and Brand Brain gate tests; receipt tamper/replay/version/purpose/linkage tests; Audit diagnosis and checkout availability for rejectors; no affiliate code in generic analytics or non-consented submissions; approved withdrawal and deletion/export flow; retention cleanup boundary and legal-hold tests; provider Sandbox visibility/flow checks; and separately approved policy-version presentation checks. Keep every affiliate flag off until the policy, schema, sandbox, and release reviews are recorded.
