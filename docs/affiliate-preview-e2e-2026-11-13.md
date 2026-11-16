# Protected affiliate signup E2E — 2026-11-13

## Scope and status

Implemented on Draft Landing PR #43, branch
`feat/whop-native-affiliate-preview-20261112`.

The prior Preview used simulation-only mode and could never send a confirmation email. This branch now supports a **separate protected Preview E2E mode** for one owner-approved email address. It invokes real Resend for email confirmation, and only after that token is confirmed uses the previously validated real Whop merchant API to read or create the affiliate, verify 30% recurring Core and Enterprise overrides and request provider-generated links, then queues the Resend welcome email.

**Do not confuse CI success with deployment success.** As of this checkpoint, source tests and Next.js build pass but no Preview deployment at this new head has been verified READY. Vercel returned HTTP 402 `api-deployments-free-per-day` (more than 100 free API deployments in 24 hours) on an attempted deployment. No workaround, billing upgrade, or Production release is authorized.

## Preview-only security controls

- Vercel project `frameleads-landing` already enables Vercel Authentication for generated `.vercel.app` Preview URLs; Production custom domain remains outside this scope.
- Exactly one branch and `VERCEL_ENV=preview` can switch to `preview_e2e`, and only with branch-specific `AFFILIATE_PREVIEW_E2E_ENABLED=true`. All other previews remain dry-run.
- `AFFILIATE_NATIVE_REGISTRATION_ENABLED` and `AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED` must **not** be `true` for Preview E2E. Production continues to require both to be explicitly `true`; neither is enabled.
- A server-only SHA-256 allowlist of one authorized test email is stored as Sensitive `AFFILIATE_PREVIEW_ALLOWED_EMAIL_SHA256` in the exact Preview branch; address not committed or printed. Both form and confirmation enforce it.
- A separate 256-bit `AFFILIATE_EMAIL_TOKEN_KEY` (Sensitive, Preview branch only) encrypts AES-256-GCM verification tokens. They expire after 20 minutes and are bound to the issuing environment `preview_e2e` versus `live`.
- Confirmation emails contain the current approved `frameleads-landing-*.vercel.app` origin; not Production. URL is strictly host-checked, with fragment token kept out of the HTTP request URL.
- Honeypot, same-origin checks and a per-instance throttling guard remain. A distributed rate limiter / durable one-time nonce ledger is **still required before public Production launch**. No attempt to present the in-memory limiter as production-grade security.
- Only a verified click triggers Whop writes. The Whop API preserves existing override idempotence, checks exact merchant ownership, prices and `all_payments` 30% commission before reporting success.
- Welcome emails use a deterministic Resend `Idempotency-Key` derived from the confirmation token so repeated clicks within Resend's 24h deduplication window should not resend the same welcome.
- The user's original email remains owned by Resend and Whop only for verification/affiliate onboarding. No raw recipient addresses, confirmation tokens, provider links or API keys go to logs or frontend JSON.

## Verification

GitHub Actions `Whop-native affiliate signup (Preview only)` passed on commit `fa078ece1fae985d44016c37e4a3924d0a76cbff`. Mock E2E test:
  * rejects a non-allowlisted applicant, with no Resend or Whop calls;
  * accepts the single allowed applicant and queues the verification email;
  * verifies that the callback URL uses the protected Preview host;
  * confirms the encrypted token, reads the two exact production-merchant plans, creates/reuses the affiliate, creates/verifies two 30% `all_payments` overrides and links;
  * sends the welcome email through Resend with a per-token idempotency key;
  * tests repeated confirmation without extra reward records, and a malformed token rejection.

These are **mock provider tests**, not evidence of actual browser E2E on this commit.

## Next runbook

After Vercel permits a new Preview deployment, deploy the exact tested SHA `fa078...` (or the current PR head if reviewed and retested). Before inviting the recipient, verify generated URL is READY and protected by Vercel Authentication; check that `/affiliates` says **Protected Preview test**, not **Preview test only**. Then submit the previously approved recipient through that authenticated page, confirm the actual Resend verification email and 20-minute link, click **Confirm and join**, and verify the final email and the two custom 30%-recurring Whop links. **Do not submit arbitrary addresses or run a purchase in this flow.**

Before a public launch: independent security review, distributed anti-abuse and replay ledger, legal policy, real end-to-end evidence, and an explicit Production activation approval.
