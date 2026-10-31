"use client";

import { WhopElements, Checkout, CheckoutElement } from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { useEffect, useState } from "react";

/** The configuration is issued by Whop and encrypted into a server-owned cookie. */
export default function VerifiedAffiliateCheckout({
  checkoutConfigurationId, returnUrl, hostedFallback, environment,
}: { checkoutConfigurationId: string; returnUrl: string; hostedFallback: string;
  environment: "production" | "sandbox" }) {
  const [elements, setElements] = useState<ReturnType<typeof loadWhop> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    try { setElements(loadWhop()); } catch { setLoadFailed(true); }
  }, []);
  if (completed) return <div role="status" className="rounded-xl border p-6 text-sm text-[#1A1A1A]">
    <h2 className="text-xl font-semibold">Continue to FrameLeads</h2>
    <p className="mt-3">Whop completed the payment step. Sign in using the same Whop account so FrameLeads can verify your subscription.</p>
    <a href={returnUrl} className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white">Continue to FrameLeads login</a>
  </div>;
  if (loadFailed) return <div role="alert" className="rounded-xl border p-6 text-sm text-[#1A1A1A]">
    <h2 className="text-xl font-semibold">Secure payment is temporarily unavailable</h2>
    <p className="mt-3">Use the verified Whop checkout instead. Your eligible partner attribution remains attached to that checkout.</p>
    <a href={hostedFallback} rel="noreferrer" className="mt-5 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white">Continue securely with Whop</a>
  </div>;
  if (!elements) return <div role="status" className="p-8 text-sm text-[#666666]">Loading secure payment…</div>;
  return <WhopElements
    elements={elements} environment={environment}
    appearance={{ theme: { appearance: "light", accentColor: "orange" } }}
    onLoadError={() => setLoadFailed(true)}
  >
    <Checkout
      checkoutConfiguration={checkoutConfigurationId}
      returnUrl={returnUrl}
      onComplete={(completion) => { if (completion.result === "payment") setCompleted(true); }}
    >
      <CheckoutElement onError={() => setLoadFailed(true)}
        fallback={<div role="status" className="p-8 text-sm text-[#666666]">Loading Whop payment form…</div>} />
    </Checkout>
  </WhopElements>;
}
