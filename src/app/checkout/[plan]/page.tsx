import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  // This flag is a consent-review hint, never payable attribution.
  const publicReferralPresent = Object.prototype.hasOwnProperty.call(query, "a");
  const config = embeddedCheckoutPolicy(plan, process.env);

  return (
    <main className="grid min-h-screen min-w-0 overflow-x-hidden bg-white font-sans lg:grid-cols-2">
      <CheckoutOrderSummary tier={plan} sandboxPreview={config.available} />

      <section
        aria-label="Secure Whop payment"
        className="min-w-0 bg-[#FFFFFF] px-5 py-8 text-[#1A1A1A] sm:px-8 sm:py-10 lg:px-12 lg:py-20"
      >
        <div className="mx-auto w-full max-w-[460px]">
          <h2 className="mb-7 text-xl font-semibold leading-tight text-[#1A1A1A]">
            Complete your purchase
          </h2>

          {config.available ? (
            <EmbeddedWhopCheckout
              planId={config.planId}
              returnUrl={config.returnUrl}
              referralHintPresent={publicReferralPresent}
            />
          ) : (
            <div role="status" className="rounded-lg border border-[#E4E4E4] bg-[#F7F7F7] p-5 text-sm leading-6 text-[#444444]">
              <p className="font-semibold text-[#1A1A1A]">Checkout preview unavailable</p>
              <p className="mt-2">This checkout is not yet released. The existing checkout links are unchanged.</p>
              <Link href="/#pricing" className="mt-4 inline-block font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]">
                Back to plans
              </Link>
            </div>
          )}

          <footer className="mt-8 border-t border-[#E8E8E8] pt-5 text-center text-xs leading-5 text-[#666666]">
            <p>
              By continuing, you agree to Whop&apos;s{" "}
              <a href="https://whop.com/buyer-terms/" rel="noopener noreferrer" target="_blank" className="underline underline-offset-2 hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]">
                Buyer Terms
              </a>{" "}
              and{" "}
              <a href="https://whop.com/privacy/" rel="noopener noreferrer" target="_blank" className="underline underline-offset-2 hover:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]">
                Privacy Policy
              </a>.
            </p>
            <p className="mt-2">Powered by <a href="https://whop.com/" rel="noopener noreferrer" target="_blank" className="font-medium underline underline-offset-2">Whop</a></p>
            <p className="mt-2">
              <Link href="/terms" className="underline underline-offset-2">FrameLeads Terms</Link>
              {" · "}
              <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
