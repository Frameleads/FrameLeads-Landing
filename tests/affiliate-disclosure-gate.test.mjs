import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const consent = fs.readFileSync(new URL('../src/components/PrivacyChoices.tsx', import.meta.url), 'utf8');
const checkout = fs.readFileSync(new URL('../src/components/EmbeddedWhopCheckout.tsx', import.meta.url), 'utf8');
const policy = fs.readFileSync(new URL('../src/checkout-embed-policy.ts', import.meta.url), 'utf8');

test('affiliate compensation disclosure is gated behind independent public privacy approval', () => {
  assert.match(consent, /NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"/);
  assert.match(consent, /partnerPurposeAvailable && <label/);
  assert.match(consent, /checked=\{partnerReferral\}/);
  assert.doesNotMatch(consent, /disabled=\{!advertising\}/);
  assert.match(consent, /partnerPurposeAvailable && partnerReferral \? "accept" : "decline"/);
  assert.doesNotMatch(consent, />Accept optional<\/button>/);
  assert.match(consent, />Accept analytics &amp; advertising<\/button>/);
  assert.match(consent, /SANDBOX_AFFILIATE_NOTICE_DETAILS/);
  assert.match(consent, /SANDBOX_AFFILIATE_NOTICE_CHECKBOX/);
  assert.match(consent, /Advertising and conversion measurement/);
});

test('approved Sandbox notice text is immutable without a matching reviewed SHA-256', async () => {
  const { createHash } = await import('node:crypto');
  const notice = await import('../src/affiliate-notice.ts');
  const sha = createHash('sha256').update(notice.SANDBOX_AFFILIATE_NOTICE_CANONICAL, 'utf8').digest('hex');
  assert.equal(sha, notice.SANDBOX_AFFILIATE_NOTICE_SHA256);
  assert.match(notice.SANDBOX_AFFILIATE_NOTICE_DETAILS, /separate from analytics and advertising/);
  assert.match(notice.SANDBOX_AFFILIATE_NOTICE_DETAILS, /Whop/);
  assert.match(notice.SANDBOX_AFFILIATE_NOTICE_DETAILS, /withdraw your consent/);
  assert.match(notice.SANDBOX_AFFILIATE_NOTICE_CHECKBOX, /up to 30 days/);
});

test('staged privacy copy does not itself send affiliate code or emit Whop purchases', () => {
  assert.doesNotMatch(consent, /data-whop-affiliate/);
  assert.doesNotMatch(consent, /affiliate_code/);
  assert.doesNotMatch(consent, /track\(\s*["']Purchase["']/);
  assert.match(consent, /<WhopAnalytics enabled=\{consent\?\.advertising === true\}/);
});

test('server acknowledgement is required before browser stores partner acceptance', () => {
  assert.match(consent, /if \(!await request\(\{ action: "accept", affiliateCode: code \}\)\)/);
  assert.match(consent, /setPartnerConsentError\("Partner attribution could not be confirmed/);
  assert.match(consent, /savePrivacyConsent\(next, wantsPartner \? "accept" : "decline"\)/);
  assert.match(consent, /pendingServerWithdrawal/);
  assert.match(consent, /action: "withdraw"/);
  assert.match(checkout, /body: JSON\.stringify\(\{ plan: "CORE" \}\)/);
  assert.doesNotMatch(checkout, /body: JSON\.stringify\(\{[^}]*affiliateCode/);
});

test('current native checkout keeps raw affiliate parameter out of payment elements', () => {
  assert.match(policy, /if \(input\.affiliateConsent === true\) return "await_verified"/);
  assert.match(checkout, /decision === "await_verified"/);
  assert.match(checkout, /Partner-linked checkout needs verification/);
  assert.match(checkout, /referralHintPresent/);
  assert.match(checkout, /Continue with Whop hosted checkout/);
  assert.doesNotMatch(checkout, /data-whop-affiliate/);
});

test('checkout completion must not grant membership access or manufacture Purchase events', () => {
  assert.doesNotMatch(checkout, /grantEntitlement/);
  assert.doesNotMatch(checkout, /track\(\s*["']Purchase["']/);
  assert.match(checkout, /onComplete=/);
});

test('operator identification uses approved individual rather than unsupported registered-company claim', () => {
  const privacy = fs.readFileSync(new URL('../src/app/privacy/page.tsx', import.meta.url), 'utf8');
  assert.match(privacy, /operated by Akram Walid, based in the United Arab Emirates/);
  assert.doesNotMatch(privacy, /BrandFlow Studio is a registered company/i);
});
