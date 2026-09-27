"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stations = [
  { icon: "◉", label: "Scout", detail: "ACME · Fit 92", tone: "neutral" },
  { icon: "▤", label: "Sandbox", detail: "Context + preview", tone: "neutral" },
  { icon: "✉", label: "Outbound", detail: "Native or connected", tone: "neutral" },
  { icon: "↳", label: "Prospect reply", detail: "Pricing question", tone: "orange" },
  { icon: "◇", label: "Decision intelligence", detail: "Memory + policy + playbook", tone: "orange" },
  { icon: "⇄", label: "Governed route", detail: "Approval selected", tone: "orange" },
  { icon: "▣", label: "Next action", detail: "Human review", tone: "green" },
  { icon: "↺", label: "Learning", detail: "Memory + playbook", tone: "neutral" },
] as const;

export default function OperatingPath() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [activeStation, setActiveStation] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timers = stations.map((_, index) => window.setTimeout(() => setActiveStation(index), index * 700));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, reduceMotion]);
  const visibleStation = reduceMotion ? stations.length - 1 : activeStation;

  return (
    <div ref={ref} className="relative mx-auto mt-10 w-full max-w-6xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1A1A1A] p-5 shadow-[0_24px_48px_-20px_rgba(0,0,0,.86)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,90,31,.07),transparent_45%)]" />
      <div className="relative z-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {stations.map((station, index) => (
          <div key={station.label} className="relative flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.09] bg-black/10 p-4 text-left sm:p-5">
            <motion.div
              animate={{ opacity: visibleStation >= index ? 1 : .35, scale: visibleStation === index && !reduceMotion ? [1, 1.07, 1] : 1, boxShadow: visibleStation === index ? "0 0 22px rgba(255,90,31,.35)" : "0 0 0 rgba(255,90,31,0)" }}
              transition={{ duration: .42, ease: "easeOut" }}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border text-base ${station.tone === "orange" ? "border-[#FF5A1F]/35 bg-[#FF5A1F]/[0.07] text-[#FF5A1F]" : station.tone === "green" ? "border-green-400/25 bg-green-400/[0.05] text-green-300" : "border-white/[0.13] bg-white/[0.03] text-white/70"}`}
            >
              {station.icon}
            </motion.div>
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/45">0{index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-white">{station.label}</p>
              <p className="mt-1 truncate font-mono text-[8px] uppercase tracking-wider text-white/50">{station.detail}</p>
            </div>
            {index < stations.length - 1 && (
              <div className="absolute -bottom-4 left-1/2 z-20 h-4 w-px overflow-hidden bg-white/10 md:-right-5 md:bottom-auto md:left-auto md:h-px md:w-5">
                <motion.span animate={{ y: visibleStation > index ? 16 : 0, x: visibleStation > index ? 20 : 0, opacity: visibleStation > index ? 1 : 0 }} transition={{ duration: .35, ease: "easeOut" }} className="absolute left-0 top-0 h-2 w-px bg-[#FF5A1F] shadow-[0_0_8px_rgba(255,90,31,.85)] md:h-px md:w-2" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="relative z-10 mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[#FF5A1F]/35 bg-[#FF5A1F]/[0.06] p-3 text-left"><p className="font-mono text-[8px] uppercase tracking-wider text-[#FF5A1F]">Primary execution</p><p className="mt-1 text-xs font-semibold text-white">FrameLeads native · Automated / approval required</p></div><div className="rounded-lg border border-white/[0.1] bg-black/10 p-3 text-left"><p className="font-mono text-[8px] uppercase tracking-wider text-white/45">Optional integration</p><p className="mt-1 text-xs font-semibold text-white/70">Connected outbound stack · Smartlead, Instantly, or other</p></div></div>
      <div className="relative z-10 mt-5 flex items-center justify-center gap-3"><span className="h-px w-10 bg-[#FF5A1F]/35" /><div className="rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.05] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.17em] text-[#FF5A1F]">Outcome feeds prospect memory + playbook</div><span className="h-px w-10 bg-[#FF5A1F]/35" /></div>
    </div>
  );
}
