"use client";

import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getMarketingAttribution } from "../marketing-events";
import { getPrivacyConsent, subscribePrivacyConsent } from "../privacy-consent";
import { observeMeasurement } from "../measurement";
import { referralCheckoutDecision, WHOP_EMBED_LOADER } from "../checkout-embed-policy";

/**
 * Whop exclusively renders and processes payment fields.
 * Never pass browser-derived affiliate evidence, claim a purchase, or grant access.
 */
export default function EmbeddedWhopCheckout({
  planId,
  returnUrl,
  referralHintPresent,
}: {
  planId: string;
  returnUrl: string;
  referralHintPresent: boolean;
}) {
  const consent = useSyncExternalStore(subscribePrivacyConsent, getPrivacyConsent, () => null);
  const consentVersion = consent?.savedAt ?? "undecided";
  const [referralScan, setReferralScan] = useState<{ version: string; stored: boolean } | null>(null);
  const [loaderFailed, setLoaderFailed] = useState(false);

  useEffect(() => {
    // Only inspect already-consented attribution, never manufacture commission
    // evidence from raw URL parameters. Scanning is repeated after consent changes.
    const stored = consent?.advertising === true && Boolean(getMarketingAttribution().affiliateCode);
    setReferralScan({ version: consentVersion, stored });
  }, [consentVersion, consent?.advertising]);

  const decision = !referralScan || referralScan.version !== consentVersion
    ? "pending"
    : referralCheckoutDecision({
        rawReferralPresent: referralHintPresent,
        advertisingConsent: consent?.advertising ?? null,
        storedReferralPresent: referralScan.stored,
      });

  useEffect(() => {
    if (decision === "allowed") observeMeasurement("CHECKOUT_INITIATED");
  }, [decision]);

  if (decision === "pending") {
    return <div role="status" aria-live="polite" className="min-h-[26rem] rounded-xl border border-[#E3E3E3] bg-[#F7F7F7] p-6 text-sm text-[#5C5C5C]">
      {referralHintPresent && consent === null ? "Choose your optional privacy settings to continue." : "Preparing secure checkout…"}
    </div>;
  }

  if (decision === "review") {
    return <section role="status" className="rounded-xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/[0.06] p-6 text-sm leading-relaxed text-[#414141]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Referral verification is required</h2>
      <p className="mt-3">Your consented referral needs verification before payment so eligible affiliate credit is not lost. The unfinished affiliate pathway is disabled in this preview. Contact FrameLeads support, or use a verified Audit continuation once it is approved.</p>
      <a className="mt-4 inline-block underline decoration-[#FF5A1F] underline-offset-4" href="mailto:akram@frameleads.io">Contact FrameLeads support</a>
    </section>;
  }

  return <div className="min-w-0">
    {loaderFailed ? <div role="alert" className="rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] p-6 text-sm text-[#4C4C4C]">
      The secure payment form could not load. Refresh the page or contact support. No production checkout is exposed from this Sandbox preview.
    </div> : <>
      <Script src={WHOP_EMBED_LOADER} strategy="afterInteractive" onError={() => setLoaderFailed(true)} />
      <div
        className="whop-checkout-embed min-h-[34rem] w-full"
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-environment="sandbox"
        data-whop-checkout-theme="light"
        data-whop-checkout-theme-accent-color="orange"
        data-whop-checkout-return-url={returnUrl}
      />
    </>}
    <p className="mt-4 text-center text-xs leading-relaxed text-[#666666]">Secure payment fields are provided by Whop. Your final charge and available payment methods are shown in Whop's checkout.</p>
  </div>;
}
