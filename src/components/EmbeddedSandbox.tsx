"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type AnimationPhase = "PAUSED" | "CSV_DROP" | "INGESTING" | "MAPPING" | "READING" | "POPULATED" | "ANALYZING" | "DRAFT" | "CLICKING" | "COMPLETE" | "RESETTING";

const leadFields = [
  { label: "First Name", value: "Colin" },
  { label: "Company Name", value: "Procre8" },
  { label: "Website", value: "https://procre8.co" },
  { label: "LinkedIn", value: "linkedin.com/in/colin-procre8" },
  { label: "Email", value: "colin@procre8.co" },
  { label: "Incident Details", value: "Pipeline triage" },
] as const;

const emptyFields = leadFields.map(() => "");

export default function EmbeddedSandbox() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasRun = useRef(false);
  const [isInView, setIsInView] = useState(false);
  const [fieldValues, setFieldValues] = useState<string[]>(emptyFields);
  const [phase, setPhase] = useState<AnimationPhase>("PAUSED");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { threshold: [0, 0.2] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    const timers = new Set<number>();
    const wait = (milliseconds: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, milliseconds);
        timers.add(timer);
      });

    const runLoop = async () => {
      if (hasRun.current) {
        setPhase("RESETTING");
        await wait(350);
      }

      while (!cancelled) {
        hasRun.current = true;
        setFieldValues(emptyFields);
        setPhase("CSV_DROP");
        await wait(300);

        if (cancelled) return;
        setPhase("INGESTING");
        await wait(700);

        if (cancelled) return;
        setPhase("MAPPING");
        await wait(500);

        if (cancelled) return;
        setPhase("READING");
        await wait(400);

        if (cancelled) return;
        setFieldValues(leadFields.map((field) => field.value));
        setPhase("POPULATED");
        await wait(600);

        if (cancelled) return;
        setPhase("ANALYZING");
        await wait(1500);

        if (cancelled) return;
        setPhase("DRAFT");
        await wait(2000);

        if (cancelled) return;
        setPhase("CLICKING");
        await wait(700);

        if (cancelled) return;
        setPhase("COMPLETE");
        await wait(6000);

        if (cancelled) return;
        setPhase("RESETTING");
        await wait(350);
      }
    };

    void runLoop();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [isInView]);

  const draftIsVisible = phase === "DRAFT" || phase === "CLICKING" || phase === "COMPLETE" || phase === "RESETTING";
  const csvIsVisible = phase === "PAUSED" || phase === "CSV_DROP" || phase === "INGESTING" || phase === "MAPPING";
  const executionIsWaiting = csvIsVisible || phase === "READING" || phase === "POPULATED";

  return (
    <section ref={sectionRef} id="interactive-sandbox" className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mb-12 max-w-3xl text-center"
      >
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">NO DECK REQUIRED</p>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Your first send is the proof.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
          Watch it draft. Watch it personalize. Watch it send natively—no export, no external tool, no card on file.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative isolate overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl lg:p-12"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 grid min-h-[36rem] grid-cols-1 md:grid-cols-2">
          <div className="relative border-b border-white/10 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8 lg:pr-12">
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">SOURCE LAYER</p>
                <span className="rounded-full border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.06] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#FF8A5F]">Queue: Lead 1 of 5,000</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">1. Signal Ingestion</h3>
              <p className="mt-2 text-sm text-[#888888]">Six signals mapped into one execution record.</p>
            </div>

            <AnimatePresence mode="wait">
              {csvIsVisible ? (
                <motion.div key="csv-drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex min-h-[27rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-white/[0.02] p-6 text-center shadow-inner">
                  <motion.div
                    initial={{ opacity: 0, y: -38, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="grid h-16 w-16 place-items-center rounded-xl border border-white/10 bg-white/[0.02] shadow-[0_16px_35px_rgba(0,0,0,0.45),0_0_24px_rgba(255,90,31,0.08)]"
                  >
                    <div className="text-center font-mono">
                      <div className="mx-auto h-7 w-6 rounded-sm border border-white/40 bg-white/[0.03]" />
                      <span className="mt-1 block text-[8px] font-bold text-[#FF5A1F]">CSV</span>
                    </div>
                  </motion.div>
                  <p className="mt-5 break-all font-mono text-sm font-semibold text-white">Q3_High_Intent_Leads.csv</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#777777]">
                    {phase === "PAUSED" || phase === "CSV_DROP" ? "Drag & Drop CSV" : phase === "INGESTING" ? "Ingesting 5,000 records..." : "Mapping columns..."}
                  </p>
                  <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      className="h-full rounded-full bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.55)]"
                      animate={{ width: phase === "PAUSED" || phase === "CSV_DROP" ? "0%" : phase === "INGESTING" ? "68%" : "100%" }}
                      transition={{ duration: phase === "INGESTING" ? 0.65 : 0.35, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mapped-fields"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: phase === "RESETTING" ? 0 : 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <AnimatePresence>
                    {phase === "READING" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 flex items-center gap-2 rounded-lg border border-[#FF5A1F]/15 bg-[#FF5A1F]/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#FF8A5F]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5A1F]" /> Reading Row 1...
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-3">
                    {leadFields.map((field, index) => {
                      const isComplete = fieldValues[index] === field.value;
                      return (
                        <motion.div
                          key={field.label}
                          animate={{ borderColor: isComplete ? "rgba(255,90,31,0.28)" : "rgba(255,255,255,0.1)" }}
                          className="relative overflow-hidden rounded-xl border bg-white/[0.02] px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md"
                        >
                          {isComplete && <motion.div initial={{ opacity: 0.12 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} className="pointer-events-none absolute inset-0 bg-[#FF5A1F]/20" />}
                          <div className="relative flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#666666]">{field.label}</p>
                              <p className="mt-1 min-h-5 truncate font-mono text-sm text-gray-200">{fieldValues[index]}</p>
                            </div>
                            <AnimatePresence>
                              {isComplete && (
                                <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">✓</motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex min-h-[32rem] flex-col pt-8 md:pl-8 md:pt-0 lg:pl-12">
            <div className="mb-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">DECISION LAYER</p>
              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">2. Autonomous Execution</h3>
              <p className="mt-2 text-sm text-[#888888]">Context converted into the next safe action.</p>
            </div>

            <div className="flex flex-1 flex-col">
              {executionIsWaiting && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="mx-auto w-full max-w-sm space-y-4">
                    <div className="mx-auto h-10 w-10 rounded-xl border border-[#FF5A1F]/15 bg-[#FF5A1F]/[0.04] shadow-[0_0_25px_rgba(255,90,31,0.08)]" />
                    <div className="mx-auto h-2 w-1/2 rounded-full bg-white/10" />
                    <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-5/6 rounded-full bg-white/[0.04]" />
                    <p className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#555555]">Awaiting complete signal map</p>
                  </div>
                </motion.div>
              )}

              {phase === "ANALYZING" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[#FF5A1F]/15 bg-white/[0.02] p-6 text-center">
                  <div className="relative h-14 w-14">
                    <div className="absolute inset-0 animate-ping rounded-full border border-[#FF5A1F]/30" />
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-[#FF5A1F] border-t-transparent" />
                  </div>
                  <p className="mt-6 font-mono text-sm text-[#FF5A1F]">Analyzing parameters...</p>
                </motion.div>
              )}

              {draftIsVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: phase === "RESETTING" ? 0 : 1, y: 0 }}
                  transition={{ duration: phase === "RESETTING" ? 0.3 : 0.45, ease: "easeOut" }}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono text-xs leading-6 text-gray-300 shadow-inner sm:p-5 sm:text-sm">
                    <p className="text-[#777777]">To: colin@procre8.co</p>
                    <p className="text-[#777777]">Subject: Procre8&apos;s pipeline triage</p>
                    <div className="my-4 h-px bg-white/[0.07]" />
                    <p>Hi <span className="text-[#FF5A1F]">Colin</span>,</p>
                    <br />
                    <p>I noticed <span className="text-[#FF5A1F]">Procre8</span> is tightening its outbound motion. When pipeline triage still depends on manual inbox routing, qualified intent can cool before the next action is assigned.</p>
                    <br />
                    <p>FrameLeads can connect the account context from <span className="text-[#FF5A1F]">procre8.co</span>, classify each reply, and move meeting-ready leads forward without losing the LinkedIn thread.</p>
                    <br />
                    <p>Worth pressure-testing this on one live sequence?</p>
                  </div>

                  <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button type="button" className={`rounded-xl bg-[#FF5A1F] px-4 py-3.5 text-sm font-bold text-white transition-all ${phase === "CLICKING" ? "scale-[1.02] bg-[#ff6b35] shadow-[0_0_34px_rgba(255,90,31,0.45)]" : "shadow-[0_0_24px_rgba(255,90,31,0.2)]"}`}>Send via Email</button>
                    <button type="button" className="rounded-xl border border-white/[0.2] bg-white/[0.05] px-4 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/[0.1]">Zero-Ban LinkedIn</button>
                    <AnimatePresence>
                      {phase === "CLICKING" && (
                        <motion.div initial={{ opacity: 0, x: 36, y: 24 }} animate={{ opacity: 1, x: -28, y: -8, scale: [1, 1, 0.86, 1] }} transition={{ duration: 0.65, ease: "easeOut", times: [0, 0.55, 0.75, 1] }} className="pointer-events-none absolute left-1/2 top-1/2 z-20 text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)]">
                          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white stroke-black" strokeWidth="1.25" aria-hidden="true"><path d="M5 3.5 19 14l-6.4 1.1L9.5 21 5 3.5Z" /></svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </motion.div>

    </section>
  );
}
