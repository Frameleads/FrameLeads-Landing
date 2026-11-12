import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AffiliateRegistrationForm from "../../components/AffiliateRegistrationForm";
import AffiliateWalkthrough from "../../components/AffiliateWalkthrough";
import { affiliateMode, AFFILIATE_COMMISSION_PERCENT } from "../../affiliate-native.ts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "FrameLeads Partner Program | Become an Affiliate",
  description: "Join the FrameLeads partner program. Refer founder-led B2B agencies to reply-decision intelligence and earn recurring commission on qualifying Core or Enterprise subscription payments.",
  alternates: { canonical: "https://frameleads.io/affiliates" },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AffiliatePage() {
  const mode = affiliateMode(process.env);
  return <main className="relative min-h-screen overflow-hidden bg-[#1A1A1A] text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[45rem] bg-[radial-gradient(ellipse_80%_70%_at_50%_-15%,rgba(255,90,31,0.18),transparent_70%)]"/>
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b border-white/[0.1] px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3 text-white" aria-label="FrameLeads home">
        <Image src="/logo.png" width={35} height={35} alt="" className="rounded-lg"/>
        <span className="font-heading text-xl font-bold">FrameLeads</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/about" className="hidden text-sm text-white/70 transition hover:text-white sm:inline">About</Link>
        <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#FF5A1F]/50 hover:bg-white/[0.05]">Back to website</Link>
      </div>
    </header>
    <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:pt-28">
      <section className="max-w-2xl" aria-labelledby="affiliate-title">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF875D]">FrameLeads / Partner Program</p>
        <h1 id="affiliate-title" className="mt-6 max-w-[700px] font-heading text-[clamp(2.75rem,5.5vw,5.25rem)] font-bold leading-[1.06] tracking-[-0.055em]">
          Get rewarded for the <span className="bg-gradient-to-r from-[#FF5A1F] to-[#FFB181] bg-clip-text text-transparent">right introduction.</span>
        </h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-[#BDBDBD] sm:text-lg">
          Know a founder-led B2B agency or consultancy running outbound? Introduce them to FrameLeads, the decision layer for what happens after a prospect replies.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#30221E] to-[#242424] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B3A09A]">Core · $149/month</p>
            <p className="mt-4 font-heading text-4xl font-bold text-white">{AFFILIATE_COMMISSION_PERCENT}%</p>
            <p className="mt-2 text-sm font-semibold text-[#FFB18C]">$44.70 per qualifying monthly payment</p>
          </div>
          <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#30221E] to-[#242424] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B3A09A]">Enterprise · $499/month</p>
            <p className="mt-4 font-heading text-4xl font-bold text-white">{AFFILIATE_COMMISSION_PERCENT}%</p>
            <p className="mt-2 text-sm font-semibold text-[#FFB18C]">$149.70 per qualifying monthly payment</p>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-xs leading-6 text-[#999]">Affiliates earn 30% on eligible initial and recurring subscription payments while the referred subscription qualifies. Amounts shown assume the full monthly price and may vary with discounts, refunds, taxes, or provider adjustments.</p>

      </section>
      <div className="lg:sticky lg:top-10">
        {mode === "preview" && <div className="mb-4 rounded-xl border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-4 py-3 text-xs font-semibold leading-5 text-[#FFCAAE]" role="status">
          Preview test only — submissions validate the form, but do not contact Whop or send emails.
        </div>}
        {mode === "disabled" && <div className="mb-4 rounded-xl border border-white/20 bg-[#242424] px-4 py-3 text-sm text-[#BDBDBD]">
          Partner applications are not open yet.
        </div>}
        <AffiliateRegistrationForm mode={mode}/>
        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[#999]">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:akram@frameleads.io" className="hover:text-white">Questions?</a>
        </div>
      </div>
    </div>
    <AffiliateWalkthrough />
    <footer className="relative z-10 border-t border-white/[0.1] px-5 py-8 text-center text-xs text-[#888]">
      © 2026 FrameLeads · A BrandFlow Studio company
    </footer>
  </main>;
}
