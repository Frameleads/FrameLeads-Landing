import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import CheckoutOrderSummary from "../../../../components/CheckoutOrderSummary";
import VerifiedAffiliateCheckout from "../../../../components/VerifiedAffiliateCheckout";
import { embeddedCheckoutPolicy } from "../../../../checkout-embed-policy";
import { AFFILIATE_NATIVE_COOKIE, nativeAffiliateEmbedEnabled, readAffiliateNativeSession } from "../../../../affiliate-native-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Secure partner checkout | FrameLeads", robots: { index: false, follow: false }, referrer: "no-referrer",
};

export default async function AffiliateCheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const tier = plan === "core" ? "CORE" : plan === "enterprise" ? "ENTERPRISE" : null;
  const cookieJar = await cookies();
  const session = readAffiliateNativeSession(cookieJar.get(AFFILIATE_NATIVE_COOKIE)?.value,
    process.env.FRAMELEADS_AFFILIATE_NATIVE_COOKIE_KEY);
  const policy = tier ? embeddedCheckoutPolicy(plan as "core" | "enterprise", process.env) : null;
  const authorized = Boolean(tier && nativeAffiliateEmbedEnabled(process.env)
    && policy?.available && session && session.offer === tier
    && policy.environment === session.environment && policy.planId === session.planId
    && session.checkoutConfigurationId.startsWith("ch_"));
  if (!authorized || !tier || !session || !policy || !policy.returnUrl) {
    return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 text-white">
      <section className="max-w-xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8">
        <h1 className="text-2xl font-semibold">This secure checkout session is unavailable</h1>
        <p className="mt-4 text-sm text-white/70">The partner-linked checkout could not be verified. We have not reassigned this referral. Request a new secure link before buying.</p>
        <Link href="/#pricing" className="mt-5 inline-block underline">Back to pricing</Link>
      </section>
    </main>;
  }
  return <main className="grid min-h-screen min-w-0 overflow-x-hidden bg-white lg:grid-cols-2">
    <CheckoutOrderSummary tier={plan as "core" | "enterprise"} termsVerified={true}/>
    <section aria-label="Whop secure partner payment" className="min-w-0 bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto w-full max-w-[460px]">
        <h2 className="mb-7 text-xl font-semibold text-[#1A1A1A]">Complete your purchase</h2>
        <VerifiedAffiliateCheckout
          checkoutConfigurationId={session.checkoutConfigurationId}
          returnUrl={policy.returnUrl} hostedFallback={session.hostedFallback}
          environment={session.environment}
        />
        <footer className="mt-8 border-t border-[#E8E8E8] pt-5 text-center text-xs text-[#666666]">
          <Link href="/terms" className="underline">FrameLeads Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
        </footer>
      </div>
    </section>
  </main>;
}
