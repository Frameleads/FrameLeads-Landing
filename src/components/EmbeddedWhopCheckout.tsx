"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getMarketingAttribution } from "../marketing-events";
import { getPrivacyConsent } from "../privacy-consent";
import { observeMeasurement } from "../measurement";
import { WHOP_EMBED_LOADER } from "../checkout-embed-policy";

/**
 * Payment fields are exclusively rendered by Whop. We never accept card data,
 * set a browser-derived affiliate id or synthesize success/purchase events.
 */
export default function EmbeddedWhopCheckout({
  planId,
  returnUrl,
}: {
  planId: string;
  returnUrl: string;
}) {
  const [referralReviewRequired, setReferralReviewRequired] = useState<boolean | null>(null);
  const [loaderFailed, setLoaderFailed] = useState(false);

  useEffect(() => {
    // This is not a provider-verified referral. Never inject its code into the embed.
    // Until the server-side consent-proof and affiliate-eligibility contract ships,
    // protect a consented referral from being silently counted as a direct sale.
    const consent = getPrivacyConsent();
    const observed = consent?.advertising === true ? getMarketingAttribution().affiliateCode : undefined;
    setReferralReviewRequired(Boolean(observed));
  }, []);

  useEffect(() => {
    if (referralReviewRequired === false) observeMeasurement("CHECKOUT_INITIATED");
  }, [referralReviewRequired]);

  if (referralReviewRequired === null) {
    return <div role="status" aria-live="polite" className="min-h-[26rem] rounded-xl border border-white/10 bg-[#202020] p-6 text-sm text-white/60">Preparing secure checkout…</div>;
  }

  if (referralReviewRequired) {
    return <section role="status" className="rounded-xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/[0.06] p-6 text-sm leading-relaxed text-white/80">
      <h2 className="text-lg font-semibold text-white">Referral verification is required</h2>
      <p className="mt-3">We found a previously consented referral. To avoid losing eligible affiliate credit, this payment cannot proceed through the unverified embedded path. Continue through your verified Audit link when that feature becomes available, or contact support for assistance.</p>
      <a className="mt-4 inline-block underline decoration-[#FF5A1F] underline-offset-4" href="mailto:akram@frameleads.io">Contact FrameLeads support</a>
    </section>;
  }

  return <div className="min-w-0">
    {loaderFailed ? <div role="alert" className="rounded-xl border border-white/15 bg-[#242424] p-6 text-sm text-white/75">
      The secure payment form could not load. Refresh the page or contact support. No alternative production checkout is exposed from this Sandbox preview.
    </div> : <>
      <Script src={WHOP_EMBED_LOADER} strategy="afterInteractive" onError={() => setLoaderFailed(true)} />
      <div
        className="whop-checkout-embed min-h-[34rem] w-full"
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="dark"
        data-whop-color-scheme="dark"
        data-whop-color="#FF5A1F"
        data-whop-checkout-return-url={returnUrl}
      />
    </>}
    <p className="mt-4 text-center text-xs leading-relaxed text-white/50">Secure payment fields are provided by Whop. Your final charge and available payment methods are shown in Whop's checkout.</p>
  </div>;
}
