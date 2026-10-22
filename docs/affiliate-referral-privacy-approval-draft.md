# FrameLeads — affiliate-referral privacy approval draft
**STATUS: NOT APPROVED / DO NOT PUBLISH OR ENABLE FLAGS.** Prepared for owner/policy review using `src/app/privacy/page.tsx`, `src/privacy-consent.ts`, `src/audit-capture.ts`, and `docs/affiliate-referral-privacy-gate.md` on the isolated Landing PR #5 branch.

## Owner decision — public operator identification (approved 22 October 2026)

**Approved business-owner choice:** The individual operator's legal name may appear publicly in the FrameLeads Privacy Policy. Whop's provided verification screenshot shows individual identity verification as **Verified**, with the name **Akram Walid**, country **United Arab Emirates**. The Whop business UI shows **BrandFlow Studio** as a display/trading name; separate business verification was not completed in the shared screen. This decision **does not** establish business licensing, company registration, tax status, or final legal sufficiency.

**Proposed Section 1 replacement — exact public wording approved in principle, still held for legal/policy review and publication authorization:**

> **About FrameLeads.** FrameLeads is offered under the BrandFlow Studio name and is operated by Akram Walid, based in the United Arab Emirates. For questions about how personal information is collected, used, retained, or shared, or to exercise applicable privacy rights, contact akram@frameleads.io.

**Data minimization:** Do not add residential address, phone number, birth date, verification documents, or screenshots of verification to the repository or website. Owner approval is limited to publishing their name and the above operator-identification language; it is **not** blanket approval of compensated referral tracking, policy text, retention dates, processing operations, flag changes, migrations, or deployment. Keep final controller identification subject to applicable legal review.

## Why this is required
The current published Privacy Policy discusses optional advertising measurement and campaign/referral information, but it does **not clearly disclose compensation-bearing affiliate attribution** through an Audit followed by a later purchase. The currently implemented candidate requires both advertising consent and a separate disabled-by-default privacy flag to store the affiliate code.

**Technical behavior currently implemented (source-verified after Landing withdrawal fix):**
- Visitor without advertising consent: do not capture affiliate code in the Reply Workflow Audit.
- Visitor with advertising consent: still do not capture affiliate code unless `AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` on Landing and Brand Brain and `NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` on Landing.
- When advertising consent is withdrawn, Landing removes the affiliate code from applicable browser session attribution and the current `a` URL parameter, while retaining permitted UTM attribution if analytics remains enabled. The browser route also cleans up on a consent change reported from another tab.
- Re-enabling consent does not restore a cleared referral. A fresh qualifying referral URL after valid consent and the privacy gate is needed. A browser cleanup does not erase an observation already sent to Brand Brain.
- Audit remains available to visitors regardless of optional advertising consent; a prospect's referral cannot be attributed through this specific audit flow when the code was not captured.
- A stored referral observation is not proof of active affiliate eligibility or any Whop commission.
- Whop handles checkout and is the authority for provider-verified commission/payout records.
- Existing privacy choices are analytics and advertising; **there is no separate affiliate consent toggle**. The policy owner must decide whether coupling referral capture to advertising consent is appropriate and sufficiently transparent, or request a separate optional referral preference with independently tested withdrawal behavior.

## Proposed addition to Privacy Policy section 2 — information we use
> **Partner referrals.** If you arrive through a referral link and permit the relevant optional tracking, we may record a referral partner identifier and the circumstances of that visit with your Reply Workflow Audit request. We may associate that identifier with a later checkout or verified purchase to assess whether the referring partner is eligible for referral credit. Your Audit answers are used for your requested diagnosis, not as a basis to calculate partner commissions.

## Proposed addition to section 3 — how we use information
> **Affiliate referral credit.** FrameLeads may compensate eligible referral partners for qualifying purchases. Where you permit referral tracking, we use the referral identifier, associated Audit and checkout linkage, and purchase confirmation to validate whether referral credit applies and to prevent duplicate or fraudulent attribution. Whop manages purchases and any resulting affiliate commissions or payouts. A referral observation does not by itself create a commission.

## Proposed addition to section 4 — cookies and choices
> **Referral-tracking choice.** Referral tracking in the current service is disabled unless you allow optional advertising measurement and FrameLeads has enabled its approved referral feature. Declining advertising measurement does not prevent you from using the Audit or purchasing FrameLeads, but your visit may not be eligible for referral credit through the Audit-based flow. You can change optional measurement choices using Privacy settings. Requests about referral data already collected can be sent to akram@frameleads.io.

