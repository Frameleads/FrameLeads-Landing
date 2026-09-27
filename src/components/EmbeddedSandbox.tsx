"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { sectionEyebrowMotion, sectionHeadingMotion, sectionSubheadingMotion, sectionViewport } from "./section-motion";

type Scenario = "consequential" | "routine";
type DecisionStage = 0 | 1 | 2 | 3 | 4 | 5;

const scenarios = {
  consequential: { label: "Consequential", reply: "Can you clarify pricing before we schedule?", intent: "Pricing question", confidence: "87%", account: "Enterprise evaluation", campaign: "Q3 outreach", signal: "High intent", rule: "Commercial negotiation requires approval", route: "Founder review", automation: "Paused", control: "Human review required" },
  routine: { label: "Routine", reply: "Thursday at 2:00 PM works for me.", intent: "Meeting confirmation", confidence: "96%", account: "Qualified evaluation", campaign: "Q3 outreach", signal: "Meeting-ready", rule: "Confirmed meetings can continue", route: "Meeting workflow", automation: "Active", control: "Invite ready to dispatch" },
} as const;

const stageLabels = ["Reply arrives", "Intent detected", "Context checked", "Rule matched", "Decision made", "Control applied"];

function DecisionRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 border-b border-white/[0.06] py-3 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:items-center"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#888888]">{label}</p><p className="text-sm text-white/85">{value}</p></div>;
}

export default function EmbeddedSandbox() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [scenarioKey, setScenarioKey] = useState<Scenario>("consequential");
  const [stage, setStage] = useState<DecisionStage>(() => reduceMotion ? 5 : 0);
  const scenario = scenarios[scenarioKey];

  useEffect(() => {
    if (reduceMotion || !isInView) return;
    const timers = [1, 2, 3, 4, 5].map((nextStage) => window.setTimeout(() => setStage(nextStage as DecisionStage), nextStage * 900));
    return () => timers.forEach(window.clearTimeout);
  }, [scenarioKey, reduceMotion, isInView]);

  const selectScenario = (nextScenario: Scenario) => {
    setStage(reduceMotion ? 5 : 0);
    setScenarioKey(nextScenario);
  };

  return <section ref={sectionRef} id="simulation" className="relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6 md:py-24">
    <div className="mx-auto max-w-3xl text-center"><motion.p variants={sectionEyebrowMotion} initial="hidden" whileInView="visible" viewport={sectionViewport} className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">WATCH THE DECISION HAPPEN</motion.p><motion.h2 variants={sectionHeadingMotion} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">One reply. One governed decision.</motion.h2><motion.p variants={sectionSubheadingMotion} initial="hidden" whileInView="visible" viewport={sectionViewport} className="mt-5 text-base text-[#888888] sm:text-lg">Follow a FrameLeads decision from message to route.</motion.p></div>

    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative mt-10 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1A1A1A] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.42)] sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">Decision workspace</p><p className="mt-1 text-sm font-semibold text-white">Inbound reply governance</p></div><div className="flex rounded-lg border border-white/[0.1] p-1" role="tablist" aria-label="Decision scenarios">{(["consequential", "routine"] as const).map((key) => <button key={key} type="button" role="tab" aria-selected={scenarioKey === key} onClick={() => selectScenario(key)} className={`rounded-md px-3 py-2 font-mono text-[9px] uppercase tracking-wider transition-colors ${scenarioKey === key ? "bg-[#FF5A1F] text-white" : "text-[#888888] hover:text-white"}`}>{scenarios[key].label}</button>)}</div></div>
      <div className="relative mt-5 hidden items-center justify-between px-3 lg:flex">{stageLabels.map((label, index) => <div key={label} className="flex flex-1 items-center last:flex-none"><div className={`relative z-10 grid h-5 w-5 place-items-center rounded-full border font-mono text-[7px] transition-colors ${stage >= index ? "border-[#FF5A1F] bg-[#FF5A1F] text-white shadow-[0_0_12px_rgba(255,90,31,.45)]" : "border-white/15 bg-[#1A1A1A] text-white/35"}`}>{index + 1}</div>{index < stageLabels.length - 1 && <div className="relative h-px flex-1 overflow-hidden bg-white/10"><motion.div animate={reduceMotion ? { width: stage > index ? "100%" : "0%" } : { width: stage > index ? "100%" : "0%" }} transition={{ duration: .35, ease: "easeOut" }} className="absolute inset-y-0 left-0 bg-[#FF5A1F] shadow-[0_0_8px_rgba(255,90,31,.8)]" /></div>}</div>)}</div>
      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[0.35fr_0.65fr]">
        <aside className="rounded-xl border border-white/[0.08] bg-black/15 p-4"><p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">Decision sequence</p><ol className="mt-3 space-y-1">{stageLabels.map((label, index) => <li key={label} className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${stage === index ? "bg-[#FF5A1F]/[0.08] text-white" : stage > index ? "text-white/65" : "text-white/30"}`}><span className={`grid h-5 w-5 place-items-center rounded-full border font-mono text-[8px] ${stage === index ? "border-[#FF5A1F] bg-[#FF5A1F] text-white" : "border-white/15"}`}>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol></aside>
        <div className="relative min-h-[28rem] overflow-hidden rounded-xl border border-white/[0.1] bg-[#242424] p-5 sm:p-6"><AnimatePresence mode="wait"><motion.div key={`${scenarioKey}-${stage}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: "easeOut" }}><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#FF5A1F]">{stageLabels[stage]}</p>{stage === 0 && <div className="mt-5"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Incoming reply</p><p className="mt-3 max-w-xl rounded-xl rounded-tl-sm border border-white/[0.08] bg-black/15 p-4 text-base leading-relaxed text-white/85">{scenario.reply}</p></div>}{stage === 1 && <div className="mt-5 max-w-lg rounded-xl border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.04] p-5"><DecisionRow label="Intent" value={scenario.intent} /><DecisionRow label="Confidence" value={scenario.confidence} /></div>}{stage === 2 && <div className="mt-5 max-w-lg rounded-xl border border-white/[0.08] bg-black/15 p-5"><DecisionRow label="Account" value={scenario.account} /><DecisionRow label="Campaign" value={scenario.campaign} /><DecisionRow label="Previous signal" value={scenario.signal} /></div>}{stage === 3 && <div className="mt-5 max-w-lg rounded-xl border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.04] p-5"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Matched operating rule</p><p className="mt-3 text-lg font-semibold leading-relaxed text-white">{scenario.rule}</p></div>}{stage === 4 && <div className="mt-5 max-w-lg rounded-xl border border-white/[0.08] bg-black/15 p-5"><DecisionRow label="Route" value={scenario.route} /><DecisionRow label="Decision status" value="Resolved" /></div>}{stage === 5 && <div className={`mt-5 max-w-lg rounded-xl border p-5 ${scenarioKey === "consequential" ? "border-[#FF5A1F]/35 bg-[#FF5A1F]/[0.05]" : "border-white/[0.14] bg-white/[0.03]"}`}><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Control applied</p><p className="mt-3 text-2xl font-bold text-white">Automation: <span className="text-[#FF5A1F]">{scenario.automation}</span></p><p className="mt-3 text-sm text-white/75">{scenario.control}</p><p className="mt-5 border-t border-white/[0.08] pt-4 font-mono text-[9px] uppercase tracking-wider text-white/50">Context preserved</p></div>}</motion.div></AnimatePresence></div>
      </div>
    </motion.div>
  </section>;
}
