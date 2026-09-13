"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "microPilotShown";
const MICRO_PILOT_URL = "https://whop.com/checkout/plan_8qLWfJZHQUYZf";

const MicroPilotBurstIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14 text-white">
    {[-45, 15, 75, 135, 195, 255].map((angle) => <rect key={angle} x="29" y="5" width="6" height="14" rx="3" fill="currentColor" transform={`rotate(${angle} 32 32)`} />)}
  </svg>
);

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    let pricingViewed = false;
    let finalCloseViewed = false;
    let pricingObserver: IntersectionObserver | null = null;
    let finalCloseObserver: IntersectionObserver | null = null;
    const testMode = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("testMicroPilot") === "1";
    try { hasTriggered.current = sessionStorage.getItem(SESSION_KEY) !== null; } catch { hasTriggered.current = false; }

    const openOffer = (force = false) => {
      if ((!pricingViewed && !force) || (hasTriggered.current && !force)) return;
      hasTriggered.current = true;
      try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* Session storage is optional. */ }
      setIsOpen(true);
    };
    const handleExitIntent = (event: MouseEvent) => {
      if (event.relatedTarget === null && event.clientY <= 8) openOffer();
    };
    const handleCheckoutClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('a[href*="whop.com"]')) return;
      hasTriggered.current = true;
      try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* Session storage is optional. */ }
    };
    const pricingSection = document.getElementById("pricing");
    const finalCloseSection = document.getElementById("commercial-close");
    document.addEventListener("click", handleCheckoutClick, true);

    if (testMode) {
      openOffer(true);
      return () => document.removeEventListener("click", handleCheckoutClick, true);
    }

    if (pricingSection && !hasTriggered.current) {
      pricingObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) pricingViewed = true; }, { threshold: 0.3 });
      pricingObserver.observe(pricingSection);
      document.addEventListener("mouseout", handleExitIntent);
    }

    if (finalCloseSection && !hasTriggered.current) {
      finalCloseObserver = new IntersectionObserver(([entry]) => {
        if (!pricingViewed) return;
        if (entry.isIntersecting) {
          finalCloseViewed = true;
          return;
        }
        if (finalCloseViewed && entry.boundingClientRect.top < 0 && window.matchMedia("(pointer: coarse)").matches) openOffer();
      }, { threshold: 0.5 });
      finalCloseObserver.observe(finalCloseSection);
    }

    return () => {
      pricingObserver?.disconnect();
      finalCloseObserver?.disconnect();
      document.removeEventListener("mouseout", handleExitIntent);
      document.removeEventListener("click", handleCheckoutClick, true);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-lg sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }} role="dialog" aria-modal="true" aria-labelledby="micro-pilot-title" className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 shadow-2xl sm:max-h-none sm:overflow-hidden sm:p-7">
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close Micro-Pilot offer" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-[#888888] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"><span aria-hidden="true">&times;</span></button>
            <div className="pr-10"><div className="flex items-center gap-3"><MicroPilotBurstIcon /><div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#888888]">PRIVATE MICRO-PILOT</p><p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">25-PROSPECT MICRO-PILOT</p></div></div><h2 id="micro-pilot-title" className="mt-4 text-2xl font-bold leading-[1.12] tracking-tight text-white sm:text-3xl">Run one controlled FrameLeads campaign before deploying the full system.</h2><p className="mt-3 text-sm leading-relaxed text-[#888888] sm:text-base">Bring in up to 25 prospects, configure your campaign, and experience the FrameLeads workflow using your own offer and context.</p></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white">Included</p><ul className="mt-3 space-y-1.5 text-sm text-white/75">{["Campaign setup", "Prospect ingest", "Sandbox execution", "25-prospect limit"].map((item) => <li key={item} className="flex gap-2.5"><span className="text-white" aria-hidden="true">✓</span><span>{item}</span></li>)}</ul></div><div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Locked in Micro-Pilot</p><ul className="mt-3 space-y-1.5 text-sm text-[#888888]">{["Full deployment integrations", "Inbox Triage", "Governance"].map((item) => <li key={item} className="flex gap-2.5"><span aria-hidden="true">×</span><span>{item}</span></li>)}</ul></div></div>
            <Link href={MICRO_PILOT_URL} data-tripwire-guard="true" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#FF5A1F] px-6 py-3 text-center font-bold text-white hover:bg-[#ff6b35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black">Run the Micro-Pilot — $10</Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
