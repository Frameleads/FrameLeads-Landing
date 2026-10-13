import type { Metadata } from "next";
import Link from "next/link";
import AuditRouteClient from "../../components/AuditRouteClient";

export const metadata: Metadata = {
  title: "Reply Workflow Audit | FrameLeads",
  description: "Answer five questions about your outbound workflow and see an immediate, personalized diagnosis before choosing whether to request a workflow map.",
  alternates: { canonical: "https://frameleads.io/audit" },
  openGraph: {
    title: "Reply Workflow Audit | FrameLeads",
    description: "Diagnose where your reply workflow becomes manual.",
    url: "https://frameleads.io/audit",
    siteName: "FrameLeads",
    type: "website",
  },
};

export default function AuditPage() {
  return <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-6 text-white sm:px-6 sm:pt-10">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FF5A1F]/[0.04] via-transparent to-transparent" />
    <div className="relative z-10 mx-auto max-w-5xl">
      <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.1] bg-[#111111]/90 px-5 py-4 backdrop-blur-md sm:px-7">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight text-white" aria-label="FrameLeads home">FrameLeads</Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white">Back to site</Link>
      </header>
      <section className="mx-auto max-w-4xl pb-7 pt-12 text-center sm:pb-10 sm:pt-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">Reply Workflow Audit</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">Find where replies stop moving.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#A4A4A4] sm:text-base">Answer five questions. See your diagnosis immediately. Contact details are only needed if you want the personalized workflow map.</p>
      </section>
      <AuditRouteClient />
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-white/40">The Audit is available without accepting optional analytics or advertising measurement.</p>
    </div>
  </main>;
}