**Evidence limitation:** the browser stores a preference and timestamp, and the Audit sends a client-reported consent boolean. Neither proves independently which notice/version was shown or that an affirmative choice was made for that exact purpose. No durable server-side consent receipt is currently implemented. The proposed minimum server-side receipt and its tests are specified in `docs/affiliate-referral-privacy-forensic-review-2026-10-22.md`; this requires a separate authorized Brand Brain implementation review. Browser withdrawal cleanup affects future capture but does not erase previously persisted server evidence.

## Proposed addition to section 5 — service providers
> To operate a referral program, FrameLeads may share purchase eligibility and attribution information with Whop as required for checkout and commission administration. Whop has its own privacy notice. We do not send the complete Reply Workflow Audit answers to a partner through the referral tracking mechanism. The program must be reviewed for what information Whop itself makes visible to affiliates before making broader promises about what partners can see.

## Decision required on section 6 — retention
**DO NOT PUBLISH THIS PLACEHOLDER AS POLICY COPY.**

A designated policy owner must choose documented retention periods or defensible retention criteria for:
1. raw referral URL parameters and optional browser/session state;
2. consent records;
3. persisted Audit referral observations and conflicts;
4. signed checkout continuation/attempt records;
5. verified Whop purchase evidence and audit logs;
6. exception/integrity records needed to dispute or prevent double commission.

Also define partner disclosure/visibility, cross-border transfers as applicable, data-subject access/deletion handling, and how withdrawal changes future tracking. Do not pick numerical periods without checking implemented retention and applicable law.

## Proposed short Reply Workflow Audit disclosure — DRAFT — NOT APPROVED FOR PUBLICATION

> If you arrived through a partner link, that partner may receive compensation for an eligible purchase. If you allow optional advertising tracking, FrameLeads may connect the referral code to this Audit and a later checkout to assess referral credit. The Audit diagnosis and your ability to purchase remain available if you decline tracking.

If advertising tracking is declined, the Audit flow does not capture an affiliate referral code. If the choice is withdrawn later, Landing removes the code from applicable browser session attribution and the current referral URL parameter, while permitted analytics attribution may remain when analytics consent stays enabled. Restoring consent does not restore the cleared code; a fresh qualifying referral interaction is required. This browser action does not automatically erase server-side records already linked to the Audit. The retention and deletion decisions remain subject to owner and legal review.

## Consent receipt and evidence gap — not implemented

Do not treat a client boolean as independently verified evidence. A separate Brand Brain review should specify a one-time server challenge bound to a server-controlled purpose and notice version, a server-timestamped affirmative receipt, a scoped short-lived signed receipt reference, transactional linkage to the exact Audit referral observation, and linked withdrawal/preference-change events. Keep the record limited to purpose, choice, timestamp, notice version/URL or content digest, receipt/linkage IDs, and status; do not add IP, user-agent, fingerprint, or ad identifiers. Receipt evidence would document the recorded interaction, not decide legal sufficiency. Required validation and replay/linkage tests are in the forensic review addendum.

## Retention/deletion status — source verified, policy open

Referenced Brand Brain migrations establish expiry checks for verification and checkout session tokens and cascade relationships for some child rows. They do not provide a demonstrated scheduled deletion process. Expiry is not database deletion. Referral observations/conflicts, continuation rows, request-limit rows, checkout attempts, Whop purchase/reconciliation events, and linked fraud/dispute evidence have no approved retention schedule in this task. Financial and dispute evidence must not be destroyed without a responsible policy approval. See the forensic review addendum's decision table for source behavior and per-category decisions.

## Acceptance checklist (policy owner must sign off)
- [ ] Referral compensation purpose and recipient/category transparently explained.
- [ ] Choice/lawful basis reviewed for audience jurisdictions, including people declining advertising tracking.
- [ ] Published notice location and in-Audit brief disclosure confirmed.
- [ ] Retention table backed by actual technical retention/deletion behavior.
- [ ] Whop affiliate dashboard visibility and sharing reviewed; no unsupported privacy promises.
- [ ] Consent withdrawal and existing-record request handling documented and tested.
- [ ] Approval recorded with reviewer, date, exact text/version, and all feature flags OFF until coordinated sandbox release.

## Engineering handoff after approval
Only after written approval: implement the final reviewed policy changes and any required consent UI changes on the Landing review branch; add focused consent/rejection/returning-purchase tests. Keep affiliate tracking, checkout and privacy flags off pending the sandbox end-to-end gate. Do not merge, deploy production, or enable live Whop commissions based solely on this draft.
