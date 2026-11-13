import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Whop Sandbox return | FrameLeads Preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * Test-only return target for the protected Core Sandbox checkout.
 * Never grants, confirms, or implies SaaS access or payment success.
 */
export default function SandboxReturn() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.WHOP_ENVIRONMENT !== "sandbox" ||
      process.env.FRAMELEADS_WHOP_SANDBOX_CORE_ONLY_TEST_ENABLED !== "true") notFound();

  return (
    <main className="min-h-screen bg-[#1A1A1A] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#888888]/40 bg-[#242424] p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5A1F]">Protected Sandbox test</p>
        <h1 className="mt-4 text-2xl font-bold">Return from Whop Sandbox</h1>
        <p className="mt-4 text-sm leading-7 text-white/80">
          This is a test-only handoff page, not proof that a payment completed or that
          any FrameLeads membership exists. No production account access is granted here.
          Payment and entitlement verification remains the responsibility of Whop and
          the FrameLeads SaaS backend.
        </p>
        <Link href="/" className="mt-7 inline-flex rounded-lg bg-[#FF5A1F] px-5 py-3 font-semibold text-white">
          Back to protected preview
        </Link>
      </div>
    </main>
  );
}
