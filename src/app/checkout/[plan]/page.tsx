import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { DIRECT_AFFILIATE_ACTOR_COOKIE } from "../../../direct-affiliate-actor";
import CheckoutOrderSummary from "../../../components/CheckoutOrderSummary";
import EmbeddedWhopCheckout from "../../../components/EmbeddedWhopCheckout";
import { checkoutTier, embeddedCheckoutPolicy, tierInformation } from "../../../checkout-embed-policy";

export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ plan: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const jar = await cookies();
  // A signed direct-referral actor may persist across navigation after ?a=
  // disappears. Hold the generic checkout until the verified path completes;
  // this boolean alone never proves consent or creates a commission.
  const referralHintPresent = Object.prototype.hasOwnProperty.call(query, "a")
    || Boolean(jar.get(DIRECT_AFFILIATE_ACTOR_COOKIE)?.value);
  const config = embeddedCheckoutPolicy(plan, process.env);
  const termsVerified = process.env.VERCEL_ENV === "preview"
    ? config.available
    : process.env.FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED === "true";

  return (
    <main className="grid min-h-screen min-w-0 overflow-x-hidden bg-white font-sans lg:grid-cols-2">
      <CheckoutOrderSummary tier={plan} termsVerified={termsVerified} />
      <section aria-label="Secure Whop payment" className="min-w-0 bg-[#FFFFFF] px-5 py-8 text-[#1A1A1A] sm:px-8 sm:py-10 lg:px-12 lg:py-20">
        <div className="mx-auto w-full max-w-[460px]">
          <h2 className="mb-7 text-xl font-semibold leading-tight text-[#1A1A1A]">Complete your purchase</h2>
          <EmbeddedWhopCheckout
            planId={config.planId ?? ""}
            returnUrl={config.returnUrl ?? ""}
            hostedFallback={config.hostedFallback ?? ""}
            environment={config.environment ?? "sandbox"}
            referralHintPresent={referralHintPresent}
            embedEnabled={config.available}
          />

          <footer aria-label="FrameLeads policies" className="mt-8 border-t border-[#E8E8E8] pt-5 text-center text-xs leading-5 text-[#666666]">
            <p><Link href="/terms" className="underline underline-offset-2">FrameLeads Terms</Link>{" · "}<Link href="/privacy" className="underline underline-offset-2">Privacy</Link></p>
          </footer>
        </div>
      </section>
    </main>
  );
}
