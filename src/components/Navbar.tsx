"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type NavbarProps = {
  onAuditClick: () => void;
};

const sectionLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export default function Navbar({ onAuditClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openAudit = () => {
    setIsMenuOpen(false);
    onAuditClick();
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.05]">
      <Link href="#top" className="flex shrink-0 items-center gap-3" aria-label="FrameLeads home">
        <Image src="/logo.png" alt="" width={34} height={34} priority className="rounded-lg object-contain" />
        <span className="font-heading text-lg font-bold tracking-wide text-white sm:text-xl">FrameLeads</span>
      </Link>

      <nav aria-label="Primary navigation" className="ml-auto hidden items-center gap-6 lg:flex">
        <button type="button" data-tripwire-guard="true" onClick={openAudit} className="text-sm text-gray-400 transition-colors hover:text-white">Audit</button>
        {sectionLinks.map((item) => <Link key={item.href} href={item.href} className="text-sm text-gray-400 transition-colors hover:text-white">{item.label}</Link>)}
      </nav>

      <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white lg:hidden" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d={isMenuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
      </button>

      {isMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-full rounded-2xl border border-white/10 border-b bg-[#0a0a0a] px-4 py-5 shadow-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <button type="button" data-tripwire-guard="true" onClick={openAudit} className="rounded-lg px-3 py-3 text-left text-sm text-gray-300 transition-colors hover:bg-white/[0.05] hover:text-white">Audit</button>
            {sectionLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-gray-300 transition-colors hover:bg-white/[0.05] hover:text-white">{item.label}</Link>)}
          </div>
        </nav>
      )}
    </header>
  );
}
