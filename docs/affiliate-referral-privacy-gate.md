# Affiliate referral privacy gate

## Decision for this release candidate

The available privacy policy describes optional advertising measurement and consent controls. It does not establish that affiliate compensation attribution has a separate legal basis or a distinct published disclosure. We therefore do not reinterpret advertising consent as approval for compensation attribution.

Affiliate code capture remains subject to advertising consent and an additional explicit privacy approval gate. The gate is disabled unless `AFFILIATE_REFERRAL_PRIVACY_APPROVED=true` is configured in both Landing and Brand Brain; browser capture also requires `NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED=true`. Existing unrelated ad measurement continues under its current consent rules. The checkout continuation and affiliate checkout feature flags also remain off by default.

This configuration is a technical kill switch, not a legal determination. Before setting it, privacy counsel or the responsible policy owner must confirm the purpose, lawful basis, retention and published notice, and approve wording for visitors who decline advertising consent. This release does not collect affiliate evidence from non-consenting visitors.

Tests cover approved and unapproved privacy-gate configurations with advertising consent, plus non-consenting visitors. No capture path bypasses advertising consent.

## Build font assets

Build-time probes on 2026-10-21 returned HTTP 200 for the Google Fonts CSS API
at `fonts.googleapis.com`, while requests for font binaries at
`fonts.gstatic.com` failed with HTTP 403 from the cloud environment's CONNECT
tunnel. This is external font-binary egress blocking, not a TypeScript or
application-module defect. The build now bundles pinned Fontsource variable
assets for the same Space Grotesk, Oxanium, and JetBrains Mono families, so
builds do not depend on Google Fonts host access and runtime typography remains
first-party.
