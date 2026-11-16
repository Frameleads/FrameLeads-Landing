# Resend for FrameLeads affiliate emails — Preview only

**2026-11-13.** This supersedes the older MailerSend setup notes for the currently approved implementation. Whop continues to manage the affiliate relationship and 30% recurring rewards for Core/Enterprise. Resend is only the transactional sender for email verification and the welcome message with two verified Whop links.

## DNS and domain authentication

Account owner has registered `frameleads.io` with Resend in North Virginia (us-east-1), send-only. Vercel's authoritative DNS has the required three records:

- `resend._domainkey`: TXT with Resend's supplied DKIM public key;
- `send`: CNAME `send.forge.rmta.net.`;
- `rsend`: CNAME `rsend.forge.rmta.net.`.

All were confirmed present in Vercel DNS on 2026-11-13. **Resend displayed Pending** in the provided screenshot immediately after Domain Connect, while DNS propagation and Resend's validation were still in progress. DNS presence does not establish domain verification. Do not recreate the records or alter Google Workspace SPF, MX or DKIM.

## Integration code

- `src/affiliate-native-email.ts` now POSTs `https://api.resend.com/emails` with verified sender, one authorized recipient, plain text and HTML. Never claims delivery based on provider acceptance.
- It requires successful HTTP 200/201 **and** a valid UUID-shaped `id` in the JSON response. The returned ID can be checked later in Resend's email events; it is not proof of inbox delivery. Provider error bodies and tokens are not logged.
- `src/affiliate-native.ts` uses `AFFILIATE_RESEND_API_KEY` instead of `AFFILIATE_MAILERSEND_API_KEY`, with existing `AFFILIATE_MAIL_FROM=akram@frameleads.io` on the feature branch.
- Existing Preview simulation and Production feature gates remain in place; the Whop integration and commissions were not modified.
- `tests/affiliate-native-email.test.ts` exercises the mocked Resend API acceptance format, missing/malformed IDs, invalid sender/permission, rate limiting, unsafe referral URLs, and content checks.

## Required actions before live email testing

1. Wait until Resend reports the domain is **Verified for sending** (receiving is not required).
2. In Resend → API Keys, create an **email-sending only** API token, limited to `frameleads.io` if supported. Do not send the key through chat, email, GitHub or code.
3. Save the token directly in Vercel's `frameleads-landing` project under **Preview only** and branch `feat/whop-native-affiliate-preview-20261112` as **Sensitive** `AFFILIATE_RESEND_API_KEY`; keep `AFFILIATE_MAIL_FROM=akram@frameleads.io`.
4. After configuring, use an explicitly approved **single-recipient Preview send**, then verify the returned message ID in Resend's Emails page, wait for a delivery event, and check the receiving mailbox. Do not mistake API acceptance for receipt.
5. The public website signup cannot be enabled until the separate complete form→verification→Whop enrollment→welcome test, rate-limit/replay protection, privacy and independent security review pass. Production feature flags stay **OFF**.

Reference: https://resend.com/docs/api-reference/emails/send-email and https://resend.com/changelog/domain-verification-events.
