import Link from "next/link";
import { tierInformation, type CheckoutTier } from "../checkout-embed-policy";

type Props = { tier: CheckoutTier; sandboxPreview: boolean };

function BenefitList({ items }: { items: readonly string[] }) {
  return <ul className="mt-4 space-y-3">
    {items.map(item => <li className="flex items-start gap-3 text-sm leading-relaxed text-[#DDDDDD]" key={item}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 font-semibold text-[#FF5A1F]">✓</span>
      <span>{item}</span>
    </li>)}
  </ul>;
}

/**
 * Display-only order summary: Whop owns actual price, promotions, tax and payment.
 * Never present these production reference amounts as the Sandbox amount due.
 */
export default function CheckoutOrderSummary({ tier, sandboxPreview }: Props) {
  const details = tierInformation(tier);

  return <section aria-labelledby="order-heading" className="min-w-0 bg-[#1A1A1A] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-12 lg:py-14">
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="h-4 w-[3px] rounded-full bg-[#FF5A1F]" />
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF5A1F]">Your subscription</p>
    </div>
    <h1 id="order-heading" className="mt-5 font-heading text-[26px] font-bold leading-[1.16] tracking-tight sm:text-3xl lg:text-[34px]">{details.title}</h1>
    <p className="mt-3 max-w-lg text-sm leading-6 text-[#B6B6B6]">{details.description}</p>

    <div className="mt-7" aria-label="Published plan price">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#AFAFAF]">Published production price</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="font-heading text-[36px] font-bold leading-none tracking-tight sm:text-[46px]">{details.displayedPrice}</span>
        <span className="font-mono text-sm text-[#CCCCCC]">/ month</span>
      </div>
      {sandboxPreview
        ? <p className="mt-3 text-xs leading-5 text-[#BEBEBE]"><span className="mr-2 inline-block rounded border border-[#FF5A1F]/40 px-2 py-0.5 font-mono text-[10px] text-[#FF5A1F]">SANDBOX</span>This is the published production reference, not the test charge. Whop determines the actual Sandbox amount.</p>
        : <p className="mt-3 text-xs leading-5 text-[#BEBEBE]">Reference price only. Whop confirms actual charges, discounts, taxes, and currency before payment.</p>}
    </div>

    <div className="mt-7 rounded-xl border border-white/[0.09] bg-[#242424] p-5 sm:p-6" aria-label="Order summary">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h2 className="text-base font-semibold">Your order</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#B5B5B5]">Monthly</span>
      </div>
      <dl className="mt-4 space-y-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[#D0D0D0]">{details.title}</dt>
          <dd className="shrink-0 font-semibold">{details.displayedPrice}<span className="font-normal text-[#B5B5B5]">/mo</span></dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
          <dt className="font-semibold">Total due today</dt>
          <dd className="text-right text-xs font-medium leading-5 text-[#D4D4D4]">Confirmed in Whop checkout</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-[#B8B8B8]">Promo codes, if available, are redeemed in Whop&apos;s secure checkout. This summary does not calculate discounts or taxes.</p>
    </div>

    <div className="mt-7 hidden lg:block">
      <h2 className="text-sm font-semibold">Included in this plan</h2>
      <BenefitList items={details.benefits} />
    </div>
    <details className="group mt-5 rounded-xl border border-white/10 p-4 lg:hidden">
      <summary className="cursor-pointer list-none text-sm font-semibold focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F]">
        <span className="flex items-center justify-between gap-4">View order details <span aria-hidden="true" className="text-[#FF5A1F] group-open:rotate-180">⌄</span></span>
      </summary>
      <BenefitList items={details.benefits} />
    </details>

    <div className="mt-8 border-t border-white/10 pt-6">
      <p className="text-xs leading-5 text-[#BEBEBE]">Sold by BrandFlow Studio. FrameLeads access is activated only after verified payment and subscription provisioning.</p>
      <a className="mt-4 inline-block text-sm text-[#EEEEEE] underline decoration-[#888888] underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]" href="mailto:akram@frameleads.io">Questions? akram@frameleads.io</a>
      <div><Link href="/#pricing" className="mt-5 inline-block text-sm text-[#BFBFBF] underline decoration-[#888888] underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]">← Back to plans</Link></div>
    </div>
  </section>;
}
