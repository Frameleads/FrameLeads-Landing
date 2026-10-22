import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CheckoutOrderSummary from "../../../components/CheckoutOrderSummary";
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
  const query = await searchParams;
  // The public query is only a consent-review hint. Never transform ?a=
  // into a payable affiliate identifier or silently bypass verified evidence.
  const publicReferralPresent = Object.prototype.hasOwnProperty.call(query, "a");
  const config = embeddedCheckoutPolicy(plan, process.env);

  return <main className="min-h-screen overflow-x-hidden bg-[#000000] font-sans text-white">
    <header className="border-b border-white/10 bg-[#000000]">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F]" aria-label="FrameLeads home">
          <Image src="/logo.png" alt="" width={34} height={34} className="rounded-lg object-contain" priority />
          <span className="font-heading text-lg font-bold tracking-wide text-white">FrameLeads</span>
        </Link>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#B9B9B9]">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          Secure checkout
        </span>
      </div>
    </header>

    <div className="mx-auto max-w-7xl lg:px-5 lg:py-8">
      <div className="grid min-w-0 overflow-hidden bg-[#1A1A1A] lg:min-h-[calc(100vh-140px)] lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:rounded-2xl">
        <CheckoutOrderSummary tier={plan} sandboxPreview={config.available} />
        <section aria-label="Secure Whop payment" className="min-w-0 bg-[#FFFFFF] px-4 py-8 text-[#1A1A1A] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-[#E7E7E7] pb-5">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777777]">Payment</p>
              <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-[#1A1A1A]">Complete your purchase</h2>
              <p className="mt-2 text-sm text-[#606060]">Secure payment powered by Whop</p>
            </div>
            <span className="shrink-0 rounded-md border border-[#DADADA] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-[#484848]">Whop</span>
          </div>

          {config.available
            ? <EmbeddedWhopCheckout planId={config.planId} returnUrl={config.returnUrl} referralHintPresent={publicReferralPresent} />
            : <div role="status" className="rounded-xl border border-[#E2E2E2] bg-[#F5F5F5] p-6 text-sm leading-6 text-[#454545]">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Checkout preview is not available</h3>
                <p className="mt-3">This checkout has not been released. Only the explicitly configured Sandbox Core plan may be previewed. Production payments and the unfinished affiliate workflow remain unchanged.</p>
                <Link href="/#pricing" className="mt-5 inline-block rounded-lg bg-[#1A1A1A] px-4 py-3 font-semibold text-white hover:bg-[#242424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Return to FrameLeads pricing</Link>
              </div>}

          <footer className="mt-7 border-t border-[#E6E6E6] pt-6 text-center text-xs leading-5 text-[#666666]">
            <p>By continuing with Whop checkout, you agree to Whop&apos;s <a className="font-medium text-[#333333] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]" href="https://whop.com/buyer-terms/" rel="noopener noreferrer" target="_blank">Buyer Terms of Service</a> and <a className="font-medium text-[#333333] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]" href="https://whop.com/privacy/" rel="noopener noreferrer" target="_blank">Privacy Policy</a>.</p>
            <p className="mt-3">Powered by <a href="https://whop.com/" className="font-semibold text-[#454545] underline underline-offset-2" target="_blank" rel="noopener noreferrer">Whop</a></p>
            <p className="mt-3">See FrameLeads&apos; <Link href="/terms" className="font-medium text-[#333333] underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="font-medium text-[#333333] underline underline-offset-2">Privacy Policy</Link>.</p>
          </footer>
        </section>
      </div>
    </div>
  </main>;
}
