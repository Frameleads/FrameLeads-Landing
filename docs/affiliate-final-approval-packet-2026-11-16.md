# FrameLeads affiliate public-launch approval packet — 16 November 2026

**Status: DRAFT FOR OWNER REVIEW — NOT LEGAL APPROVAL.** Do not construe this file as a legal opinion, formal approval, or authorization to activate Production. The business has not yet been registered, according to the owner; do not describe BrandFlow Studio as an incorporated or registered company.

## Current confirmed implementation

- Public application gathers first name, last name, email, agreement. Browser sends to FrameLeads over HTTPS.
- Production applies Cloudflare Turnstile, checks site hostname and challenge action, and requires BOTH independent feature switches before external provider calls.
- Resend receives name/email and a 20-minute encrypted confirmation URL. After clicking, Whop receives confirmed email and establishes/reuses an affiliate relationship; Whop is the system of record for affiliate links, rewards and payouts.
- Whop Core and Enterprise plan IDs are pinned in code to $149/month and $499/month, with two 30% recurring / all_payments rewards. Prices and provider ownership are checked before changes. No proof of actual paid recurring commission settlement has been claimed.
- Resend sends the welcome email containing individually verified checkout referral links and the 23-screenshot full product-proof resource ZIP. The ZIP contains illustrative demo screens, not real client results.
- The current implementation does not put affiliate applicants into an independent website database. Resend and Whop retain their own provider records. Serverless logs do not deliberately contain email addresses, tokens, or referral links, but provider retention and cross-border processing must be verified from the actual provider agreements.
- The protected Preview test was completed and recorded by the owner on 15 Nov; this does not constitute a public-traffic or Production credential validation.

## Legal wording currently in draft PR #43

**Privacy Policy: affiliate applications.** The new paragraphs in `src/app/privacy/page.tsx` say first name, last name and email are processed to verify and enroll the affiliate; Resend sends transactional email; Whop manages affiliate information; optional advertising consent is not required; and providers keep records under their own policies.

**Terms of Service: affiliate partner program.** The added section in `src/app/terms/page.tsx` says (a) 30% on eligible Core and Enterprise initial and recurring payments, subject to Whop reward terms and adjustments, (b) earnings are not guaranteed, (c) affiliates must disclose their relationship as required and must avoid false testimonials and invented client results, and (d) demo screenshots do not constitute customer results.

## Decisions and evidence needed BEFORE public publication

1. **Business/operator identity:** Confirm the correct non-misleading legal name, physical contact/jurisdiction disclosures, and seller identity to use in policy and terms while unregistered. The existing term "A BrandFlow Studio company" has already been replaced in the affiliate page/email with neutral branding; review remaining legal pages and global footer separately.
2. **Processing:** Confirm the actual Resend and Whop processing arrangements and relevant transfer/retention terms; if necessary amend privacy disclosures, exercise of rights, and contacts to match facts. Do not invent retention deadlines.
3. **Affiliate claims:** Owner explicitly approves the text and the 30% recurring offer, including caveats about discounts, refunds and provider decisions. No guaranteed income or payouts are claimed.
4. **Hosting:** Select a hosting arrangement permitting commercial use. Vercel Hobby's terms cannot be changed by waiting for the 24-hour deployment quota to reset. No hosting purchase, migration or DNS change is authorized.
5. **Security:** Confirm the Production Whop credential has required **read and affiliate-create** permissions using a controlled provider test; validate sender with Resend. Review prepared Vercel WAF rule before activation, confirm Turnstile matching hostname/action, and decide whether a durable one-time nonce ledger is required for the public threat model. Current tokens expire after 20 min and are cryptographically authenticated, but are not atomically consumed. Whop override idempotence and Resend per-token 24h deduplication are partial mitigations, not durable replay protection.
6. **Final release:** Complete an independent security/legal signoff as appropriate. Require explicit owner authorization to merge, publish/approve the policy, or change `AFFILIATE_NATIVE_REGISTRATION_ENABLED` and `AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED` from false. Never silently enable either variable.

## Precise release plan once approvals exist

- With both switches still false, review the PR diff, GitHub CI and the 23-image ZIP. Merge to the approved main branch only after legal/policy review; verify the informational page and safe 503 registration response.
- On commercially permissible hosting, validate Production-only credentials and Turnstile on a gated environment, enable reviewed abuse controls and then activate the public flow in a separately authorized release.
- Verify normal site, form, confirmation email, Whop reward readback, welcome email, full proof ZIP, anonymized errors and ability to switch off public registration. Avoid test charges or unauthorized Whop writes.

**Not authorized by this packet:** checkout purchases, billing upgrades, registering an unapproved affiliate, publishing revised legal copy, Prod deployment, domain/DNS changes, WAF activation or public signup.

Links: [Draft PR #43](https://github.com/Frameleads/FrameLeads-Landing/pull/43) · `docs/affiliate-release-readiness-2026-11-15.md`.
