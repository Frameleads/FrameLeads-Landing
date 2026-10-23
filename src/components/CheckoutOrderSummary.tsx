import Image from "next/image";
import { tierInformation, type CheckoutTier } from "../checkout-embed-policy";

type Props = { tier: CheckoutTier; sandboxPreview: boolean };

const descriptions: Record<CheckoutTier, string> = {
  core: "Reply decision intelligence for outbound teams.",
  enterprise: "Revenue decision intelligence for higher-volume outbound.",
};

/**
 * Checkout confirmation, not a second sales page.
 * Amounts remain published reference prices until reconciled with Whop.
 * Never fabricate the payable total or collect promo/payment details here.
 */
export default function CheckoutOrderSummary({ tier, sandboxPreview }: Props) {
  const details = tierInformation(tier);

  return (
    <section
      aria-labelledby="order-heading"
      className="min-w-0 bg-[#242424] px-5 py-7 text-white sm:px-8 sm:py-10 lg:px-12 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[460px]">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" priority />
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

        <div className="mt-7 flex flex-wrap items-baseline gap-2" aria-label="Published subscription price">
          <span className="font-heading text-[34px] font-semibold leading-none tracking-tight sm:text-[42px]">
            {details.displayedPrice}
          </span>
          <span className="text-sm text-[#B8B8B8]">/ month</span>
        </div>
        <div className="mt-5 border-t border-white/[0.12] pt-4">
          <p className="text-xs text-[#B8B8B8]">Billed monthly</p>
          {sandboxPreview ? (
            <p className="mt-2 text-xs leading-5 text-[#B8B8B8]">
              Sandbox preview: the price above is a published reference. Whop shows the actual test charge.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
