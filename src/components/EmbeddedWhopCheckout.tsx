"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { useSyncExternalStore } from "react";
import { getPrivacyConsent, subscribePrivacyConsent } from "../privacy-consent";
import { referralCheckoutDecision } from "../checkout-embed-policy";

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

  const decision = referralCheckoutDecision({
    rawReferralPresent: referralHintPresent,
    advertisingConsent: consent?.advertising ?? null,
  });

  if (!hostedFallback) {
    return <section role="status" className="rounded-xl border border-[#E4E4E4] bg-[#F7F7F7] p-6 text-sm leading-relaxed text-[#444444]">
      <h2 className="text-lg font-semibold text-[#1A1A1A]">Sandbox checkout is not configured</h2>
      <p className="mt-3">This preview has no verified Sandbox checkout link. Payment checkout is unavailable until its Sandbox plan and return settings are configured.</p>
      {returnUrl && <p className="mt-3 text-xs text-[#666666]">Already purchased? <a className="underline underline-offset-4" href={returnUrl}>S¶»§q«^