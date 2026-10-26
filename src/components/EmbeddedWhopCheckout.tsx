"use client";

import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getMarketingAttribution } from "../marketing-events";
import { getPrivacyConsent, subscribePrivacyConsent } from "../privacy-consent";
import { observeMeasurement } from "../measurement";
import { hostedCheckoutWithAffiliate, referralCheckoutDecision, WHOP_EMBED_LOADER } from "../checkout-embed-policy";

/** Whop renders and processes payment fields; a return is never entitlement proof. */
export default function EmbeddedWhopCheckout({
  planId,
  returnUrl,
  hostedFallback,
  environment,
  referralHintPresent,
  embedEnabled,
}: {
  planId: string;
  returnUrl: string;
  hostedFallback: string;
  environment: "production" | "sandbox";
  referralHintPresent: boolean;
  embedEnabled: boolean;
}) {
  const consent = useSyncExternalStore(subscribePrivacyConsent, getPrivacyConsent, () => null);
  const consentVersion = consent?.savedAt ?? "undecided";
  const [referralScan, setReferralScan] = useState<{ version: string; code?: string } | null>(null);
  const [loaderFailed, setLoaderFailed] = useState(false);

  useEffect(() => {
    const code = consent?.advertising === true ? getMarketingAttribution().affiliateCode : undefined;
    setReferralScan({ version: consentVersion, code });
  }, [consentVersion, consent?.advertising]);

  const referralCode = referralScan?.version === consentVersion ? referralScan.code : undefined;
  const referralScanPending = (!referralScan || referralScan.version !== consentVersion)
    && (referralHintPresent || consent?.advertising === true);
  const decision = referralScanPending
    ? "pending"
    : referralCheckoutDecision({
        rawReferralPresent: referralHintPresent,
        advertisingConsent: consent?.advertising ?? null,
        storedReferralPresent: Boolean(referralCode),
      });

  useEffect(() => {
    if (decision === "allowed" && hostedFallback) observeMeasurement("CHECKOUT_CLICK");
  }, [decision, hostedFallback]);

  if (!hostedFallback) {
    return <section role="status" className="rounded-xl border border-[#E4E4E4] bg-[#F7F7F7] p-6 text-sm leading-relaxed text-[#444444]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Sandbox checkout is not configured</h2>
      <p className="mt-3">This preview has no verified Sandbox checkout link. Payment checkout is unavailable until its Sandbox plan and return settings are configured.</p>
      {returnUrl && <p className="mt-3 text-xs text-[#666666]">Already purchased? <a className="underline underline-offset-4" href={returnUrl}>Sign in to FrameLeads Preview</a></p>}
    </section>;
  }

  if (decision === "pending") {
    return <div role="status" aria-live="polite" className="min-h-[26rem] rounded-xl border border-[#E3E3E3] bg-[#F7F7F7] p-6 text-sm text-[#5C5C5C]">
      Preparing secure checkout…
    </div>;
  }

  if (decision === "hosted") {
    return <section role="status" className="rounded-xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/[0.06] p-6 text-sm leading-relaxed text-[#414141]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Continue with Whop hosted checkout</h2>
      {referralCode ? <>
        <p className="mt-3">Your advertising consent and approved referral are preserved on Whop&apos;s hosted checkout. Whop manages the payment and affiliate credit.</p>
        <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={hostedCheckoutWithAffiliate(hostedFallback, referralCode, consent?.advertising === true)} rel="noreferrer">Continue securely with Whop</a>
      </> : <>
        <p className="mt-3">Continue through Whop&apos;s hosted checkout. Existing consent choices are respected; no affiliate code is added unless it was saved with advertising consent.</p>
        <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={hostedFallback} rel="noreferrer">Continue securely with Whop</a>
      </>}
      {returnUrl && <p className="mt-4 text-xs">Already purchased? <a className="underline underline-offset-4" href={returnUrl}>Sign in to FrameLeads</a></p>}
    </section>;
  }

  if (!embedEnabled) {
    return <section role="status" className="rounded-xl border border-[#E4E4E4] bg-[#F7F7F7] p-6 text-sm leading-relaxed text-[#444444]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Continue securely with Whop</h2>
      <p className="mt-3">Whop will show the current price, billing interval, and payment terms before you confirm.</p>
      <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={hostedFallback} rel="noreferrer">Continue to Whop checkout</a>
      {returnUrl && <p className="mt-3 text-xs text-[#666666]">After purchase, <a className="underline underline-offset-4" href={returnUrl}>sign in to FrameLeads with Whop</a> to verify your access.</p>}
    </section>;
  }

  return <div className="min-w-0">
    {loaderFailed ? <div role="alert" className="rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] p-6 text-sm text-[#4C4C4C]">
      <p>The secure payment form could not load.</p>
      <a className="mt-4 inline-block font-semibold underline" href={hostedFallback} rel="noreferrer">Continue with Whop hosted checkout</a>
      {returnUrl && <p className="mt-3 text-xs text-[#666666]">Already purchased? <a className="underline underline-offset-4" href={returnUrl}>Sign in to FrameLeads</a></p>}
    </div> : <>
      <Script src={WHOP_EMBED_LOADER} strategy="afterInteractive" onError={() => setLoaderFailed(true)} />
      <div
        className="whop-checkout-embed min-h-[34rem] w-full"
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-environment={environment}
        data-whop-checkout-theme="light"
        data-whop-checkout-theme-accent-color="orange"
        data-whop-checkout-return-url={returnUrl}
      />
    </>}
  </div>;
}
