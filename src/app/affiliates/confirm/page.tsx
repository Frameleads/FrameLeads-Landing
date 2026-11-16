import type { Metadata } from "next";
import ConfirmAffiliateEmail from "../../../components/ConfirmAffiliateEmail";

export const metadata: Metadata = {
  title: "Confirm affiliate email | FrameLeads",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AffiliateConfirmPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#1A1A1A] px-5 py-16 text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_60%_70%_at_50%_-5%,rgba(255,90,31,0.14),transparent_75%)]"/>
    <div className="relative z-10 w-full max-w-lg"><ConfirmAffiliateEmail/></div>
  </main>;
}
