type Props = { searchParams: Promise<{ state?: string }> };

const messages: Record<string, string> = {
  expired: 'Your verified checkout session expired. Request a new continuation link from your Audit.',
  conflicted: 'More than one affiliate referral was recorded for this Audit. We have not selected one automatically. Contact FrameLeads to resolve the referral before using this continuation.',
  affiliate_ineligible: 'The recorded referral is not currently eligible for this plan. We have not removed or replaced the referral. Contact FrameLeads or try again later.',
  provider_unavailable: 'Whop could not verify the referral or prepare checkout. Your referral evidence is preserved. Retry this step shortly.',
  state_unavailable: 'The verified checkout state could not be loaded. Retry shortly; no checkout was started.',
  rate_limited: 'Too many checkout attempts were made from this secure continuation. Wait an hour or request a new continuation link from your Audit.',
  invalid: 'The requested plan is invalid. Choose one of the plans below.',
  unavailable: 'Checkout is temporarily unavailable. Retry shortly.',
};

export default async function ContinueCheckoutPage({ searchParams }: Props) {
  const { state } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 py-12 text-white">
    <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FF5A1F]">Verified Audit continuation</p>
      <h1 className="mt-4 text-3xl font-bold">Choose your FrameLeads plan</h1>
      <p className="mt-3 text-sm leading-relaxed text-white/65">Your email was verified. Choose a plan to continue to Whop’s hosted checkout.</p>
      {state && messages[state] && <p role="status" className="mt-5 rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/[0.06] p-4 text-sm leading-relaxed text-white/80">{messages[state]}</p>}
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <form action="/api/checkout" method="post" className="rounded-xl border border-white/10 p-5">
          <h2 className="text-xl font-semibold">Core</h2><p className="mt-2 text-sm text-white/60">$147 / month</p>
          <button className="mt-5 w-full rounded-lg bg-[#FF5A1F] px-4 py-3 font-bold" name="plan" value="CORE">Continue to Core checkout</button>
        </form>
        <form action="/api/checkout" method="post" className="rounded-xl border border-white/10 p-5">
          <h2 className="text-xl font-semibold">Enterprise</h2><p className="mt-2 text-sm text-white/60">$697 / month</p>
          <button className="mt-5 w-full rounded-lg border border-white/20 px-4 py-3 font-bold hover:bg-white hover:text-black" name="plan" value="ENTERPRISE">Continue to Enterprise checkout</button>
        </form>
      </div>
      <form action="/api/checkout/cancel" method="post"><button className="mt-7 text-sm text-white/55 underline hover:text-white" type="submit">Cancel this continuation</button></form>
    </section>
  </main>;
}
