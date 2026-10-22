import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EmbeddedWhopCheckout from "../../../components/EmbeddedWhopCheckout";
import { checkoutTier, embeddedCheckoutPolicy, tierInformation } from "../../../checkout-embed-policy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ plan: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plan } = await params;
  return {
    title: checkoutTier(plan) ? `Secure ${tierInformation(plan).title} checkout | FrameLeads` : "Checkout | FrameLeads",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function FrameLeadsCheckout({ params, searchParams }: Props) {
  const { plan } = await params;
  if (!checkoutTier(plan)) notFound();
  const details = tierInformation(plan);
  const query = await searchParams;
  // Never infer a payable referral from a public URL. Upstream referral
  // association requires an approved server-side consent/validation contract.
  const publicReferralPresent = Object.prototype.hasOwnProperty.call(query, "a");
  const config = embeddedCheckoutPolicy(plan, process.env);
  const canEmbed = config.available;

  return <main className="min-h-screen bg-[#111111] text-white">
    <header className="border-b border-white/[0.07] bg-[#0D0D0D]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="FrameLeads home">
          <Image src="/logo.png" alt="" width={34} height={34} className="rounded-lg" />
          <span className="font-heading text-lg font-bold tracking-wide">FrameLeads</span>
        </Link>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          Secure checkout
        </span>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <section aria-labelledby="order-heading" className="lg:pt-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF5A1F]">Your subscription</p>
        <h1 id="order-heading" className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{details.title}</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#AAAAAA]">{details.description}</p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#1A1A1A] p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">Current published plan</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-4xl font-bold">{config.available ? config.environment === "sandbox" ? "Sandbox test" : details.displayedPrice : details.displayedPrice}</span>
            <span className="text-sm text-white/50">{config.available ? "" : "/ month"}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/45">{config.available ? "Disposable test environment. Whop determines the Sandbox charge." : "Plan details shown for reference. The live Whop pricing configuration is authoritative."}</p>
          <div className="my-7 h-px bg-white/10" />
          <h2 className="text-sm font-semibold">Included with {details.title}</h2>
          <ul className="mt-5 space-y-4">
            {details.benefits.map(benefit => <li className="flex items-start gap-3 text-sm text-white/75" key={benefit}><span aria-hidden="true" className="mt-0.5 font-bold text-[#FF5A1F]">✓</span>{benefit}</li>)}
          </ul>
        </div>
        <p className="mt-6 max-w-md text-xs leading-relaxed text-white/50">Sold by BrandFlow Studio. FrameLeads access is activated only after Whop verifies your payment and your subscription entitlement is provisioned.</p>
        <Link href="/#pricing" className="mt-6 inline-flex text-sm font-medium text-white/65 underline decoration-white/30 underline-offset-4 hover:text-white">← Back to plans</Link>
      </section>

      <section aria-label="Payment" className="min-w-0 rounded-2xl border border-white/[0.1] bg-[#191919] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF5A1F]">Payment</p><h2 className="mt-1 text-lg font-semibold">Complete your subscription</h2></div>
          <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] uppercase text-white/50">Whop</span>
        </div>
        {canEmbed ? <EmbeddedWhopCheckout planId={config.planId} returnUrl={config.returnUrl} referralHintPresent={publicReferralPresent} /> : <div role="status" className="rounded-lg border border-white/15 bg-[#242424] p-6 text-sm leading-relaxed text-white/75">
          <h3 className="text-lg font-semibold text-white">Checkout preview is not available</h3>
          <p className="mt-3">This checkout has not been released. Only the explicitly configured Sandbox Core plan may be previewed. Production payments and the unfinished affiliate workflow remain unchanged.</p>
          <Link href="/#pricing" className="mt-5 inline-block rounded-lg border border-white/20 px-4 py-3 font-semibold text-white hover:border-white/50">Return to FrameLeads pricing</Link>
        </div>}
        <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs leading-relaxed text-white/50">
          <p>By continuing with Whop checkout, you agree to Whop&apos;s <a className="underline underline-offset-2 hover:text-white" href="https://whop.com/buyer-terms/" rel="noopener noreferrer" target="_blank">Buyer Terms of Service</a> and <a className="underline underline-offset-2 hover:text-white" href="https://whop.com/privacy/" rel="noopener noreferrer" target="_blank">Privacy Policy</a>.</p>
          <p className="mt-3">Powered by <a href="https://whop.com/" className="font-semibold text-white/70 underline underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer">Whop</a></p>
          <p className="mt-3">See FrameLeads&apos; <Link href="/terms" className="underline hover:text-white">Terms</Link> and <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.</p>
        </div>
      </section>
    </div>
  </main>;
}
