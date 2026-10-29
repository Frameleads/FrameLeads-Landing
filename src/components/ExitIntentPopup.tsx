"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { sectionEyebrowMotion, sectionHeadingMotion, sectionSubheadingMotion, sectionVisualMotion } from "./section-motion";

const SESSION_KEY = "microPilotShown";
const MICRO_PILOT_URL = "/checkout/micro-pilot";

const MicroPilotBurstIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10 shrink-0 text-white sm:h-14 sm:w-14">
    {[-45, 15, 75, 135, 195, 255].map((angle) => <rect key={angle} x="29" y="5" width="6" height="14" rx="3" fill="currentColor" transform={`rotate(${angle} 32 32)`} />)}
  </svg>
);

export default function ExitIntentPopup({ openRequest = false, onOpenRequestChange }: { openRequest?: boolean; onOpenRequestChange?: (open: boolean) => void }) {
  const [isAutomaticOpen, setIsAutomaticOpen] = useState(false);
  const hasTriggered = useRef(false);
  const isOpen = openRequest || isAutomaticOpen;

  const closeOffer = useCallback(() => {
    setIsAutomaticOpen(false);
    onOpenRequestChange?.(false);
  }, [onOpenRequestChange]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAuditEmailCoreVisit =
      params.get("utm_source") === "website_audit" &&
      params.get("utm_medium") === "email" &&
      window.location.hash === "#core";

    if (isAuditEmailCoreVisit) {
      hasTriggered.current = true;
      try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* Session storage is optional. */ }
      return;
    }

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
      setIsAutomaticOpen(true);
    };
    const handleExitIntent = (event: MouseEvent) => {
      if (event.relatedTarget === null && event.clientY <= 8) openOffer();
    };
    const handleCheckoutClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('a[href^="/checkout/"], a[href*="whop.com/checkout/plan_"]')) return;
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
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          finalCloseViewed = true;
          // A touch user cannot express desktop exit intent. Show the offer
          // after Pricing has been viewed and the final CTA is reached.
          if (window.matchMedia("(pointer: coarse)").matches) openOffer();
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
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeOffer(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [closeOffer, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden bg-black/75 px-3 py-4 backdrop-blur-lg sm:px-6 sm:py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOffer(); }}>
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }} role="dialog" aria-modal="true" aria-labelledby="micro-pilot-title" className="relative box-border max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-6xl overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#1A1A1A] p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6 lg:p-7">
            <button type="button" onClick={closeOffer} aria-label="Close Micro-Pilot offer" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-[#888888] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"><span aria-hidden="true">&times;</span></button>
            <div className="min-w-0 pr-10">
              <div className="flex min-w-0 items-start gap-2.5 sm:items-center sm:gap-3"><MicroPilotBurstIcon /><div className="min-w-0">
                <motion.p variants={sectionEyebrowMotion} initial="hidden" animate="visible" className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#888888]">PRIVATE MICRO-PILOT</motion.p>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .14, ease: [0.22, 1, 0.36, 1] }} className="mt-1 break-words font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.08em] text-[#FF5A1F] sm:text-[11px] sm:tracking-[0.18em]">25 TOTAL PROSPECTS · $10 ONE-TIME</motion.p>
              </div></div>
              <motion.h2 variants={sectionHeadingMotion} initial="hidden" animate="visible" id="micro-pilot-title" className="mt-4 text-2xl font-bold leading-[1.12] tracking-tight text-white sm:text-3xl">Micro Pilot</motion.h2>
              <motion.p variants={sectionSubheadingMotion} initial="hidden" animate="visible" className="mt-3 text-sm leading-relaxed text-[#888888] sm:text-base">See how FrameLeads interprets real prospect replies, explains the signals behind interest, and chooses the next safe action before you commit to a full plan.</motion.p>
            </div>
            <motion.div variants={sectionVisualMotion} initial="hidden" animate="visible" className="mt-5 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-white/10 bg-[#242424] p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white">Included</p>
                <ul className="mt-3 space-y-1.5 text-sm text-white/75">
                  {["25 total outbound prospects", "3 first-time prospect reply analyses with interest, Why Now evidence, and the recommended next action", "A suggested reply when the governance rules permit it — otherwise a clear human-review hold", "Research up to 3 qualified prospects once each", "One company context, 2 sales rules, and 1 governance rule", "Original replies and completed Decision Replays remain readable afterward"].map(item => <li key={item} className="flex min-w-0 gap-2.5"><span className="shrink-0 text-white" aria-hidden="true">✓</span><span className="min-w-0 break-words">{item}</span></li>)}
                </ul>
              </div>
              <div className="min-w-0 rounded-xl border border-white/10 bg-[#242424] p-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#888888]">Full deployment adds</p>
                <p className="mt-3 text-sm leading-relaxed text-[#888888]">Core expands prospect research, decision intelligence, company context, and sales playbook configuration. Enterprise adds expanded governance controls and automation.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .68, delay: .5, ease: [0.22, 1, 0.36, 1] }}><Link href={MICRO_PILOT_URL} data-tripwire-guard="true" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#FF5A1F] px-6 py-3 text-center font-bold text-white hover:bg-[#ff6b35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-black">Run the Micro-Pilot — $10</Link></motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
