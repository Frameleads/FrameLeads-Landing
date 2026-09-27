"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Capability = {
  id: string;
  number: string;
  label: string;
  question: string;
};

const capabilities: Capability[] = [
  { id: "understand", number: "01", label: "Intent Classification", question: "What does this reply mean?" },
  { id: "remember", number: "02", label: "Persistent Context", question: "What do we know about this prospect and account?" },
  { id: "decide", number: "03", label: "Next-Action Routing", question: "What should happen next?" },
  { id: "control", number: "04", label: "Human Escalation", question: "Can automation proceed, or should a human step in?" },
];

function Field({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="border-b border-white/[0.06] py-3 last:border-b-0 sm:grid sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-4"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#888888]">{label}</p><p className={`mt-1 text-sm font-medium sm:mt-0 ${accent ? "text-[#FF5A1F]" : "text-white/80"}`}>{value}</p></div>;
}

function CapabilityVisual({ id }: { id: string }) {
  if (id === "understand") {
    return <div className="w-full max-w-lg rounded-xl border border-white/[0.09] bg-[#242424] p-5 shadow-2xl sm:p-6"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#888888]">Incoming reply</p><p className="mt-3 rounded-xl rounded-tl-sm border border-white/[0.07] bg-black/15 p-4 text-sm leading-relaxed text-white/80">Can you clarify the pricing before we schedule?</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.05] p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Intent</p><p className="mt-1 text-sm font-semibold text-[#FF5A1F]">Pricing question</p></div><div className="rounded-lg border border-white/[0.08] bg-black/10 p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Confidence</p><p className="mt-1 text-sm font-semibold text-white">87%</p></div></div></div>;
  }

  if (id === "remember") {
    return <div className="w-full max-w-lg rounded-xl border border-white/[0.09] bg-[#242424] p-5 shadow-2xl sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4"><div><p className="text-base font-semibold text-white">Enterprise evaluation</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[#888888]">Context dossier</p></div><span className="rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.05] px-3 py-1 font-mono text-[8px] uppercase tracking-wider text-[#FF5A1F]">Context attached</span></div><div className="mt-3"><Field label="Account" value="Procre8" /><Field label="Campaign" value="Q3 outreach" /><Field label="Prior signal" value="High intent" /><Field label="Available rule" value="Pricing requires approval" accent /></div></div>;
  }

  if (id === "decide") {
    return <div className="w-full max-w-lg rounded-xl border border-white/[0.09] bg-[#242424] p-5 shadow-2xl sm:p-6"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">Decision record / 01842</p><p className="mt-1 text-base font-semibold text-white">Reply routing</p></div><span className="h-2 w-2 rounded-full bg-[#FF5A1F]" /></div><div className="mt-3"><Field label="Intent" value="Pricing question" /><Field label="Context" value="Enterprise evaluation" /><Field label="Rule matched" value="Commercial terms require approval" /><Field label="Selected route" value="Founder review" accent /></div></div>;
  }

  return <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">{[{ title: "Routine reply", reply: "Meeting confirmation", state: "Automation active", route: "Continue workflow", accent: true }, { title: "Consequential reply", reply: "Custom pricing request", state: "Automation paused", route: "Human review", accent: false }].map((item) => <div key={item.title} className="rounded-xl border border-white/[0.09] bg-[#242424] p-5 shadow-2xl"><div className="flex items-center justify-between"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#888888]">{item.title}</p><span className={`h-2 w-2 rounded-full ${item.accent ? "bg-[#FF5A1F]" : "border border-white/50"}`} /></div><p className="mt-5 text-sm font-semibold text-white">{item.reply}</p><div className="mt-5 border-t border-white/[0.06] pt-4"><p className={`font-mono text-[9px] uppercase tracking-wider ${item.accent ? "text-[#FF5A1F]" : "text-white/65"}`}>{item.state}</p><p className="mt-2 text-sm text-white/75">{item.route}</p></div></div>)}</div>;
}

export default function CapabilityTabs() {
  const [activeId, setActiveId] = useState(capabilities[0].id);
  const active = capabilities.find((capability) => capability.id === activeId) ?? capabilities[0];

  return <div className="mt-10 grid gap-5 lg:grid-cols-[0.38fr_0.62fr] lg:gap-8"><div role="tablist" aria-label="FrameLeads capabilities" className="grid gap-2">{capabilities.map((capability) => <button key={capability.id} id={`${capability.id}-tab`} role="tab" type="button" aria-selected={activeId === capability.id} aria-controls={`${capability.id}-panel`} onClick={() => setActiveId(capability.id)} className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] ${activeId === capability.id ? "border-[#FF5A1F]/35 bg-[#FF5A1F]/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"}`}><span className={`font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${activeId === capability.id ? "text-[#FF5A1F]" : "text-[#888888]"}`}>{capability.number} / {capability.label}</span><span className="mt-2 block text-sm font-semibold text-white">{capability.question}</span></button>)}</div><div id={`${active.id}-panel`} role="tabpanel" aria-labelledby={`${active.id}-tab`} className="flex min-h-[25rem] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1A1A1A] p-5 shadow-[0_22px_48px_-18px_rgba(0,0,0,0.8)] sm:p-8"><AnimatePresence mode="wait"><motion.div key={active.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24, ease: "easeOut" }} className="w-full"><p className="mb-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#FF5A1F]">{active.label}</p><CapabilityVisual id={active.id} /></motion.div></AnimatePresence></div></div>;
}
