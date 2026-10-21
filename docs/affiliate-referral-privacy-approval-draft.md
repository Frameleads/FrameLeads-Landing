# FrameLeads — affiliate-referral privacy approval draft
**STATUS: NOT APPROVED / DO NOT PUBLISH OR ENABLE FLAGS.** Prepared for owner/policy review using `src/app/privacy/page.tsx`, `src/privacy-consent.ts`, `src/audit-capture.ts`, and `docs/affiliate-referral-privacy-gate.md` on the isolated Landing PR #5 branch.

## Why this is required
The current published Privacy Policy discusses optional advertising measurement and campaign/referral information, but it does **not clearly disclose compensation-bearing affiliate attribution** through an Audit followed by a later purchase. The currently implemented candidate requires both advertising consent and a separate disabled-by-default privacy flag to store the affiliate code.

**Technical behavior currently implemented (do not change without separate code review):**
- Visitor without advertising consent: do not capture affiliate code in the Reply Workflow Audit.
- Visitor with advertising consent: still do not capture affiliate code unless `AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` on Landing and Brand Brain and `NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` on Landing.
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

**Warning:** Do not promise that changing a current preference automatically deletes previously persisted referral evidence. The current consent mechanism governs future capture; retention/erasure of past records must be designed and reviewed separately.

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
