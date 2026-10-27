import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const consent = fs.readFileSync(new URL('../src/components/PrivacyChoices.tsx', import.meta.url), 'utf8');
const checkout = fs.readFileSync(new URL('../src/components/EmbeddedWhopCheckout.tsx', import.meta.url), 'utf8');
const policy = fs.readFileSync(new URL('../src/checkout-embed-policy.ts', import.meta.url), 'utf8');

test('affiliate compensation disclosure is gated behind independent public privacy approval', () => {
  assert.match(consent, /NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED === "true"/);
  assert.match(consent, /affiliateNoticeApproved \?/);
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
  assert.match(policy, /if \(input\.rawReferralPresent\) return "hosted"/);
  assert.match(checkout, /referralHintPresent/);
  assert.match(checkout, /Continue with Whop hosted checkout/);
  assert.doesNotMatch(checkout, /data-whop-affiliate/);
});

test('checkout completion must not grant membership access or manufacture Purchase events', () => {
  assert.doesNotMatch(checkout, /grantEntitlement/);
  assert.doesNotMatch(checkout, /track\(\s*["']Purchase["']/);
  assert.match(checkout, /onComplete=/);
});
