import type { ReactNode } from "react";

/**
 * Privacy-safe visual walkthrough. These are handcrafted interface
 * illustrations; none of the user's real emails, links, usernames, avatars,
 * or private affiliate guidance are embedded in the site.
 */
function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 88 48" fill="none" className={className}>
      <path d="M3 3C21 42 53 40 80 24" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 20L80 24L71 38" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Short pointer whose tip meets the left edge of its neighboring copy icon. */
function CopyTargetArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 38 24"
      fill="none"
      className="pointer-events-none h-6 w-9 shrink-0"
    >
      <path d="M2 3C12 3 16 21 34 12" stroke="#FF5A1F" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M26 5L34 12L25 19" stroke="#FF5A1F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MiniWindow({ children, title, className = "" }: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div className={"relative overflow-hidden rounded-2xl border border-white/[0.14] bg-[#171717] shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)] " + className}>
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.1] bg-[#202020] px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-[#FF6851]"/>
          <span className="h-2 w-2 rounded-full bg-[#F7BE53]"/>
          <span className="h-2 w-2 rounded-full bg-[#5CBA79]"/>
        </div>
        <span className="ml-3 truncate text-[10px] font-medium tracking-[0.04em] text-[#A0A0A0]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ApplicationMockup() {
  return (
    <div role="img" aria-label="Illustrative FrameLeads partner application showing name and email fields and the Apply to join button">
      <MiniWindow title="frameleads.io / affiliates" className="mx-auto max-w-[490px]">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF875D]">Partner application</p>
              <p className="mt-1 text-xl font-bold text-white">Join FrameLeads</p>
            </div>
            <span className="whitespace-nowrap rounded-full border border-[#FF5A1F]/35 bg-[#FF5A1F]/10 px-2.5 py-1 font-mono text-[9px] text-[#FFB18C]">30% · recurring</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-[10px] text-[#D1D1D1]">First name</p>
              <div className="h-9 rounded-lg border border-white/15 bg-[#101010] px-3 pt-2.5 text-[10px] text-[#777]">First name</div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] text-[#D1D1D1]">Last name</p>
              <div className="h-9 rounded-lg border border-white/15 bg-[#101010] px-3 pt-2.5 text-[10px] text-[#777]">Last name</div>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] text-[#D1D1D1]">Email address</p>
            <div className="h-9 rounded-lg border border-white/15 bg-[#101010] px-3 pt-2.5 text-[10px] text-[#777]">you@company.com</div>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-[#B7B7B7]">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-[#FF5A1F] text-[10px] text-white">✓</span>
            Accept program terms and privacy policy
          </div>
          <div className="rounded-lg bg-[#FF5A1F] py-2.5 text-center text-xs font-bold text-white">Apply to join</div>
        </div>
      </MiniWindow>
    </div>
  );
}

function EmailMockup() {
  return (
    <div role="img" aria-label="Recreated Whop invitation email with an orange arrow highlighting the Your affiliate dashboard button. No real account details are shown.">
      <MiniWindow title="Inbox / Affiliate invitation" className="mx-auto max-w-[580px]">
        <div className="bg-[#F2F3F5] px-3 py-4 text-[#27292D] sm:px-6 sm:py-5">
          <div className="mx-auto max-w-[445px] rounded-xl bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.09)] sm:p-5">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <span className="text-[11px] font-bold text-[#262626]">FrameLeads <span className="font-normal text-[#888]">via Whop</span></span>
              <span className="text-xs font-black tracking-tight text-[#FF5A1F]">whop</span>
            </div>
            <div className="mt-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] text-lg font-black text-[#FF5A1F]" aria-hidden="true">F</div>
            <h3 className="mt-4 text-[14px] font-bold leading-5 sm:text-[16px]">You&apos;ve been added as an affiliate</h3>
            <p className="mt-2 text-[11px] leading-[1.7] text-[#666]">Welcome to the FrameLeads partner program. Your affiliate dashboard is ready to explore.</p>
            <div className="mt-5 flex justify-center pb-1">
              <div className="relative inline-flex items-center">
                <CurvedArrow className="pointer-events-none absolute right-[calc(100%-5px)] top-1/2 h-10 w-14 -translate-y-1/2 sm:h-12 sm:w-20" />
                <div className="rounded-md bg-[#1C62D7] px-4 py-2.5 text-center text-[11px] font-bold text-white shadow-sm sm:text-xs">
                  Your affiliate dashboard
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] text-[#999]">Open your dashboard to access referral links.</p>
          </div>
        </div>
      </MiniWindow>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2"/>
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>
    </svg>
  );
}

function LinksMockup() {
  const rows = [
    { name: "FrameLeads Enterprise", price: "$499 / mo" },
    { name: "FrameLeads Core", price: "$149 / mo" },
  ];
  return (
    <div role="img" aria-label="Recreated Whop Refer buyers dashboard, showing Core and Enterprise each at 30 percent and orange arrows pointing at the copy referral link icons. No actual affiliate links appear.">
      <MiniWindow title="Affiliate dashboard / Whop" className="mx-auto max-w-[620px]">
        <div className="space-y-4 p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">Affiliates</div>
            <span className="text-[10px] text-[#999]">Preview</span>
          </div>
          <div className="flex gap-5 border-b border-white/10 text-[11px] font-semibold">
            <span className="pb-2 text-[#888]">Dashboard</span>
            <span className="border-b-2 border-[#FF5A1F] pb-2 text-white">Refer buyers</span>
          </div>
          <h3 className="text-[13px] font-semibold text-white">Your affiliate links</h3>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="grid grid-cols-[minmax(0,1fr)_58px_80px] gap-2 border-b border-white/10 bg-[#202020] px-3 py-2 text-[9px] uppercase tracking-[0.06em] text-[#888] sm:grid-cols-[minmax(0,1fr)_80px_64px_90px]">
              <span>Product</span><span className="hidden sm:block">Price</span><span>Rate</span><span className="text-right">Link</span>
            </div>
            {rows.map(row => (
              <div key={row.name} className="grid grid-cols-[minmax(0,1fr)_58px_80px] items-center gap-2 border-b border-white/[0.08] px-3 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_80px_64px_90px]">
                <div className="min-w-0">
                  <span className="mr-2 hidden rounded bg-[#164A86]/70 px-1.5 py-0.5 text-[9px] font-semibold text-[#9FC8FF] sm:inline">Product</span>
                  <span className="text-[10px] font-medium text-white sm:text-[11px]">{row.name}</span>
                </div>
                <span className="hidden text-[10px] text-[#BBB] sm:block">{row.price}</span>
                <span className="text-[11px] font-semibold tabular-nums text-[#EFEFEF]">30.00%</span>
                <div className="flex items-center justify-end gap-1">
                  <CopyTargetArrow />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#FF5A1F]/80 bg-[#FF5A1F]/10 text-[#FFE6DA] shadow-[0_0_16px_rgba(255,90,31,0.18)]">
                    <CopyIcon />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-right text-[9px] text-[#888]">Use the copy icon beside each product</p>
        </div>
      </MiniWindow>
    </div>
  );
}

function GuidanceMockup() {
  return (
    <div role="img" aria-label="Recreated Whop Refer buyers screen with private affiliate instructions intentionally obscured. Applicants must read the latest guidance in their Whop dashboard.">
      <MiniWindow title="Affiliate dashboard / Whop" className="mx-auto max-w-[620px]">
        <div className="space-y-4 p-4 sm:p-5">
          <h3 className="text-[14px] font-bold text-white">Affiliates</h3>
          <div className="flex gap-5 border-b border-white/10 text-[11px] font-semibold">
            <span className="pb-2 text-[#888]">Dashboard</span>
            <span className="border-b-2 border-[#FF5A1F] pb-2 text-white">Refer buyers</span>
          </div>
          <p className="text-[13px] font-semibold text-white">Affiliate instructions</p>
          <div className="relative overflow-hidden rounded-2xl border border-[#FF5A1F]/25 bg-[#242424] px-5 py-6">
            <div className="pointer-events-none select-none space-y-3 blur-[7px]" aria-hidden="true">
              <div className="h-4 w-[82%] rounded-full bg-[#65605E]"/>
              <div className="h-3 w-full rounded-full bg-[#56514F]"/>
              <div className="h-3 w-[91%] rounded-full bg-[#56514F]"/>
              <div className="h-3 w-[69%] rounded-full bg-[#56514F]"/>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-[#171717]/35">
              <div className="flex items-center gap-2 rounded-full border border-[#FF875D]/40 bg-[#191919]/90 px-4 py-2.5 shadow-xl backdrop-blur-md">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#FF875D]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="11" rx="2"/>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                </svg>
                <span className="text-[11px] font-semibold text-[#EEE]">Read inside Whop</span>
              </div>
            </div>
          </div>
        </div>
      </MiniWindow>
    </div>
  );
}

const steps = [
  {
    number: "01",
    title: "Apply",
    detail: "Enter your name and email to request access to the FrameLeads partner program.",
    visual: <ApplicationMockup />,
  },
  {
    number: "02",
    title: "Open your invitation",
    detail: "Check your inbox for the affiliate invitation. Use its blue dashboard button to open Whop.",
    visual: <EmailMockup />,
  },
  {
    number: "03",
    title: "Copy your referral links",
    detail: "In Whop, select Refer buyers and copy the individual links for Core and Enterprise.",
    visual: <LinksMockup />,
  },
  {
    number: "04",
    title: "Read your partner guidance",
    detail: "Your Whop dashboard contains the latest instructions. Read them there before promoting FrameLeads.",
    visual: <GuidanceMockup />,
  },
] as const;

export default function AffiliateWalkthrough() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-28" aria-labelledby="affiliate-how-it-works">
      <div className="mb-8 border-t border-white/[0.12] pt-12 sm:mb-10 sm:pt-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF875D]">Simple from signup to sharing</p>
        <h2 id="affiliate-how-it-works" className="mt-3 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How the partnership works
        </h2>
      </div>
      <ol className="space-y-5">
        {steps.map(step => (
          <li key={step.number} className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-[#242424]/90 p-5 sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_80%_at_100%_115%,rgba(255,90,31,0.095),transparent_74%)]"/>
            <div className="relative grid items-center gap-7 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-10">
              <div className="flex items-start gap-4 lg:self-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/10 font-mono text-sm font-bold text-[#FF875D]">
                  {step.number}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-heading text-xl font-bold leading-tight text-white sm:text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#BDBDBD] sm:text-[15px]">{step.detail}</p>
                </div>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#171717]/50 p-2.5 sm:p-4">
                {step.visual}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-center text-xs leading-5 text-[#888]">Illustrative walkthrough. Affiliate links and latest partner guidance appear in each affiliate&apos;s own Whop dashboard.</p>
    </section>
  );
}
