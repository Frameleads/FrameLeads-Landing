import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WhopReadinessControl from "../../../components/WhopReadinessControl";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Whop Affiliate Readiness | FrameLeads Preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function WhopReadinessPage() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "feat/whop-native-affiliate-preview-20261112") {
    notFound();
  }
  return <main className="min-h-screen bg-[#1A1A1A] px-5 py-12 text-white sm:py-20">
    <div className="mx-auto max-w-3xl">
      <Link href="/affiliates" className="text-sm text-[#FF875D] hover:text-white">Back to affiliate Preview</Link>
      <div className="mt-8"><WhopReadinessControl /></div>
    </div>
  </main>;
}
