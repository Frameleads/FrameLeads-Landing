import Image from "next/image";
import { tierInformation, type CheckoutTier } from "../checkout-embed-policy";

type Props = { tier: CheckoutTier; termsVerified: boolean };

const descriptions: Record<CheckoutTier, string> = {
  "micro-pilot": "A one-time offer capped at 25 total prospects, with existing Micro-Pilot access and feature limits.",
  core: "Reply decision intelligence for outbound teams.",
  enterprise: "Revenue decision intelligence for higher-volume outbound.",
};

/**
 * Checkout confirmation, not a second sales page.
 * Amounts remain published reference prices until reconciled with Whop.
 * Never fabricate the payable total or collect promo/payment details here.
 */
export default function CheckoutOrderSummary({ tier, termsVerified }: Props) {
  const details = tierInformation(tier);

  return (
    <section
      aria-labelledby="order-heading"
      className="min-w-0 bg-[#242424] px-5 py-7 text-white sm:px-8 sm:py-10 lg:px-12 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[460px]">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#888888] bg-[#242424]">
            {/* Match the SaaS-header bolt proportions; preserve the 44px checkout badge. */}
            <Image src="/logo.png" alt="" width={47} height={47} className="h-[47px] w-[47px] max-w-none shrink-0 object-contain" priority />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-5 text-white">FrameLeads</p>
            <p className="text-xs leading-5 text-[#B8B8B8]">by BrandFlow Studio</p>
          </div>
        </div>

        <h1 id="order-heading" className="mt-7 font-heading text-[25px] font-semibold leading-tight tracking-tight sm:text-[26px] lg:text-[28px]">
          {details.title}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-[1.5] text-[#B8B8B8]">
          {descriptions[tier]}
        </p>

        <div className="mt-7 flex flex-wrap items-baseline gap-2" aria-label="Current website reference price">
          <span className="font-heading text-[34px] font-semibold leading-none tracking-tight sm:text-[42px]">
            {details.displayedPrice}
          </span>
          <span className="text-sm text-[#B8B8B8]">{details.billingInterval === "one-time" ? "one-time" : "/ month"}</span>
        </div>
        {details.usageLabel && <p className="mt-3 text-sm text-[#B8B8B8]">{details.usageLabel}</p>}
        <div className="mt-5 border-t border-white/[0.12] pt-4">
          <p className="text-xs text-[#B8B8B8]">{termsVerified ? "Whop confirms the displayed offer terms." : "Current website reference. Whop shows the current price and billing terms before you pay."}</p>
        </div>
      </div>
    </section>
  );
}
