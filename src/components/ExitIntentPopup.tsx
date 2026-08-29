"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "tripwireFired";
const COUNTDOWN_SECONDS = 300;
const MICRO_PILOT_URL = "https://whop.com/checkout/plan_8qLWfJZHQUYZf";
let visitRegisteredForPageLoad = false;

const MicroPilotBurstIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="mx-auto h-14 w-14 text-white">
    {[-45, 15, 75, 135, 195, 255].map((angle) => (
      <rect
        key={angle}
        x="29"
        y="5"
        width="6"
        height="14"
        rx="3"
        fill="currentColor"
        transform={`rotate(${angle} 32 32)`}
      />
    ))}
  </svg>
);

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const hasTriggered = useRef(false);

  useEffect(() => {
    let triggersDisabled = false;
    let hasEngaged = false;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let pricingIsVisible = false;
    let pricingArmed = false;
    let pricingArmTimer: number | null = null;
    let refreshTimer: number | null = null;
    let observer: IntersectionObserver | null = null;
    let cleanupTriggerListeners = () => {};

    const hasSessionLock = () => {
      try {
        return sessionStorage.getItem(SESSION_KEY) !== null;
      } catch {
        return hasTriggered.current;
      }
    };

    try {
      hasTriggered.current = sessionStorage.getItem(SESSION_KEY) !== null;
    } catch {
      hasTriggered.current = false;
    }

    let visitCount = 1;
    try {
      const storedVisitCount = Number(sessionStorage.getItem("visitCount") ?? "0");
      if (!visitRegisteredForPageLoad) {
        visitCount = Number.isFinite(storedVisitCount) ? storedVisitCount + 1 : 1;
        sessionStorage.setItem("visitCount", String(visitCount));
        visitRegisteredForPageLoad = true;
      } else {
        visitCount = Number.isFinite(storedVisitCount) ? storedVisitCount : 1;
      }
    } catch {
      // The behavioral triggers still work when session storage is unavailable.
    }

    const fireTripwire = () => {
      if (triggersDisabled || hasTriggered.current || hasSessionLock()) return;

      hasTriggered.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // The in-memory guard still prevents repeat displays when storage is unavailable.
      }

      setSecondsLeft(COUNTDOWN_SECONDS);
      setIsOpen(true);
      cleanupTriggerListeners();
    };

    const pricingSection = document.getElementById("pricing");
    const clearPricingArmTimer = () => {
      if (pricingArmTimer === null) return;
      window.clearTimeout(pricingArmTimer);
      pricingArmTimer = null;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = performance.now();
      const pageDepth = currentScrollY / Math.max(document.body.scrollHeight, 1);

      if (pageDepth > 0.6) hasEngaged = true;

      const deltaY = currentScrollY - lastScrollY;
      const elapsed = now - lastScrollTime;
      if (hasEngaged && deltaY < -120 && elapsed <= 250) fireTripwire();

      lastScrollY = currentScrollY;
      lastScrollTime = now;
    };

    const handlePricingMouseLeave = () => {
      if (pricingArmed) fireTripwire();
    };

    const checkoutSelector = 'a[href*="whop.com"], [data-tripwire-guard="true"]';
    const handleCheckoutClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(checkoutSelector)) return;

      triggersDisabled = true;
      hasTriggered.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // The in-memory guard still protects the active checkout flow.
      }
      cleanupTriggerListeners();
      document.removeEventListener("click", handleCheckoutClick, true);
    };

    cleanupTriggerListeners = () => {
      clearPricingArmTimer();
      if (refreshTimer !== null) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      window.removeEventListener("scroll", handleScroll);
      pricingSection?.removeEventListener("mouseleave", handlePricingMouseLeave);
      observer?.disconnect();
    };

    document.addEventListener("click", handleCheckoutClick, true);

    if (!hasSessionLock()) {
      window.addEventListener("scroll", handleScroll, { passive: true });

      if (pricingSection) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              pricingIsVisible = true;
              clearPricingArmTimer();
              if (!pricingArmed) {
                pricingArmTimer = window.setTimeout(() => {
                  if (pricingIsVisible) pricingArmed = true;
                }, 15_000);
              }
              return;
            }

            const shouldFire = pricingArmed;
            pricingIsVisible = false;
            clearPricingArmTimer();
            if (shouldFire) fireTripwire();
          },
          { threshold: 0.35 },
        );
        observer.observe(pricingSection);
        pricingSection.addEventListener("mouseleave", handlePricingMouseLeave);
      }

      if (visitCount > 1) {
        refreshTimer = window.setTimeout(fireTripwire, 3_000);
      }
    }

    return () => {
      cleanupTriggerListeners();
      document.removeEventListener("click", handleCheckoutClick, true);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(countdown);
    };
  }, [isOpen]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-lg sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-intent-title"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 text-center shadow-2xl sm:p-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close offer"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-xl text-[#888888] transition-colors hover:border-white/20 hover:text-white"
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <div className="relative z-10">
              <MicroPilotBurstIcon />
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">MICRO-PILOT ACCESS</p>
              <h2 id="exit-intent-title" className="mx-auto mt-5 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Wait. Don&apos;t let your pipeline keep bleeding.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
                Claim the $10 Micro-Pilot. Unlock 25 AI-tailored outbound leads and test the entire Sandbox architecture in your own business right now.
              </p>

              <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-gray-400">This backdoor access closes in:</p>
                <div role="timer" aria-live="polite" className="mt-3 font-mono text-4xl font-bold tabular-nums tracking-tight text-[#FF5A1F] drop-shadow-[0_0_18px_rgba(255,90,31,0.35)] sm:text-5xl">
                  {minutes}:{seconds}
                </div>
              </div>

              {secondsLeft > 0 ? (
                <Link
                  href={MICRO_PILOT_URL}
                  className="mt-8 inline-flex w-full max-w-md items-center justify-center rounded-xl bg-[#FF5A1F] px-8 py-4 text-center text-base font-bold text-white shadow-[0_0_35px_rgba(255,90,31,0.35)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98] sm:text-lg"
                >
                  Claim $10 Access Now
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-8 inline-flex w-full max-w-md cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-black/30 px-8 py-4 text-center text-base font-bold text-[#666666] sm:text-lg"
                >
                  Window Closed.
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
