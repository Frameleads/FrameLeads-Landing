# FrameLeads affiliate proof kit and MailerSend setup — 2026-11-13

## Purpose

Make authentic product demonstration material available to partners **without**
granting access to FrameLeads. Preserve the existing Whop-native enrollment and
30% recurring Core/Enterprise rewards.

## Product proof implemented in PR #43 (Preview only)

Route: `/affiliates#partner-proof-kit`

The resource area offers four individual screenshots plus a downloadable ZIP:
`/resources/frameleads-affiliate-product-proof.zip`

All ZIP content is sourced **verbatim** from public, previously approved
FrameLeads "How It Works" assets in `public/images/product-proof`:

- `01-outbound-sandbox.png` — prepared outreach workspace
- `02-incoming-reply-20261102.png` — Inbox Triage
- `03-intent-context-20261102.png` — Intent and Context
- `04-decision-packet-20261102.png` — governed Decision Packet

The ZIP is built deterministically by `scripts/build-affiliate-proof-kit.mjs`
on build; no user credentials, Drive permissions, tokens, or new images are
included. It also includes `README-PARTNER-GUIDELINES.txt`. Samples use
illustrative/demo prospects, not actual sales outcomes. The screenshots
must not be presented as real customer metrics, guaranteed revenue, or proof
of unauthorized autonomous sends.

The welcome email template links to
`https://frameleads.io/affiliates#partner-proof-kit` once public signup is
approved and deployed. Additional approved screen-recording clips can be
integrated into the same resource section.

**Google Drive:** No verified "How it works" ZIP or Drive download URL was
available in the connected Drive at the time of implementation. Therefore
the website distributes the four already approved/public screenshot files
directly. A user-supplied Google Drive URL can be added later without
exposing a private Drive or substituting unreviewed images.

## MailerSend — current operational state

The application has transactional MailerSend send/queue code with recipient
verification, URL validation, strict provider response handling and mock tests.

**Known current configuration:**
- Owner's Vercel team: `frameleads`
- Project: `frameleads-landing`
- Domain: `frameleads.io`
- Domain registrar and authoritative DNS: **Vercel**, nameservers
  `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
- Existing Google Workspace SPF TXT at apex:
  `v=spf1 include:_spf.google.com ~all`
- Google DKIM and DMARC already configured
- Non-secret `AFFILIATE_MAIL_FROM=akram@frameleads.io` added to **Preview
  only**, branch `feat/whop-native-affiliate-preview-20261112`.
- **Missing**: connected MailerSend account, confirmed MailerSend sending
  domain, `AFFILIATE_MAILERSEND_API_KEY` secret, actual delivery proof.

**Account owner must do one provider step:**
1. Sign in to https://app.mailersend.com/ or create a MailerSend account.
2. Open **Email → Domains → Add domain** and add `frameleads.io`.
3. Select **manual DNS verification**. Capture the provider-generated
   SPF, two 2048-bit DKIM CNAMEs, and Return-Path CNAME (plus any additional
   verification record shown). The record names and public DNS values can be
   shared; **never share an API token or password**.
4. Once those exact public values are available, update Vercel DNS.
   **Merge** any MailerSend SPF requirement with the existing single Google
   SPF record. Never create a second SPF record, delete Google's DKIM,
   or replace Google MX.
5. Finish verification in MailerSend. Generate a sending API token in
   **Developer Tools → API Tokens**.
6. Store it directly as a **Sensitive** Vercel environment variable
   `AFFILIATE_MAILERSEND_API_KEY` with Preview target and **only**
   branch `feat/whop-native-affiliate-preview-20261112`. Never paste
   the token in PR, chat, logs, or commit history.
7. Rebuild the isolated Preview. Send one authorized email to the prior
   test recipient, confirm the provider's x-message-id, verify delivery in
   MailerSend's Email Activity, then independently confirm receipt in Gmail.

**Do not turn on Production affiliate registration or the security-approval
flag until durable rate limits/replay control, sender verification, delivery,
live signup consent, and independent security checks are completed.**

Provider docs:
- https://www.mailersend.com/help/how-to-verify-and-authenticate-a-sending-domain
- https://www.mailersend.com/help/managing-api-tokens
- https://developers.mailersend.com/api/v1/email
