import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const consent = fs.readFileSync(new URL('../src/components/PrivacyChoices.tsx', import.meta.url), 'utf8');
const checkout = fs.readFileSync(new URL('../src/components/EmbeddedWhopCheckout.tsx', import.meta.url), 'utf8');
const policy = fs.readFileSync(new URL('../src/checkout-embed-policy.ts', import.meta.url), 'utf8');

test('affiliate compensation disclosure is gated behind independent public privacy approval', () => {
  assert.match(consent, /NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"/);
  assert.match(consent, /partnerPurposeAvailable && <label/);
  assert.match(consent, /checked=\{partnerReferral && advertising\}/);
  assert.match(consent, /partnerPurposeAvailable && advertising && partnerReferral \? "accept" : "decline"/);
  assert.doesNotMatch(consent, />Accept optional<\/button>/);
  assert.match(consent, />Accept analytics &amp; advertising<\/button>/);
  assert.match(consent, /partner earns a commission/);
  assert.match(consent, /Audit and normal checkout work if you decline/);
  assert.match(consent, /Advertising and conversion measurement/);
});

test('staged privacy copy does not itself send affiliate code or emit Whop purchases', () => {
  assert.doesNotMatch(consent, /data-whop-affiliate/);
  assert.doesNotMatch(consent, /affiliate_code/);
  assert.doesNotMatch(consent, /track\(\s*["']Purchase["']/);
  assert.match(consent, /<WhopAnalytics enabled=\{consent\?\.advertising === true\}/);
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
