import type { Metadata } from "next";
import { auditContinuationBridgeEnabled } from "../../../affiliate-checkout-return";
export const metadata: Metadata = { title: "Continue Audit checkout | FrameLeads", robots: { index: false, follow: false }, referrer: "no-referrer" };
type Props = { searchParams: Promise<{ state?: string }> };
const notices: Record<string, string> = {
  expired: "Your secure session expired. Request a new checkout link from your Audit.",
  invalid: "Invalid checkout request. Please choose a plan below.",
  unavailable: "Secure continuation is unavailable right now. You can still purchase directly on the pricing page.",
  rate_limited: "Too many verification attempts. Please try again later.",
};
export default async function ContinueCheckout({ searchParams }: Props) {
  const { state } = await searchParams;
  const available = auditContinuationBridgeEnabled(process.env);
  return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 py-10 text-white">
    <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8">
      <h1 className="text-2xl font-bold">Continue to FrameLeads checkout</h1>
      <p className="mt-3 text-sm text-white/70">Choose a plan. Your secure Audit session stays on this site. Payment fields are handled by Whop.</p>
      {state && notices[state] ? <p role="status" className="mt-4 text-sm text-white/75">{notices[state]}</p> : null}
      {available ? <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <form action="/api/checkout" method="POST" className="rounded-xl border border-white/10 p-4">
          <h2 className="text-xl font-semibold">Core</h2><p className="mt-2 text-sm text-white/65">$149/month</p>
          <button type="submit" name="plan" value="CORE" className="mt-4 w-full rounded-lg bg-[#FF5A1F] px-4 py-3 font-bold">Continue securely</button>
        </form>
        <form action="/api/checkout" method="POST" className="rounded-xl border border-white/10 p-4">
          <h2 className="text-xl font-semibold">Enterprise</h2><p className="mt-2 text-sm text-white/65">$499/month</p>
          <button type="submit" name="plan" value="ENTERPRISE" className="mt-4 w-full rounded-lg border border-white/20 px-4 py-3 font-bold">Continue securely</button>
        </form>
      </div> : <p role="status" className="mt-5 text-sm text-white/70">Secure Audit continuation is not currently available.</p>}
      <a href="/#pricing" className="mt-5 inline-block text-sm underline">View regular checkout options</a>
      {available ? <form action="/api/checkout/cancel" method="POST">
        <button type="submit" className="mt-6 text-sm text-white/65 underline">Cancel secure session</button>
      </form> : null}
    </section>
  </main>;
}
