# FrameLeads — affiliate-referral privacy approval draft
**STATUS: NOT APPROVED / DO NOT PUBLISH OR ENABLE FLAGS.** Prepared for owner/policy review using `src/app/privacy/page.tsx`, `src/privacy-consent.ts`, `src/audit-capture.ts`, and `docs/affiliate-referral-privacy-gate.md` on the isolated Landing PR #5 branch.

## Owner decision — public operator identification (approved 22 October 2026)

**Approved business-owner choice:** The individual operator's legal name may appear publicly in the FrameLeads Privacy Policy. Whop's provided verification screenshot shows individual identity verification as **Verified**, with the name **Akram Walid**, country **United Arab Emirates**. The Whop business UI shows **BrandFlow Studio** as a display/trading name; separate business verification was not completed in the shared screen. This decision **does not** establish business licensing, company registration, tax status, or final legal sufficiency.

**Proposed Section 1 replacement — exact public wording approved in principle, still held for legal/policy review and publication authorization:**

> **About FrameLeads.** FrameLeads is offered under the BrandFlow Studio name and is operated by Akram Walid, based in the United Arab Emirates. For questions about how personal information is collected, used, retained, or shared, or to exercise applicable privacy rights, contact akram@frameleads.io.

**Data minimization:** Do not add residential address, phone number, birth date, verification documents, or screenshots of verification to the repository or website. Owner approval is limited to publishing their name and the above operator-identification language; it is **not** blanket approval of compensated referral tracking, policy text, retention dates, processing operations, flag changes, migrations, or deployment. Keep final controller identification subject to applicable legal review.

## Owner decision — advertising/referral disclosure approach (approved in principle 22 October 2026)

**Business approval only, subject to independent policy/legal review:** The owner approves proposed expanded optional privacy-choice text explaining that advertising/conversion measurement and compensated partner referrals may be linked to an Audit and later purchase. For the current launch design, the owner maintains advertising consent as a prerequisite for initial Audit-based affiliate referral attribution, while maintaining a fully usable Audit and ordinary purchase route for non-consenting visitors. Whether these are sufficiently related purposes to share one checkbox remains explicitly **NOT LEGALLY APPROVED**; if granular consent is required, use distinct choices before launch. No flags may be enabled on the strength of this owner decision alone.

**Proposed expanded consent control copy, not approved for publication:**

> **Advertising, conversion measurement and partner referrals (optional)**
>
> Allow optional advertising measurement through supported providers, including Meta, TikTok and Whop. If you arrived through a partner link, FrameLeads may also connect that referral to your Reply Workflow Audit and a later purchase to determine whether the partner qualifies for a commission. You can use the Audit and purchase FrameLeads without accepting this tracking. You can change your preferences later.

**Attribution economics and UX caveat explicitly raised by the owner:** If the person declines optional tracking, the Audit cannot pass a captured affiliate code into FrameLeads' later affiliate-aware checkout; Whop cannot be assumed to reconstruct that missing Audit origin simply because the buyer uses the same email days later. A separate qualifying Whop-tracked link may establish native platform attribution independently, subject to its actual provider mechanics and the visitor's choices. Current Brand Brain `isAuditCheckoutContinuationAvailable()` additionally requires `UNVERIFIED` affiliate evidence, which can exclude non-consent visitors from the special delayed checkout flow even though regular purchase remains accessible. **Before launch, propose a separate reviewed functional change to allow ordinary non-attributed delayed checkout continuation regardless of optional advertising consent.** This proposal does not authorize changes to checkout logic or promise affiliate credit without valid referral evidence. Do not claim Whop provides a fixed multi-day cookie window without account-specific provider evidence and a controlled sandbox test.

## Business priority — fast purchase conversion with fair delayed commissions (22 October 2026)

**Owner-stated principle, NOT an approved commission contract or legal tracking basis:** The affiliate campaign should capitalize on video-driven, high-intent interest and encourage immediate purchase; however, if an affiliate genuinely contributes to a purchase days later during nurture, FrameLeads should not intentionally withhold a contractually earned commission merely because the buyer did not convert on day one. The owner explicitly prioritizes fair fulfillment of referral obligations. No assertion is made that delayed buyers are a verified low percentage.

**Draft implementation/policy direction — subject to separate approval:**

- Propose a **30-day referral eligibility window** as a starting term for owner consideration, not a verified Whop cookie period, implemented program setting, privacy retention period or owner-approved term. Lock it only after checking Whop provider mechanics, commission settings, participant agreements, and privacy legal basis. The scope of first-payment vs recurring commissions also needs express written agreement.
- Eligible consented Audit observations can support delayed **explicit** email-verified checkout where the backend passes validated affiliate identity to Whop and a provider-confirmed commission is recorded. A nurture email alone is not an affiliate attribution mechanism; verify the exact later purchase path and checkout association.
- Respect rejection/withdrawal: never preserve or reconstruct declined Audit tracking through hidden browser identifiers, email matching or undisclosed marketing inference. An independent **voluntary affiliate code at checkout** may be considered as a plainly disclosed, separately reviewed route for buyer-initiated referral credit; it is not currently implemented. The buyer should retain ordinary purchase access without optional tracking.
- Publish a simple partner referral dispute process: accept limited, lawfully supplied evidence; verify sale, competing attribution, fraud/chargebacks and buyer privacy; correct eligible credit through an **authorized provider-supported** mechanism if possible. Do not claim Whop provides retroactive commission reassignment or create discretionary payouts without agreement and operational approval.
- Resolve conflicts under an explicit, predictable precedence rule and avoid duplicate commissions. Honor whatever commission rate, recurring term, window, exceptions and correction rights FrameLeads actually promises to partners. No fixed production commission rate is approved here.
- Non-consenting Audit visitors must still be able to request ordinary checkout continuation without being deprived of the convenience offered to attributed buyers. This is a proposed separate, reviewed feature change; no implementation is authorized by this note.

**Known present limitation:** `isAuditCheckoutContinuationAvailable` in Brand Brain currently requires `readAffiliateEvidence(...).status === 'UNVERIFIED'`. No evidence establishes that ordinary nurture emails automatically pass an affiliate code into Whop checkout. Verify and repair the customer path in a separately scoped development review before partner promises are made. Neither this note nor prior owner approvals authorizes bypassing the hosted Migration 16 safety refusal, changing live Whop, publishing policies, sending invitations or enabling feature flags.

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
