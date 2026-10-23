"use client";

import { useEffect } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { observeMeasurement } from "../measurement";

/**
 * Only accepts Whop checkout configuration IDs issued and recorded server-side
 * by Brand Brain, then transported through a signed HttpOnly host-only cookie.
 * Never accept a public query parameter, plan ID, referral code, or payment
 * status as a checkout session or proof of a purchase.
 */
export default function VerifiedWhopSessionCheckout({
  sessionId,
  returnUrl,
}: {
  sessionId: string;
  returnUrl: string;
}) {
  useEffect(() => {
    // First-party checkout-start observation remains subject to existing
    // measurement consent policy. Never emit a Purchase from browser state.
    observeMeasurement("CHECKOUT_INITIATED");
  }, []);

  return (
    <div className="min-w-0" data-frameleads-verified-whop-session="sandbox">
      <WhopCheckoutEmbed
        sessionId={sessionId}
        returnUrl={returnUrl}
        environment="sandbox"
        theme="light"
        fallback={
          <div
            role="status"
            aria-live="polite"
            className="h-[560px] w-full animate-pulse rounded-lg bg-[#F5F5F5]"
          >
            <span className="sr-only">Loading secure Whop Sandbox checkout</span>
          </div>
        }
      />
    </div>
  );
}
