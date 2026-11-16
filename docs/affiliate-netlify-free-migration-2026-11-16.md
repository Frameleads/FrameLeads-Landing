# FrameLeads affiliate — no-charge Netlify hosting migration runbook (16 Nov 2026)

## Purpose and release scope

Netlify Free permits commercial projects, unlike the currently connected Vercel Hobby plan. This is a **readiness plan only**, not a completed Netlify deployment. The existing live FrameLeads site stays on Vercel until a working, reviewed copy has passed full regressions and an explicitly approved DNS cutover. Do not create a paid Netlify account, purchase credits, authorize auto-recharge, switch DNS, or change Whop charges.

Official sources:
- https://www.netlify.com/blog/introducing-netlify-free-plan/ (expressly permits commercial projects)
- https://www.netlify.com/pricing/ (Free $0, 300 credits per month, hard pause at cap)
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/ (Next.js 13.5+ App Router and route handlers via OpenNext)
- https://docs.netlify.com/build/functions/environment-variables/ (Netlify build metadata such as CONTEXT is NOT automatically available in serverless runtime)

## Before migrating

1. The owner must create/link a Netlify Free account and grant GitHub repo access to `Frameleads/FrameLeads-Landing`. **No Netlify connector is presently linked to ChatGPT**, so Netlify account creation and deployment cannot be executed from the connected Vercel tool.
2. Deploy only the current feature branch `feat/whop-native-affiliate-preview-20261112` as a **nonpublic test**, where possible, and verify its build and application routes. Do not point `frameleads.io` at Netlify.
3. Netlify automatically detects Next.js and uses its OpenNext adapter. Use the repo root and `npm run build`; do not add an old `next export` step or a guessed `publish` directory. Review the installed Next.js version and full site build first.
4. Only copy non-secret configuration from Vercel after comparing scope. **Vercel's Sensitive credentials cannot be read back**; transfer or rotate Whop, Resend and Cloudflare keys privately using secure dashboards. Never paste keys into chat, GitHub, build logs, or `netlify.toml`. Use Netlify dashboard environment variables and mark sensitive values appropriately.
5. Keep both `AFFILIATE_NATIVE_REGISTRATION_ENABLED=false` and `AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED=false` in all contexts until after DNS cutover, legal and security approval. The partner form should read “Applications opening soon.” Sensitive variables should be Production-context only, not available to public fork previews.
6. The Netlify Free plan pauses all sites on a team at its monthly credit cap; 300 credits is a total limit, not a guarantee of traffic. Keep auto-recharge off; verify Netlify quotas, function limits and outbound requests, and monitor usage.

## Runtime environment mapping (no secret values)

The native affiliate route accepts **two** different platform gates:

- **Existing Vercel:** `VERCEL_ENV=production`, and the two independent public-registration switches set to `true`.
- **Netlify:** `AFFILIATE_HOSTING_ENV=netlify-production` **only in Netlify's Production deployment context**, with Netlify's immutable runtime `URL=https://frameleads.io`, no `VERCEL_ENV` override, and the same two independent switches set to `true`.
- **Netlify pre-release preview (optional):** `AFFILIATE_HOSTING_ENV=netlify-preview` for preview contexts, which **never contacts Whop/Resend**; otherwise the form is disabled.
- Whop/Resend/Turnstile should have independent Production-only keys and the pinned plan/sender values, exactly as reviewed in Vercel. Do not set fake `VERCEL_ENV` in Netlify; that risks changing unrelated app behavior.
- Both live routes independently reject hosts other than canonical HTTPS `frameleads.io`, regardless of environment configuration. Server Turnstile validates the exact `frameleads.io` hostname and `affiliate_signup` action; confirmation links use `https://frameleads.io`.
- `URL` is Netlify's read-only main site URL available at runtime, and must equal `https://frameleads.io` for native signup. Until after the domain is configured on Netlify, the affiliate live gate stays closed. If the provider uses a different canonical URL shape, inspect it before attempting the release; never relax checks blindly.

## Test matrix before touching DNS

- Verify homepage, Footer “Affiliate program · Earn 30%” link and neutral legal identity wording, `/affiliates` and downloadable 23-screenshot ZIP, responsive display, and Vercel-to-Netlify differences in rendering.
- Verify the *entire existing website*, including Audit, receipt/checkout links, Whop redirects, privacy preferences, first-party analytics and Meta/TikTok consent, feedback, and any use of `VERCEL_ENV`, `VERCEL_URL`, Vercel edge/config or serverless behavior. Do not assume Next.js compatibility implies product integration compatibility.
- With launch switches OFF, verify POST `/api/affiliates/apply` and `/api/affiliates/confirm` fail with `503 NOT_LIVE` and no email, Whop or commission changes.
- New Production Whop API key has not yet been validated with real GET permissions; perform a **credentialed read-only** probe with encrypted transport, no affiliate creation, only when an authenticated safe runtime becomes available.
- Verify Resend domain/sender separately. Then check Cloudflare hostname/action on real hosting and review abuse/WAF coverage; Netlify firewall rules are not Vercel firewall rules.
- Evaluate non-atomic email-token replay risk and decide whether durable single-use tracking is required. Current existing Whop reward read-back and Resend idempotency are partial mitigations, not full at-most-once processing.
- Review and approve operator identity/Privacy Policy/Terms for actual business and third-party processing. User approval of direction does not itself establish verified legal status.
- Final approved domain cutover only after the full-site tests pass, with an explicitly authorized rollback plan, monitoring and public-traffic protection. Do not claim LIVE until actual Production smoke tests succeed.

## Existing project references

- GitHub PR #43: https://github.com/Frameleads/FrameLeads-Landing/pull/43
- Detailed affiliate legal/security packet: `docs/affiliate-final-approval-packet-2026-11-16.md`
- Existing Vercel Preview is independent of the commercial hosting migration. No hosting provider or DNS has been changed by this runbook.
