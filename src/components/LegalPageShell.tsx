import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  description: string;
  canonicalPath: "/privacy" | "/terms";
  children: ReactNode;
};

export default function LegalPageShell({ title, description, canonicalPath, children }: LegalPageShellProps) {
  return <main className="relative min-h-screen overflow-x-hidden bg-[#111111] bg-grid-overlay px-4 pb-16 pt-8 text-white sm:px-6 sm:pt-12">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FF5A1F]/[0.035] via-transparent to-transparent" />
    <div className="relative z-10 mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.1] bg-[#151515]/90 px-5 py-4 backdrop-blur-md sm:px-7">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight text-white" aria-label="FrameLeads home">FrameLeads</Link>
        <nav aria-label="Legal pages" className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-widest text-[#888888] sm:gap-7">
          <Link href="/privacy" aria-current={canonicalPath === "/privacy" ? "page" : undefined} className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" aria-current={canonicalPath === "/terms" ? "page" : undefined} className="transition-colors hover:text-white">Terms</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-4xl pb-10 pt-14 text-center sm:pb-14 sm:pt-20">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">FrameLeads · Legal</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#9A9A9A] sm:text-base">{description}</p>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#777777]">Effective October 13, 2026</p>
      </section>
      <article className="space-y-8 rounded-2xl border border-white/[0.1] bg-[#151515]/95 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] sm:space-y-10 sm:p-8 md:p-10">{children}</article>
      <footer className="flex flex-col items-center justify-between gap-4 py-8 font-mono text-[9px] uppercase tracking-widest text-[#777777] sm:flex-row">
        <Link href="/" className="transition-colors hover:text-white">← Back to FrameLeads</Link>
        <a href="mailto:akram@frameleads.io" aria-label="Email FrameLeads support at akram@frameleads.io" className="transition-colors hover:text-white">Support · akram@frameleads.io</a>
      </footer>
    </div>
  </main>;
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-b border-white/[0.07] pb-7 last:border-0 last:pb-0 sm:pb-9">
    <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-7 text-[#A4A4A4] sm:text-[15px]">{children}</div>
  </section>;
}
