import { embeddedCheckoutPolicy } from "../../../checkout-embed-policy";

/**
 * A browser return is not payment verification. Whop's membership check at
 * FrameLeads login remains the sole access-granting authority.
 */
export default function CheckoutCompletePage() {
  const environment = process.env.VERCEL_ENV;
  const checkout = embeddedCheckoutPolicy("micro-pilot", process.env);
  // Never route a Sandbox buyer to the live SaaS after an incomplete setup.
  const loginUrl = environment === "preview"
    ? (checkout.environment === "sandbox" ? checkout.returnUrl : undefined)
    : (environment === "production" && checkout.environment === "production"
      ? checkout.returnUrl
      : undefined);

  return (
    <main className="grid min-h-screen place-items-center bg-[#111111] px-5 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FF5A1F]">Checkout update</p>
        <h1 className="mt-4 text-3xl font-bold">Continue to FrameLeads</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/65">
          Whop handles payment and account verification. Sign in using the same Whop account
          you used at checkout. FrameLeads will check your membership before granting access.
        </p>
        {loginUrl ? (
          <a
            href={loginUrl}
            className="mt-7 inline-block rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white hover:text-black"
          >
            Continue to FrameLeads login
          </a>
        ) : (
          <p role="status" className="mt-7 text-sm text-white/65">
            A verified FrameLeads sign-in destination is not configured for this environment.
          </p>
        )}
      </section>
    </main>
  );
}
