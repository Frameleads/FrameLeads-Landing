"use client";

import { WhopElements, Checkout, CheckoutElement } from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getPrivacyConsent, subscribePrivacyConsent } from "../privacy-consent";
import { referralCheckoutDecision } from "../checkout-embed-policy";

// Whop hosts every payment field. Raw card data must never reach FrameLeads.
// Never initialize Whop payment Elements while Next.js renders on the server.
// Its browser-only loader must start after hydration in an explicitly enabled checkout.

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
  const [elementsUnavailable, setElementsUnavailable] = useState(false);
  const [whopElements, setWhopElements] = useState<ReturnType<typeof loadWhop> | null>(null);

  useEffect(() => {
    // Disabled checkouts, referrals routed to hosted checkout and server-side
    // renders must never initialize third-party payment elements.
    if (!embedEnabled || !hostedFallback || referralHintPresent) return;
    try {
      setWhopElements(loadWhop());
    } catch {
      setElementsUnavailable(true);
    }
  }, [embedEnabled, hostedFallback, referralHintPresent]);
  const [checkoutFinished, setCheckoutFinished] = useState(false);
  const consent = useSyncExternalStore(subscribePrivacyConsent, getPrivacyConsent, () => null);

  const decision = referralCheckoutDecision({
    rawReferralPresent: referralHintPresent,
    advertisingConsent: consent?.advertising ?? null,
  });

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
      <p className="mt-3">Continue through Whop&apos;s hosted checkout. Existing consent choices are respected, and referral data from the page URL is not forwarded.</p>
      <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={hostedFallback} rel="noreferrer">Continue securely with Whop</a>
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

  // The SDK completion event is not the authority for payment or entitlement.
  // Keep the post-checkout handoff within the correct Whop environment. A new
  // buyer may still need to verify their Whop account before OAuth succeeds.
  if (checkoutFinished) {
    return <section role="status" aria-live="polite" className="rounded-xl border border-[#E4E4E4] bg-[#F7F7F7] p-6 text-sm leading-relaxed text-[#444444]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Continue to FrameLeads</h2>
      <p className="mt-3">Whop has completed the checkout step. Sign in with the same Whop account to verify your membership and open your workspace.</p>
      <p className="mt-2 text-xs text-[#666666]">If Whop asks you to verify your email or finish setting up your account, complete that step before signing in.</p>
      <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={returnUrl}>Continue to FrameLeads</a>
    </section>;
  }

  if (elementsUnavailable) {
    return <section role="alert" className="rounded-xl border border-[#E4E4E4] bg-[#F7F7F7] p-6 text-sm text-[#444444]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Secure payment is temporarily unavailable</h2>
      <p className="mt-3">The protected payment form could not load. No payment has been submitted.</p>
      <a className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white" href={hostedFallback} rel="noreferrer">
        Continue securely with Whop
      </a>
    </section>;
  }

  if (!whopElements) {
    return <div role="status" className="p-8 text-sm text-[#666666]">Loading secure Whop payment options…</div>;
  }

  return <div className="min-w-0">
    <WhopElements
      elements={whopElements}
      environment={environment}
      appearance={{
        theme: { appearance: "light", accentColor: "orange" },
        classes: {
          // The Whop-owned frame cannot inherit next/font/local.
          // Use a bundled Whop font for branded typography on summary
          // and action elements, without touching protected payment fields.
          "whop-CheckoutSeller": { fontFamily: "'Acid Grotesk', sans-serif", letterSpacing: "-0.01em" },
          "whop-CheckoutItem": { fontFamily: "'Acid Grotesk', sans-serif", letterSpacing: "-0.015em" },
          "whop-CheckoutPrice": { fontFamily: "'Acid Grotesk', sans-serif", letterSpacing: "-0.02em" },
          "whop-CheckoutTotal": { fontFamily: "'Acid Grotesk', sans-serif", letterSpacing: "-0.02em" },
          "whop-CheckoutPayButton": { fontFamily: "'Acid Grotesk', sans-serif", letterSpacing: "0.01em" },
        },
      }}
      onLoadError={() => setElementsUnavailable(true)}
    >
      <Checkout
        plan={planId}
        returnUrl={returnUrl}
        onComplete={(completion) => {
          if (completion.result === "payment" && returnUrl) {
            // Do not grant access or create Purchase events from this callback.
            setCheckoutFinished(true);
          }
        }}
      >
        <CheckoutElement
          onError={() => setElementsUnavailable(true)}
          fallback={<div role="status" className="p-8 text-sm text-[#666666]">Loading secure Whop payment options…</div>}
        />
      </Checkout>
    </WhopElements>
  </div>;
}
