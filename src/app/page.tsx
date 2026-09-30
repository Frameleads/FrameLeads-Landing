"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ExitIntentPopup from "../components/ExitIntentPopup";
import EmbeddedSandbox from "../components/EmbeddedSandbox";
import DecisionIntelligenceWalkthrough from "../components/DecisionIntelligenceWalkthrough";
import ResponsiveDecisionConvergence from "../components/ResponsiveDecisionConvergence";
import AuditModal from "../components/AuditModal";
import CleanBottleneckVisual from "../components/CleanBottleneckVisual";
import SectionIntro from "../components/SectionIntro";
import HeroIntro from "../components/HeroIntro";
import OperatingPath from "../components/OperatingPath";
import Navbar from "../components/Navbar";
import PipelineAudit, { type AuditResult } from "../components/PipelineAudit";
import VideoSection from "../components/VideoSection";

const CheckIcon = ({ className = "text-white" }: { className?: string }) => (
  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#888888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const CoreIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
    <polygon points="32,6 55,19 32,32 9,19" fill="#FF5A1F" />
    <polygon points="32,6 55,19 55,45 32,58 9,45 9,19" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M9 19 32 32 55 19M32 32V58" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const EnterpriseIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
    <path d="M13 52V31C13 16 21 8 32 8s19 8 19 23v21" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
    <path d="M19 50V31c0-10 5-16 13-16s13 6 13 16v19" fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const pricingCapabilities = [
  { capability: "Prospect capacity", coreDetail: "500 / month", enterpriseDetail: "20,000 / month", coreIncluded: true },
  { capability: "Omnichannel Sandbox", coreIncluded: true },
  { capability: "Outbound deployment", coreIncluded: true },
  { capability: "Inbox Triage", coreIncluded: true },
  { capability: "AI reply regeneration", coreIncluded: true },
  { capability: "Approve-and-send dispatch", coreIncluded: true },
  { capability: "Meeting booking & dispatch", coreIncluded: true },
  { capability: "High-intent signal scoring", coreIncluded: false },
  { capability: "Why-now & signal analysis", coreIncluded: false },
  { capability: "Governance dashboard", coreIncluded: false },
  { capability: "Approval-latency analytics", coreIncluded: false },
  { capability: "Institutional-memory metrics", coreIncluded: false },
] as const;

function PricingCapabilityList({ tier }: { tier: "core" | "enterprise" }) {
  return (
    <ul className="relative z-10 mb-8 flex-grow space-y-2.5">
      {pricingCapabilities.map((row, index) => {
        const included = tier === "enterprise" || row.coreIncluded;
        const detail = "coreDetail" in row ? (tier === "core" ? row.coreDetail : row.enterpriseDetail) : null;
        return (
          <li key={row.capability} className={`flex items-start gap-3 ${index === 7 ? "pt-2" : ""}`}>
            {included ? <CheckIcon className="text-white" /> : <CrossIcon />}
            <span className={`text-sm leading-relaxed ${included ? "text-white" : "text-[#888888]/70"}`}>{row.capability}{detail ? ` — ${detail}` : ""}</span>
          </li>
        );
      })}
    </ul>
  );
}

const faqs = [
  {
    question: "Does FrameLeads replace my SDR?",
    answer: "No. FrameLeads reduces repetitive operational decisions and keeps the workflow consistent. Consequential judgment can remain with your SDR, founder, or sales team.",
  },
  {
    question: "What if I already use another outbound platform?",
    answer: "Keep the infrastructure that already works. FrameLeads supports native execution and can sync approved campaigns with Smartlead and Instantly, depending on your package.",
  },
  {
    question: "Can FrameLeads operate without human approval?",
    answer: "Routine actions can continue through the configured workflow. Enterprise governance keeps human approval available for consequential or exceptional situations.",
  },
  {
    question: "What happens with ambiguous or high-consequence conversations?",
    answer: "They can be paused and routed for human review instead of being treated like routine automation. The relevant context stays attached to the decision.",
  },
  {
    question: "Do I need to rebuild my current workflow?",
    answer: "Not necessarily. FrameLeads is designed to connect the campaign, execution, and decision work around the systems you already use.",
  },
  {
    question: "Is FrameLeads only for companies whose salesperson left?",
    answer: "No. It also fits teams that want more controlled automation or want to centralize decision logic currently spread across people, prompts, and workflow tools.",
  },
  {
    question: "How is this different from connecting an LLM to my inbox myself?",
    answer: "An LLM can generate text. FrameLeads adds the surrounding operating system: campaign context, intent classification, next-action routing, supported execution, and—on Enterprise—human-review governance.",
  },
];

const architectureModules = [
  {
    visualIndex: 3,
    eyebrow: "01 — Understand",
    title: "Know what the prospect actually means.",
    feature: "Intent Classification",
    description: "Before anything moves, FrameLeads classifies what the prospect is actually asking for.",
    detail: "Classify before acting.",
  },
  {
    visualIndex: 0,
    eyebrow: "02 — Remember",
    title: "The sales context shouldn’t leave with the salesperson.",
    feature: "Persistent Context",
    description: "FrameLeads keeps the available campaign rules and conversation context attached to the decision—not trapped inside whoever happens to be watching the inbox.",
    detail: "The rep can change. The operating logic doesn’t have to.",
  },
  {
    visualIndex: 4,
    eyebrow: "03 — Decide",
    title: "Writing the reply is not the decision.",
    feature: "Governed Next-Action Routing",
    description: "A reply does not automatically deserve another reply. FrameLeads determines the next action from the intent, context, and rules available to it.",
    detail: "FrameLeads does not treat every reply as permission to automate.",
  },
  {
    visualIndex: 5,
    eyebrow: "04 — Control",
    title: "Automation needs boundaries.",
    feature: "Human Escalation",
    description: "Routine situations can continue. Consequential or ambiguous decisions stop for review.",
    detail: "Human attention stays reserved for decisions that require judgment.",
  },
];

const operatingSteps = [
  {
    number: "01",
    label: "Ingest",
    outcome: "Bring prospects into FrameLeads.",
    description: "Upload a lead list or receive prospects through your connected workflow. FrameLeads starts with the lead, offer and account context required for the campaign.",
  },
  {
    number: "02",
    label: "Generate",
    outcome: "Create campaign-ready outreach.",
    description: "Turn prospect, account and offer context into channel-specific messaging before execution.",
  },
  {
    number: "03",
    label: "Execute",
    outcome: "Launch through your outbound stack.",
    description: "Send through supported channels or deploy the prepared campaign into your connected outbound infrastructure.",
  },
  {
    number: "04",
    label: "Read",
    outcome: "Interpret every reply before acting.",
    description: "Once prospects respond, FrameLeads classifies the signal and applies the available campaign and conversation context.",
  },
  {
    number: "05",
    label: "Advance",
    outcome: "Move qualified intent forward.",
    description: "When the signal and workflow rules support it, FrameLeads moves the conversation into the appropriate follow-up, meeting, or next-action workflow.",
  },
  {
    number: "06",
    label: "Govern",
    outcome: "Keep authority over the exceptions.",
    description: "Ambiguous or consequential situations stop before being treated like routine automation, keeping human judgment where the workflow requires it.",
  },
];

function DisruptionVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-sm space-y-2 px-4">
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 opacity-60"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] font-mono text-[8px] text-[#888888]">LP</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] text-white/70">Newsletter unsubscribe</p><p className="font-mono text-[8px] text-[#555555]">Low priority · 2m ago</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#FF3333]/20 bg-[#FF3333]/[0.035] p-2.5 shadow-[0_0_20px_rgba(255,51,51,0.07)]"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#FF3333]/25 bg-[#FF3333]/10 font-mono text-[8px] text-[#FF3333]">HI</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">Ready to review pricing</p><p className="font-mono text-[8px] text-[#777777]">High-intent signal · 2h ago</p></div><span className="shrink-0 rounded-full border border-[#FF3333]/25 bg-[#FF3333]/10 px-2 py-1 font-mono text-[8px] text-[#FF3333]">Priority review</span></div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative flex w-full max-w-xs items-center justify-between px-5">
        <div className="absolute left-[26%] right-[26%] top-1/2 border-t-2 border-dashed border-[#FF5A1F]/30" />
        <span className="absolute left-1/2 top-1/2 z-20 h-4 w-7 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-transparent" />
        <div className="relative z-10 translate-y-3.5 text-center"><div className="grid h-14 w-14 place-items-center rounded-full border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 font-mono text-[9px] text-[#FF5A1F] shadow-[0_0_24px_rgba(255,90,31,0.14)]">INBOX</div><p className="mt-2 text-center font-mono text-[8px] uppercase leading-[1.25] text-[#FF5A1F]"><span className="block">Individual</span><span className="block">Context</span></p></div>
        <div className="relative z-10 grid h-14 w-16 place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-[9px] text-[#777777]">CRM</div>
        <span className="absolute bottom-[-1.25rem] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#FF5A1F]/20 bg-[#FF5A1F]/10 px-2 py-1 font-mono text-[8px] text-[#FF5A1F]">Context varies by owner</span>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3 px-4">
      <div className="rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/[0.035] p-4 text-center shadow-[0_0_18px_rgba(0,255,102,0.06)]"><p className="font-mono text-[8px] uppercase tracking-wider text-[#777777]">Routine reply</p><p className="mt-2 font-mono text-lg font-bold text-[#00FF66]">MOVE</p><p className="mt-1 text-[9px] text-[#00FF66]/70">Safe next action</p></div>
      <div className="rounded-xl border border-[#FF3333]/20 bg-[#FF3333]/[0.035] p-4 text-center shadow-[0_0_18px_rgba(255,51,51,0.06)]"><p className="font-mono text-[8px] uppercase tracking-wider text-[#777777]">Consequential reply</p><p className="mt-2 font-mono text-lg font-bold text-[#FF3333]">REVIEW</p><p className="mt-1 text-[9px] text-[#FF3333]/70">Human judgment</p></div>
    </div>
  );
}

function OperatingLoopDiagram({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative z-10 h-full w-full p-3 sm:p-5 lg:p-7">
      <div className="h-full min-h-[25rem] overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A] shadow-[0_18px_45px_rgba(0,0,0,0.45)] lg:min-h-0">
        <WalkthroughProductTopBar label={`${operatingSteps[activeStep].number} · ${operatingSteps[activeStep].label}`} />
        <AnimatePresence mode="wait">
          <motion.div key={activeStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.24, ease: "easeOut" }} className="flex min-h-[21rem] items-center justify-center p-4 sm:p-6 lg:min-h-[25rem]">
            <OperatingStepVisual step={activeStep} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WalkthroughRow({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return <div className={`grid gap-1 border-b px-1 py-3 last:border-b-0 sm:grid-cols-[7.5rem_1fr] sm:items-center ${active ? "border-[#FF5A1F]/25" : "border-white/[0.06]"}`}><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#888888]">{label}</p><p className={`text-sm font-medium ${active ? "text-[#FF5A1F]" : "text-white/80"}`}>{value}</p></div>;
}

function OperatingStepVisual({ step }: { step: number }) {
  if (step === 0) return <div className="w-full max-w-md"><div className="flex items-center justify-between"><div><p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">Source intake</p><p className="mt-1 truncate font-mono text-sm font-semibold text-white">Q3_Target_Accounts.csv</p></div><span className="rounded-lg border border-white/[0.08] bg-[#242424] px-2.5 py-1 font-mono text-[8px] text-[#888888]">CSV</span></div><div className="mt-4 rounded-xl border border-white/[0.07] bg-[#242424]/40 px-4"><WalkthroughRow label="Records" value="148 mapped" /><WalkthroughRow label="Context attached" value="Offer · Account · Channel" /><WalkthroughRow label="Validation" value="142 ready · 6 require review" /><WalkthroughRow label="Import status" value="Complete" active /></div></div>;
  if (step === 1) return <div className="w-full max-w-md"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Campaign workspace</p><p className="mt-1 text-sm font-semibold text-white">Q3 enterprise outreach</p></div><span className="font-mono text-[8px] uppercase text-[#FF5A1F]">Generated</span></div><div className="mt-3 rounded-lg border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.035] px-3 py-2"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Context loaded</p><p className="mt-1 text-xs font-medium text-white/80">Prospect · Account · Offer</p></div><div className="mt-4 flex border-b border-white/[0.07]"><span className="border-b-2 border-[#FF5A1F] px-3 pb-2 font-mono text-[8px] text-white">Email</span><span className="px-3 pb-2 font-mono text-[8px] text-[#888888]">LinkedIn</span></div><div className="mt-4 rounded-xl border border-white/[0.07] bg-[#242424]/70 p-4"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Message</p><p className="mt-3 text-xs leading-relaxed text-white/70">A channel-ready message prepared from the mapped prospect, account, and offer context.</p></div></div>;
  if (step === 2) return <div className="w-full max-w-md"><div className="border-b border-white/[0.07] pb-4"><p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">Campaign deployment</p><p className="mt-1 text-sm font-semibold text-white">Q3 Enterprise Outreach</p></div><div className="mt-3 rounded-xl border border-white/[0.07] bg-[#242424]/40 px-4"><WalkthroughRow label="Status" value="Ready" active /><WalkthroughRow label="Destination" value="Connected outbound workflow" /></div><button type="button" className="mt-5 h-10 w-full rounded-xl bg-[#FF5A1F] px-4 text-sm font-semibold text-white shadow-sm">Deploy campaign</button></div>;
  if (step === 3) return <div className="w-full max-w-md"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Inbox triage</p><p className="mt-1 text-sm font-semibold text-white">New prospect reply</p></div><span className="flex items-center gap-2 font-mono text-[8px] uppercase text-[#FF5A1F]"><span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />Classifying</span></div><div className="mt-4 rounded-xl border border-white/[0.07] bg-[#242424]/70 p-4 text-sm leading-relaxed text-white/75">Can you clarify the pricing before we schedule?</div><div className="mt-3 rounded-xl border border-white/[0.07] bg-[#242424]/40 px-4"><WalkthroughRow label="Intent" value="Pricing question" active /><WalkthroughRow label="Confidence" value="87%" /><WalkthroughRow label="Next" value="Evaluate route" /></div><div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: "87%" }} transition={{ duration: 0.55, ease: "easeOut" }} className="h-full rounded-full bg-[#FF5A1F]" /></div></div>;
  if (step === 4) return <div className="w-full max-w-md"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Next-action queue</p><p className="mt-1 text-sm font-semibold text-white">Qualified intent</p></div><span className="rounded-lg border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.05] px-2.5 py-1 font-mono text-[8px] uppercase text-[#FF5A1F]">Route selected</span></div><div className="mt-4 rounded-xl border border-[#FF5A1F]/25 bg-[#242424]/70 p-4"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Meeting workflow</p><p className="mt-2 text-lg font-semibold text-white">Discovery call requested</p><div className="mt-4 border-t border-white/[0.07] px-1"><WalkthroughRow label="Next action" value="Prepare meeting invite" active /><WalkthroughRow label="Status" value="Ready to dispatch" /></div></div></div>;
  return <div className="w-full max-w-md"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Governance queue</p><p className="mt-1 text-sm font-semibold text-white">Review required</p></div><span className="rounded-lg border border-white/[0.1] bg-[#242424] px-2.5 py-1 font-mono text-[8px] uppercase text-white/65">Paused</span></div><div className="mt-4 rounded-xl border border-[#FF5A1F]/25 bg-[#242424]/70 p-4"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Exception detected</p><p className="mt-2 text-sm font-semibold text-white">Custom commercial terms</p><div className="mt-4 border-t border-white/[0.07] px-1"><WalkthroughRow label="Route" value="Human review" active /><WalkthroughRow label="Automation" value="Paused" /><WalkthroughRow label="Context" value="Preserved" /></div></div></div>;
}

function ArchitectureVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="mx-auto w-full max-w-md rounded-xl border border-[#242424] bg-white/[0.03] p-4 shadow-2xl md:p-5">
          <div className="mx-auto flex h-20 w-16 flex-col items-center justify-center rounded-lg border border-[#242424] bg-[#090909] shadow-[0_0_30px_rgba(255,90,31,0.18)]">
            <div className="mb-2 h-1 w-7 rounded-full bg-[#333333]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#FF5A1F]">CSV</span>
          </div>
          <div className="mt-6 flex items-center justify-between font-mono text-[10px] text-[#888888]"><span>Mapping Data...</span><span className="text-[#FF5A1F]">100%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.03]"><div className="h-full w-full rounded-full bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.8)]" /></div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="grid h-[78%] w-full max-w-sm grid-cols-[0.8fr_1.2fr] overflow-hidden rounded-xl border border-[#242424] bg-white/[0.03] shadow-2xl">
          <div className="border-r border-[#242424] p-3 sm:p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#333333] bg-[#161616] font-mono text-[10px] text-[#FF5A1F]">CP</div>
            <div className="mt-4 h-2 w-3/4 rounded-full bg-[#888888]/40" />
            <div className="mt-2 h-1.5 w-1/2 rounded-full bg-[#888888]/20" />
            <div className="mt-5 space-y-2"><div className="h-1.5 w-full rounded-full bg-[#888888]/15" /><div className="h-1.5 w-4/5 rounded-full bg-[#888888]/15" /></div>
          </div>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between border-b border-[#242424] pb-3 font-mono text-[9px] uppercase tracking-wider text-[#888888]"><span>Email Draft</span><span className="text-[#FF5A1F]">Personalized</span></div>
            <div className="mt-4 space-y-3 font-mono text-[9px] leading-relaxed text-[#888888] sm:text-[10px]">
              <div className="h-1.5 w-11/12 rounded-full bg-[#888888]/30" />
              <p>Hi <span className="text-[#FF5A1F]">{"{{ first_name }}"}</span>, noticed your team is scaling <span className="text-[#FF5A1F]">outbound</span>.</p>
              <div className="h-1.5 w-full rounded-full bg-[#888888]/20" /><div className="h-1.5 w-4/5 rounded-full bg-[#888888]/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-52 w-full max-w-xs">
          <div className="absolute left-[42%] top-[34%] h-px w-[38%] origin-left rotate-[-24deg] bg-[#FF5A1F] shadow-[0_0_9px_rgba(255,90,31,0.65)]" />
          <div className="absolute left-[42%] top-[62%] h-px w-[38%] origin-left rotate-[24deg] bg-[#FF5A1F] shadow-[0_0_9px_rgba(255,90,31,0.65)]" />
          <div className="absolute left-0 top-1/2 z-10 flex h-20 w-24 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#FF5A1F]/40 bg-white/[0.03] font-mono text-[10px] font-bold text-[#FF5A1F] shadow-[0_0_28px_rgba(255,90,31,0.22)]">FrameLeads</div>
          <div className="absolute right-0 top-3 z-10 flex h-14 w-24 items-center justify-center rounded-xl border border-[#242424] bg-white/[0.03] font-mono text-[9px] text-[#AAAAAA]">Smartlead</div>
          <div className="absolute bottom-3 right-0 z-10 flex h-14 w-24 items-center justify-center rounded-xl border border-[#242424] bg-white/[0.03] font-mono text-[9px] text-[#AAAAAA]">Instantly</div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-[#242424] bg-white/[0.03] p-4 shadow-2xl sm:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Prospect reply</p>
          <div className="mt-3 rounded-xl rounded-tl-sm bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-white/75 sm:text-sm">Can you clarify the pricing before we schedule?</div>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.04] p-3"><dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Intent</dt><dd className="mt-1 text-xs font-semibold text-[#FF5A1F]">Pricing question</dd></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Confidence</dt><dd className="mt-1 text-xs font-semibold text-white">87%</dd></div>
            <div className="col-span-2 rounded-lg border border-white/10 bg-white/[0.025] p-3"><dt className="font-mono text-[8px] uppercase tracking-wider text-white/35">Next</dt><dd className="mt-1 text-xs font-semibold text-white/75">Evaluate route</dd></div>
          </dl>
        </div>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-white/[0.03] p-4 shadow-2xl sm:p-5">
          <div className="flex items-center justify-between border-b border-[#242424] pb-3">
            <div><div className="font-mono text-[9px] uppercase tracking-widest text-[#888888]">Available</div><div className="mt-1 text-sm font-bold text-white">Thursday, Aug 20</div></div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.06] font-mono text-sm font-bold text-[#FF5A1F]">✓</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">10:30 AM</button>
            <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">2:00 PM</button>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-[#FF5A1F]"><span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />Live calendar connected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-white/[0.03] p-5 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/15 bg-[#242424]">
          <div className="h-5 w-7 rounded-t-full border-2 border-b-0 border-white/55" /><div className="h-6 w-9 rounded-md bg-white/55" />
        </div>
        <div className="mt-5 inline-flex rounded-full border border-white/15 bg-[#242424] px-3 py-1.5 font-mono text-[9px] text-white/65 sm:text-[10px]">High-Stakes Reply Paused</div>
        <button type="button" className="mt-5 w-full rounded-lg bg-[#FF5A1F] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_22px_rgba(255,90,31,0.25)]">Approve &amp; Send</button>
      </div>
    </div>
  );
}

function ProductTopBar({ label }: { label: string }) {
  return <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#1A1A1A] px-4 py-3"><div className="flex gap-1.5" aria-hidden="true"><span className="h-1.5 w-1.5 rounded-full bg-white/15" /><span className="h-1.5 w-1.5 rounded-full bg-white/15" /><span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" /></div><span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">{label}</span></div>;
}

function WalkthroughProductTopBar({ label }: { label: string }) {
  return <div className="flex h-14 items-center justify-between border-b border-white/[0.07] bg-[#1A1A1A]/95 px-4 sm:px-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#FF5A1F] text-[10px] font-black text-white" aria-hidden="true">F</span><div className="min-w-0"><p className="text-[11px] font-semibold leading-none text-white">FrameLeads</p><p className="mt-1 truncate font-mono text-[7px] uppercase tracking-[0.14em] text-[#888888]">Operating workspace</p></div></div><div className="flex items-center gap-2"><span className="hidden h-1.5 w-1.5 rounded-full bg-[#FF5A1F] sm:block" aria-hidden="true" /><span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#888888]">{label}</span></div></div>;
}

function ContextCapabilityVisual() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#242424] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4"><div><p className="text-sm font-semibold text-white">Procre8</p><p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[#888888]">Account context dossier</p></div><span className="rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.05] px-3 py-1 font-mono text-[8px] uppercase tracking-wider text-[#FF5A1F]">Context attached</span></div>
      <dl className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {[["Campaign", "Q3 high-intent outreach"], ["Offer", "Reply workflow governance"], ["Previous signal", "Pipeline triage identified"], ["Available rule", "Pricing questions require review"], ["Contact", "Colin · Procre8"], ["Source", "Mapped account record"]].map(([label, value]) => <div key={label}><dt className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">{label}</dt><dd className="mt-1 text-xs leading-relaxed text-white/75">{value}</dd></div>)}
      </dl>
      <div className="mt-5 rounded-lg border border-white/[0.07] bg-[#1A1A1A] p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Incoming reply</p><p className="mt-2 text-xs text-white/70">Can you send more detail on how pricing works?</p></div>
    </div>
  );
}

function RoutingCapabilityVisual() {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#242424] p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#888888]">Decision / 01842</p><p className="mt-1 text-sm font-semibold text-white">Reply routing record</p></div><span className="h-2 w-2 rounded-full bg-[#FF5A1F]" aria-label="FrameLeads active" /></div>
      <dl className="mt-4 space-y-3">{[["Intent", "Pricing negotiation"], ["Account context", "Enterprise evaluation"], ["Rule matched", "Commercial negotiation requires approval"], ["Automation", "Paused"]].map(([label, value]) => <div key={label} className="grid gap-1 border-b border-white/[0.05] pb-3 sm:grid-cols-[8rem_1fr] sm:items-center"><dt className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">{label}</dt><dd className="text-xs text-white/70">{value}</dd></div>)}</dl>
      <div className="mt-4 rounded-lg border border-[#FF5A1F]/30 bg-[#1A1A1A] p-4"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Selected route</p><p className="mt-2 text-lg font-bold text-[#FF5A1F]">Founder review</p></div>
    </div>
  );
}

function ControlCapabilityVisual() {
  return (
    <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
      {[
        { id: "A", conversation: "Meeting confirmation", route: "Continue workflow", automation: "Active" },
        { id: "B", conversation: "Custom pricing request", route: "Human review", automation: "Paused" },
      ].map((record) => <div key={record.id} className="rounded-xl border border-white/[0.08] bg-[#242424] p-4"><div className="flex items-center justify-between"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Conversation {record.id}</p><span className={`h-1.5 w-1.5 rounded-full ${record.automation === "Active" ? "bg-[#FF5A1F]" : "border border-white/35"}`} aria-hidden="true" /></div><p className="mt-4 text-sm font-semibold text-white">{record.conversation}</p><dl className="mt-5 space-y-3 border-t border-white/[0.06] pt-4"><div><dt className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Route</dt><dd className="mt-1 text-xs text-white/75">{record.route}</dd></div><div><dt className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Automation</dt><dd className={`mt-1 text-xs font-semibold ${record.automation === "Active" ? "text-[#FF5A1F]" : "text-white/65"}`}>{record.automation}</dd></div></dl></div>)}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the inactive LegacyHome export.
function HeroDecisionVisual() {
  const reduceMotion = useReducedMotion();
  const rows = [
    ["Incoming reply", "Can you clarify the pricing before we schedule?"],
    ["Intent", "Pricing question"],
    ["Context", "Enterprise evaluation"],
    ["Rule matched", "Commercial terms require approval"],
  ];
  return <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: "easeOut", delay: 0.18 }} className="mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#1A1A1A] text-left shadow-[0_26px_56px_-22px_rgba(0,0,0,0.9)]"><div className="flex items-center justify-between border-b border-white/[0.07] bg-[#242424] px-4 py-3 sm:px-5"><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">FrameLeads / decision record</span><span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-wider text-[#FF5A1F]"><motion.span animate={reduceMotion ? {} : { opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.4, repeat: 1, repeatDelay: 4 }} className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />Processing</span></div><div className="grid min-w-0 gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-6"><div className="min-w-0">{rows.map(([label, value], index) => <div key={label}><motion.div initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.11, duration: 0.35 }} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:items-center"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#888888]">{label}</p><p className={`text-sm ${index === 1 || index === 3 ? "text-[#FF5A1F]" : "text-white/85"}`}>{value}</p></motion.div>{index < rows.length - 1 && <div className="relative ml-4 h-3 overflow-hidden sm:ml-[4.1rem]"><div className="h-full w-px bg-white/10" />{!reduceMotion && <motion.div initial={{ y: -12 }} animate={{ y: 12 }} transition={{ delay: 0.55 + index * 0.11, duration: 0.32, ease: "easeOut" }} className="absolute left-0 top-0 h-2 w-px bg-[#FF5A1F] shadow-[0_0_8px_rgba(255,90,31,0.9)]" />}</div>}</div>)}</div><motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, duration: 0.35 }} className="rounded-xl border border-[#FF5A1F]/30 bg-[#FF5A1F]/[0.06] p-4 sm:w-44"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">Decision</p><p className="mt-2 text-lg font-bold text-white">Human review</p><p className="mt-4 border-t border-[#FF5A1F]/20 pt-3 font-mono text-[9px] uppercase tracking-wider text-[#FF5A1F]">Automation: paused</p></motion.div></div></motion.div>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- retained for the inactive LegacyHome export below.
function ProblemPath({ items, accent = false }: { items: string[]; accent?: boolean }) {
  const reduceMotion = useReducedMotion();
  return <div className="rounded-2xl border border-white/[0.09] bg-[#1A1A1A] p-5 text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] sm:p-6"><div className="flex items-center justify-between"><p className={`font-mono text-[9px] uppercase tracking-[0.18em] ${accent ? "text-[#FF5A1F]" : "text-[#888888]"}`}>{accent ? "With FrameLeads" : "Without FrameLeads"}</p><span className={`h-2 w-2 rounded-full ${accent ? "bg-[#FF5A1F] shadow-[0_0_10px_rgba(255,90,31,0.85)]" : "bg-[#888888]"}`} /></div><div className="mt-5 flex flex-col gap-2">{items.map((item, index) => <div key={item}><motion.div animate={accent && !reduceMotion ? { borderColor: index === 1 ? "rgba(255,90,31,.48)" : "rgba(255,255,255,.1)" } : {}} transition={{ delay: index * .16, duration: .35 }} className={`rounded-lg border px-4 py-3 text-sm ${accent && index === 1 ? "border-[#FF5A1F]/35 bg-[#FF5A1F]/[0.06] font-semibold text-white" : "border-white/[0.08] bg-black/10 text-white/75"}`}>{item}</motion.div>{index < items.length - 1 && <div className="relative mx-auto h-5 w-px overflow-hidden"><div className={`h-full w-px ${accent ? "bg-[#FF5A1F]/55" : "bg-white/15"}`} />{!reduceMotion && <motion.div animate={{ y: [0, 20] }} transition={{ delay: index * .22, duration: accent ? .65 : 1.35, repeat: Infinity, repeatDelay: accent ? 2.5 : 3 }} className={`absolute left-0 top-0 h-2 w-px ${accent ? "bg-[#FF5A1F]" : "bg-white/45"}`} />}</div>}</div>)}</div>{accent && <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[8px] uppercase tracking-wider"><span className="rounded-md border border-green-400/20 bg-green-400/[0.04] px-2 py-2 text-green-300">Automate</span><span className="rounded-md border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.04] px-2 py-2 text-[#FF5A1F]">Approve</span><span className="rounded-md border border-white/[0.1] px-2 py-2 text-white/75">Escalate</span></div>}</div>;
}

function ProblemFlow() {
  return <CleanBottleneckVisual />;
}

function SolutionBridge() {
  return <ResponsiveDecisionConvergence />;
}

const compactFaqs = [
  ["Does FrameLeads replace my SDR?", "No. FrameLeads reduces repetitive decision work and keeps consequential judgment with your SDR, founder, or sales team."],
  ["Do I need Smartlead or Instantly to use FrameLeads?", "No. FrameLeads can run outbound natively. If you already use supported sending infrastructure, you can keep it and connect FrameLeads around the reply workflow."],
  ["Can FrameLeads operate without human approval?", "Routine actions can continue under your configured workflow. Ambiguous or consequential situations can pause for human review."],
  ["What happens with high-consequence conversations?", "FrameLeads preserves the relevant context, pauses automation when required, and routes the decision to the appropriate human."],
  ["How is this different from connecting an LLM to my inbox?", "An LLM can generate text. FrameLeads adds the operating layer around it: persistent context, decision rules, next-action routing, execution, and governance."],
] as const;

const pricingRows = {
  core: [["Prospect volume", "500 / month"], ["Reply intelligence", "Decision Engine + Inbox Triage"], ["Outbound execution", "Native Sandbox + Deploy"], ["Intelligence", "Scout + Memory + Brain + Playbook"], ["Control", "Human-reviewed workflow"]],
  enterprise: [["Prospect volume", "20,000 / month"], ["Reply intelligence", "Full Decision Intelligence"], ["Outbound execution", "Native + governed automation"], ["Governance", "Constitution + governance controls"], ["Operations", "Risk + SLA + outcome learning"]],
} as const;

function PricingCard({ tier }: { tier: "core" | "enterprise" }) {
  const enterprise = tier === "enterprise";
  const rows = pricingRows[tier];
  const extras = enterprise ? ["Everything in FrameLeads Core", "Custom Market Profiles", "Governance Overview", "Sales Constitution", "Governed Automation / Autopilot", "Revenue-at-Risk", "Response SLA", "Decision Sandbox", "Outcome Learning"] : ["Onboarding + campaign setup", "Lead ingestion", "Native Sandbox + AI generation", "Deploy / native outbound", "Built-in Market-Aware Messaging", "Scout", "ICP Profile + qualification", "Deep prospect research", "Prospect Memory", "FrameLeads Brain", "Revenue Playbook", "Inbox Triage", "Decision Engine / reply intelligence", "Decision Replay"];
  const href = enterprise ? "https://whop.com/checkout/plan_jdy5Z44fMKMAz" : "https://whop.com/checkout/plan_sAEhr77rTrhX4";
  return <article className={`relative overflow-hidden rounded-2xl border bg-[#1A1A1A] p-6 shadow-[0_24px_48px_-18px_rgba(0,0,0,0.8)] sm:p-8 ${enterprise ? "border-[#FF5A1F]/40" : "border-white/[0.1]"}`}><div className="relative z-10"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#FF5A1F]">{enterprise ? "Higher-volume architecture" : "Core operation"}</p><h3 className="mt-4 text-2xl font-bold text-white">FrameLeads {enterprise ? "Enterprise" : "Core"}</h3><p className="mt-2 text-sm leading-relaxed text-[#888888]">{enterprise ? "For higher-volume or more complex outbound operations." : "For founder-led and smaller outbound teams."}</p><p className={`mt-6 text-4xl font-bold ${enterprise ? "text-[#FF5A1F]" : "text-white"}`}>${enterprise ? "697" : "147"}<span className="ml-1 font-mono text-sm font-normal text-[#888888]">/ month</span></p><dl className="mt-7 border-t border-white/[0.07]">{rows.map(([label, value]) => <div key={label} className="grid gap-1 border-b border-white/[0.06] py-3 sm:grid-cols-[8rem_1fr]"><dt className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">{label}</dt><dd className="text-sm text-white/85">{value}</dd></div>)}</dl><details className="group mt-5"><summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.14em] text-[#FF5A1F] focus-visible:outline-none">See everything included</summary><ul className="mt-4 space-y-2 border-l border-white/[0.1] pl-4 text-sm text-white/65">{extras.map((extra) => <li key={extra}>{extra}</li>)}</ul></details><Link href={href} target="_blank" rel="noopener noreferrer" data-tripwire-guard="true" className={`mt-8 block w-full rounded-xl px-5 py-4 text-center text-sm font-bold transition-colors ${enterprise ? "bg-[#FF5A1F] text-white hover:bg-[#ff6b35]" : "border border-white/20 text-white hover:bg-white hover:text-black"}`}>Deploy FrameLeads {enterprise ? "Enterprise" : "Core"}</Link></div></article>;
}

export default function Home() {
  const [isAuditExpanded, setIsAuditExpanded] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const auditRef = useRef<HTMLElement>(null);
  const launchAudit = () => { setIsAuditExpanded(false); setIsAuditModalOpen(true); };

  return <div id="top" className="relative min-h-screen max-w-[100vw] overflow-x-hidden bg-[#111111] bg-grid-overlay font-sans text-white selection:bg-[#FF5A1F] selection:text-white"><Navbar onAuditClick={launchAudit} />
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:pt-32">
      <section className="mx-auto max-w-5xl text-center"><HeroIntro onAudit={launchAudit} /><motion.div initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .72, ease: "easeOut", delay: .46 }} className="mt-10"><VideoSection /></motion.div></section>

      <section id="problem" className="mx-auto mt-16 max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 text-center md:mt-24 md:py-24"><SectionIntro eyebrow="The gap" heading="Sending is automated. The decision after the reply is not." description="Most outbound stacks stop at the inbox, where someone still has to interpret the reply, apply context, and decide what happens next." /><ProblemFlow /></section>

      <section ref={auditRef} id="audit" className="scroll-mt-32"><AnimatePresence initial={false}>{isAuditExpanded && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="overflow-hidden"><div className="mx-auto mb-16 max-w-4xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#1A1A1A] p-6 shadow-2xl sm:p-10"><PipelineAudit onAuditComplete={setAuditResult} onClose={() => setIsAuditExpanded(false)} />{auditResult && <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#888888]">Diagnosis saved for this session</p>}</div></motion.div>}</AnimatePresence></section>

      <section id="solution" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 text-center md:py-24"><SectionIntro eyebrow="The decision layer" heading="FrameLeads sits between the reply and the next action." description="It combines reply intent, prospect and account context, and your operating rules to determine what should happen next and whether automation is allowed to continue." /><SolutionBridge /></section>

      <section id="capabilities" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 text-center md:py-24"><SectionIntro eyebrow="How FrameLeads works" heading="Understand. Remember. Decide. Control." className="max-w-2xl" /><DecisionIntelligenceWalkthrough /></section>

      <EmbeddedSandbox />

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 text-center md:py-24"><SectionIntro eyebrow="One operating path" heading="From lead to next action without the handoff gap." description="FrameLeads keeps campaign execution, reply intelligence, routing, and governance connected." /><OperatingPath /></section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 md:py-24"><SectionIntro eyebrow="Pricing" heading="Choose the level of control your operation needs." className="max-w-3xl" /><div className="mt-10 grid gap-6 lg:grid-cols-2"><PricingCard tier="core" /><PricingCard tier="enterprise" /></div></section>

      <section id="fit" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 md:py-24"><div className="rounded-2xl border border-white/[0.1] bg-[#1A1A1A] p-6 sm:p-8"><h2 className="mx-auto max-w-xl text-balance text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">Built for teams where the next decision matters.</h2><div className="mt-8 grid gap-8 md:grid-cols-2 md:divide-x md:divide-white/[0.08]"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">Strong fit if...</p><ul className="mt-5 space-y-3 text-sm text-white/80">{["You already run B2B outbound.", "Qualified replies create manual triage or routing work.", "Deal value makes careless automation unacceptable.", "You want automation without giving up human control."].map((item) => <li key={item} className="flex gap-3"><CheckIcon />{item}</li>)}</ul></div><div className="md:pl-8"><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#888888]">May be overkill if...</p><ul className="mt-5 space-y-3 text-sm text-white/65">{["Your outbound operation is not running yet.", "You receive very few qualified prospect conversations.", "You only need help writing emails."].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#888888]" />{item}</li>)}</ul></div></div></div></section>

      <section id="faq" className="mx-auto max-w-6xl scroll-mt-32 border-t border-white/[0.06] py-16 md:py-24"><SectionIntro eyebrow="Buying questions" heading="Clear before you deploy." className="max-w-3xl" /><div className="mt-10 space-y-3">{compactFaqs.map(([question, answer]) => <details key={question} className="group overflow-hidden rounded-xl border border-white/[0.1] bg-[#1A1A1A] [&_summary::-webkit-details-marker]:hidden"><summary className="flex cursor-pointer items-center justify-between gap-5 p-5 font-semibold text-white sm:p-6"><span>{question}</span><span className="shrink-0 text-[#FF5A1F] transition-transform group-open:rotate-180">↓</span></summary><p className="px-5 pb-5 text-sm leading-relaxed text-[#888888] sm:px-6 sm:pb-6">{answer}</p></details>)}</div></section>

      <section className="mx-auto max-w-4xl border-t border-white/[0.06] py-16 text-center md:py-24"><SectionIntro eyebrow="Next step" heading="See where your reply workflow becomes manual." description="Run the 3-question Reply Workflow Audit and identify where FrameLeads would sit in your operation." /><motion.button initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .5, delay: .34, ease: "easeOut" }} type="button" data-tripwire-guard="true" onClick={launchAudit} className="mt-8 rounded-xl bg-[#FF5A1F] px-7 py-4 text-base font-bold text-white transition-colors hover:bg-[#ff6b35]">Diagnose My Reply Workflow</motion.button></section>
    </main>
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#0D0D0D] px-4 py-10 sm:px-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row"><p className="font-mono text-[10px] uppercase tracking-widest text-[#888888]">© 2026 FrameLeads. A BrandFlow Studio Company.</p><a href="mailto:akram@frameleads.io" aria-label="Email FrameLeads support at akram@frameleads.io" className="font-mono text-[10px] uppercase tracking-widest text-[#888888] transition-colors hover:text-white">Support &amp; inquiries · akram@frameleads.io</a><div className="flex gap-6 font-mono text-[10px] uppercase tracking-widest text-[#888888]"><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/privacy" className="hover:text-white">Privacy</Link></div></div></footer><AuditModal open={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} onComplete={setAuditResult} /><ExitIntentPopup />
  </div>;
}

export function LegacyHome() {
  const [isAuditExpanded, setIsAuditExpanded] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const auditRef = useRef<HTMLDivElement>(null);

  const launchAudit = () => {
    setIsAuditExpanded(true);
    window.setTimeout(() => auditRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  return (
    <div id="top" className="relative min-h-screen max-w-[100vw] overflow-x-hidden bg-[#111111] bg-grid-overlay font-sans selection:bg-[#FF5A1F] selection:text-white">
      
      <Navbar onAuditClick={launchAudit} />

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-20 md:pb-16 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
        >
          <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A1F] sm:text-xs">
            FOR B2B TEAMS RUNNING HIGH-VALUE OUTBOUND
          </p>
          <h1 className="mb-8 text-4xl font-bold leading-[1.08] tracking-tighter text-white sm:mb-10 sm:text-5xl md:text-6xl lg:text-7xl">
            Your outbound is automated until someone replies.
          </h1>
          <p className="mb-8 text-2xl font-semibold tracking-tight text-white/80 sm:mb-10 sm:text-3xl md:text-4xl">Then the manual decision queue starts.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full"
        >
          <p className="mx-auto mb-10 max-w-4xl text-center text-lg font-light leading-relaxed text-gray-400 sm:text-xl">
            You can automate prospecting, sending, and follow-ups. But the moment a real prospect replies, someone still has to read the message, understand the intent, decide how important it is, decide what happens next, and know whether the response is safe to automate or needs human judgment. That decision layer is where outbound becomes manual again. FrameLeads was built to govern that layer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md md:w-auto"
        >
          <button type="button" data-tripwire-guard="true" onClick={launchAudit} className="inline-flex w-full max-w-md items-center justify-center rounded-xl bg-[#FF5A1F] px-8 py-4 text-center text-base font-bold text-white shadow-[0_0_35px_rgba(255,90,31,0.4)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98] md:w-auto md:px-10 md:py-5 md:text-lg">
            Diagnose My Reply Workflow
          </button>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#888888]">
            3 questions. No email required. See where manual routing is creating operational exposure.
          </p>
        </motion.div>

      </main>

      <section className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 py-12 sm:px-6 md:py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className="mx-auto mb-8 max-w-3xl text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">SEE FRAMELEADS IN ACTION</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">See the FrameLeads operating system in action.</h2>
        </motion.div>
        <VideoSection />
      </section>

      {/* SECTION 2 — THE DISRUPTION */}
      <section className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">You automated the campaign.<br />Not the decisions after the reply.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">
            Once a prospect answers, your system has to decide what the message means, how valuable it is, what context applies, what should happen next, and whether automation is safe. When those decisions live inside a human inbox, the workflow is still manual.
          </p>
        </motion.div>

        <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "The inbox sorts by time. Revenue doesn't.",
              text: "A low-value reply from two minutes ago can sit above a high-intent buying signal from two hours ago. Chronology is not prioritization.",
            },
            {
              title: "The context lives in people.",
              text: "Objection logic, account history, offer rules, and next-step judgment often change depending on who is watching the inbox.",
            },
            {
              title: "Speed isn't the only risk.",
              text: "Some replies can move automatically. Others involve pricing, legal, technical, or high-value decisions that should stop for human review.",
            },
          ].map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="relative isolate h-full overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
            >
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="relative z-10 grid h-full grid-rows-[10rem_1fr]">
                <div className="flex min-h-0 items-center justify-center overflow-hidden rounded-t-xl border-b border-white/[0.05]">
                  <DisruptionVisual index={index} />
                </div>
                <div className="flex min-h-0 flex-col justify-start px-6 pb-8 pt-6">
                  <h3 className="text-xl font-bold tracking-tight text-white">{card.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#888888] sm:text-sm">{card.text}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-12 max-w-3xl border-t border-white/5 pt-10 text-center text-lg font-medium leading-relaxed text-white sm:text-xl"
        >
          More leads don&apos;t remove a manual decision queue.<br />They feed it.
          <span className="mx-auto mt-4 block max-w-3xl text-sm font-normal text-gray-400 sm:text-base">Every new reply adds another manual decision. Scale the campaigns without fixing that layer, and you scale the queue.</span>
          <span className="mx-auto mt-2 block max-w-3xl font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-[#888888] sm:text-xs">Priority. Response. Routing. Escalation. Next action.</span>
        </motion.p>
      </section>

      {/* INLINE PIPELINE LEAK AUDIT */}
      <section id="audit" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 sm:px-6">
        <div
          ref={auditRef}
          aria-hidden={!isAuditExpanded}
          className={`overflow-hidden transition-all duration-700 ease-out ${isAuditExpanded ? "max-h-[2000px] py-16 opacity-100 md:py-24" : "pointer-events-none max-h-0 py-0 opacity-0"}`}
        >
          <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-700">
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
            <div className="relative z-10 p-6 sm:p-10">
              {isAuditExpanded && <PipelineAudit onAuditComplete={setAuditResult} onClose={() => setIsAuditExpanded(false)} />}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — POST-AUDIT DIAGNOSTIC BRIDGE */}
      <section id="leak-ledger" className="relative mx-auto w-full max-w-7xl scroll-mt-40 border-t border-white/5 px-4 py-16 sm:px-6 md:scroll-mt-44 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{auditResult ? "The bottleneck sits between the reply and the next action." : "What actually becomes manual after the reply?"}</h2>
          <p className="mt-5 text-base text-gray-400 sm:text-lg">{auditResult ? "Your numbers show how much deal activity still depends on a manual decision layer." : "That is the decision layer the Audit measures."}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-white/[0.15] bg-white/[0.03] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-[24px] sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative z-10">
            {(auditResult ? [
              ["Qualified conversations requiring a decision / month", auditResult.monthlyConversations.toLocaleString()],
              ["Manual triage time / year", `${auditResult.annualTriageHours.toLocaleString()} hours`],
              ["Pipeline value passing through the workflow / month", formatCurrency(auditResult.monthlyPipelineTouched)],
            ] : [
              ["READ", "Understand what the prospect actually means."],
              ["DECIDE", "Choose priority, response, and next action."],
              ["GOVERN", "Determine whether automation is safe or human judgment is required."],
            ]).map(([label, value]) => (
              <div key={label} className="grid gap-2 border-b border-white/5 py-5 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-8">
                <span className={`leading-relaxed ${auditResult ? "text-sm text-gray-400 sm:text-base" : "font-mono text-xs font-bold tracking-[0.18em] text-[#FF5A1F]"}`}>{label}</span>
                <span className={`leading-relaxed sm:text-right ${auditResult ? "font-mono text-lg font-bold tabular-nums text-white sm:text-xl" : "text-sm text-gray-300 sm:text-base"}`}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-4xl space-y-5 text-center text-base leading-relaxed text-gray-400 sm:text-lg"
        >
          {auditResult ? (
            <>
              <p>This is workflow exposure, not projected revenue. It shows how much activity still depends on someone manually interpreting and routing each conversation.</p>
              <p className="text-white">FrameLeads exists to govern that decision layer: classify intent, preserve context, move routine next actions, and stop consequential replies for human review.</p>
            </>
          ) : (
            <button type="button" data-tripwire-guard="true" onClick={launchAudit} className="font-bold text-[#FF5A1F] underline decoration-[#FF5A1F]/30 underline-offset-4 transition-colors hover:text-[#ff6b35]">Run My Reply Workflow Audit ↑</button>
          )}
        </motion.div>
      </section>

      {/* PRESCRIPTION + ARCHITECTURE PROOF */}
      <section id="solutions" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">THE PRESCRIPTION</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            The decision layer your outbound stack is missing.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">FrameLeads handles the decision work that begins when a prospect replies—understanding the signal, applying the right context, choosing the next action, and stopping decisions that require human judgment.</p>
          <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#1A1A1A] text-left shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
            <ProductTopBar label="Reply intake" />
            <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"><div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#888888]">Incoming reply</p><p className="mt-2 text-sm text-white/80">Can you clarify how this applies to our team?</p></div><span className="w-fit rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-[#FF5A1F]">FrameLeads active</span></div>
          </div>
        </motion.div>

        <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
          {architectureModules.map((module, index) => (
            <motion.article
              key={module.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`mx-auto grid w-full min-w-0 grid-cols-1 items-center gap-10 md:gap-14 lg:gap-20 ${index % 2 === 1 ? "md:grid-cols-[7fr_5fr]" : "md:grid-cols-[5fr_7fr]"}`}
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">{module.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{module.title}</h3>
                <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/45">{module.feature}</p>
                <p className="mt-5 text-base leading-relaxed text-gray-300 sm:text-lg">{module.description}</p>
                {index === 2 ? <p className="mt-7 border-l-2 border-[#FF5A1F] pl-4 font-semibold leading-relaxed text-white">{module.detail}</p> : <p className="mt-4 text-sm leading-relaxed text-gray-400 sm:text-base">{module.detail}</p>}
              </div>
              <div className={`relative min-h-[24rem] min-w-0 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1A1A1A] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.32)] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <ProductTopBar label={module.feature} />
                <div className="relative z-10 flex min-h-[20rem] items-center justify-center p-5 sm:p-7">
                  {index === 0 && <ArchitectureVisual index={module.visualIndex} />}
                  {index === 1 && <ContextCapabilityVisual />}
                  {index === 2 && <RoutingCapabilityVisual />}
                  {index === 3 && <ControlCapabilityVisual />}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </section>

      <EmbeddedSandbox />

      {/* OPERATING LOOP */}
      <section id="how-it-works" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">HOW IT WORKS</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">From prospect to meeting.<br />One continuous workflow.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">See how FrameLeads moves a prospect from source to next action without splitting the workflow into disconnected tools and decisions.</p>
        </motion.div>

        <div className="mt-12 grid min-w-0 grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-14">
          <div className="min-w-0">
            <div className="relative pl-5 sm:pl-6">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-white/10" />
              {operatingSteps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative border-b border-white/[0.06] last:border-b-0"
                >
                  <span className={`absolute -left-[1.42rem] top-6 h-2.5 w-2.5 rounded-full border transition-colors ${activeStep === index ? "border-[#FF5A1F] bg-[#FF5A1F]" : "border-white/20 bg-[#1A1A1A]"}`} aria-hidden="true" />
                  {activeStep === index && <span className="pointer-events-none absolute -left-5 top-4 h-10 w-px bg-[#FF5A1F] sm:-left-6" aria-hidden="true" />}
                  <button type="button" onClick={() => setActiveStep(index)} aria-expanded={activeStep === index} aria-controls={`operating-step-panel-${index}`} className="w-full rounded-sm py-4 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#FF5A1F]/60">
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${activeStep === index ? "text-[#FF5A1F]" : "text-[#888888]"}`}>{step.number} — {step.label}</span>
                    <span className="mt-1.5 block text-base font-bold text-white sm:text-lg">{step.outcome}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeStep === index && (
                      <motion.div id={`operating-step-panel-${index}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24, ease: "easeOut" }} className="overflow-hidden">
                        <p className="pb-5 text-sm leading-relaxed text-[#888888] sm:text-base">{step.description}</p>
                        <div className="mb-5 lg:hidden"><OperatingLoopDiagram activeStep={activeStep} /></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative hidden h-[34rem] min-w-0 w-full max-w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-[#1A1A1A] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] lg:flex"
            role="region"
            aria-live="polite"
            aria-label={`${operatingSteps[activeStep].label} product walkthrough`}
          >
            <OperatingLoopDiagram activeStep={activeStep} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-3xl border-t border-white/[0.06] px-4 pt-10 text-center sm:mt-20 sm:pt-12"
        >
          <p className="text-xl font-semibold leading-relaxed text-white sm:text-2xl">One lead. One context. One operating path from outreach to next action.</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">FrameLeads keeps generation, execution, reply intelligence, and governance connected instead of treating them as separate workflows.</p>
        </motion.div>
      </section>

      {/* DEPLOYMENT OPTIONS (SCALABLE PRICING) */}
      <div id="pricing" className="relative mx-auto mb-16 max-w-7xl scroll-mt-32 px-4 pt-16 sm:px-6 md:mb-24 md:pt-24 lg:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">BUILT TO FIT THE OPERATION</p>
          <h3 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Choose how much of the workflow you want FrameLeads to govern.</h3>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#888888] sm:text-lg">Start with the architecture that matches your current outbound operation. Expand when campaign volume, workflow complexity, or decision load increases.</p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="h-full"
          >
            <div className="relative isolate h-full overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-colors duration-300 hover:border-white/30 sm:p-8">
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="relative z-10 flex h-full flex-col">
              <div className="relative z-10 mb-6"><CoreIcon /></div>
              <h4 className="relative z-10 mb-2 text-2xl font-bold text-white">FrameLeads Core</h4>
              <p className="relative z-10 min-h-[3rem] text-sm leading-relaxed text-[#8A8A93]">
                For founder-led and smaller outbound operations that need execution and reply routing without building the workflow themselves.
              </p>
              <div className="relative z-10 mb-6 mt-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
                <span className="text-4xl font-bold text-white">$147</span>
                <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
              </div>
              <PricingCapabilityList tier="core" />
              <Link
                href="https://whop.com/checkout/plan_sAEhr77rTrhX4"
                target="_blank"
                rel="noopener noreferrer"
                data-tripwire-guard="true"
                className="relative z-10 mt-auto block w-full rounded-lg border border-white/15 px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
              >
                Deploy FrameLeads Core
              </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative isolate h-full"
          >
            <div className="relative isolate h-full overflow-hidden rounded-2xl border border-orange-500/40 bg-white/[0.02] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-500/50 sm:p-8">
              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(249,115,22,0.15),_transparent_60%)]" />
              <div className="relative z-10 flex h-full flex-col">
              <div className="relative z-10 mb-6"><EnterpriseIcon /></div>
              <h4 className="relative z-10 mb-2 text-2xl font-bold text-white">FrameLeads Enterprise</h4>
              <p className="relative z-10 min-h-[3rem] text-sm leading-relaxed text-[#8A8A93]">
                For higher-volume operations that need dedicated routing, deeper governance, and explicit human control over exceptions.
              </p>
              <div className="relative z-10 mb-6 mt-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
                <span className="text-4xl font-bold text-[#FF5A1F]">$697</span>
                <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
              </div>
              <PricingCapabilityList tier="enterprise" />
              <Link
                href="https://whop.com/checkout/plan_jdy5Z44fMKMAz"
                target="_blank"
                rel="noopener noreferrer"
                data-tripwire-guard="true"
                className="relative z-10 mt-auto block w-full rounded-lg bg-[#FF5A1F] px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_28px_rgba(255,90,31,0.35)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98]"
              >
                Deploy Full Architecture
              </Link>
              </div>
            </div>
          </motion.div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-[#8A8A93]">Core covers the active execution and reply workflow. Enterprise adds the scale, signal scoring, dedicated routing, and human-approval governance required by more complex operations.</p>
      </div>

      <section className="mx-auto max-w-7xl border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl text-center"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">FITS THE OPERATION YOU ALREADY HAVE</p><h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">FrameLeads doesn&apos;t need to replace everything around it.</h2><p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[#888888]">Keep the parts of your outbound stack that already work. FrameLeads connects campaign execution with the context, routing, and governance around what happens next.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{[
          ["Already have an SDR?", "Human capacity and decision infrastructure solve different problems. FrameLeads reduces repetitive operational decisions while keeping consequential judgment with the team."],
          ["Already use outbound software?", "Keep supported sending infrastructure in place. FrameLeads connects the campaign workflow with the decision logic surrounding execution, replies, and next actions."],
          ["Already use AI?", "Generating text is only part of the workflow. FrameLeads adds structured context, routing, and governance around what the system should do next."],
        ].map(([title, copy]) => <article key={title} className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6"><h3 className="text-lg font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#888888]">{copy}</p></article>)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        <div className="rounded-2xl border border-white/[0.1] bg-[#1A1A1A] p-6 sm:p-8"><h2 className="mx-auto max-w-3xl text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">FrameLeads is built for outbound operations where the next decision matters.</h2><div className="mt-8 grid gap-8 md:grid-cols-2 md:divide-x md:divide-white/[0.08]"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">A STRONG FIT IF...</p><ul className="mt-5 space-y-3 text-sm text-white/80">{["You already run B2B outbound", "Qualified prospect conversations create manual triage or routing work", "Deal value makes careless automation unacceptable", "You want automation without surrendering human control"].map((item) => <li key={item} className="flex gap-3"><CheckIcon />{item}</li>)}</ul></div><div className="md:pl-8"><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#888888]">IT MAY BE OVERKILL IF...</p><ul className="mt-5 space-y-3 text-sm text-white/65">{["Your outbound operation is not running yet", "You receive very few qualified conversations", "You only need a basic email-writing tool"].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#888888]" />{item}</li>)}</ul></div></div></div>
      </section>

      {/* EXECUTIVE BRIEFING (FAQ SPLIT LAYOUT) */}
      <div id="faq" className="mx-auto mb-16 max-w-7xl scroll-mt-32 border-t border-white/5 px-4 pt-12 sm:px-6 md:mb-20 md:pt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Left Column (Sticky Header) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="self-start space-y-6 md:sticky md:top-32 md:col-span-1"
          >
            <div className="font-mono text-xs text-[#FF5A1F] uppercase tracking-widest">BUYING QUESTIONS</div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Clear before you deploy.</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed">Practical answers about fit, control, and how FrameLeads works with the operation you already have.</p>
          </motion.div>

          {/* Right Column (Accordions) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4 md:col-span-2"
          >
            {faqs.map((faq) => (
              <details key={faq.question} className="group relative overflow-hidden rounded-2xl border border-white/[0.15] bg-white/[0.03] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-[24px] [&_summary::-webkit-details-marker]:hidden">
                <summary className="relative z-10 flex cursor-pointer select-none items-center justify-between gap-5 p-6 font-bold text-white sm:text-lg">
                  <span>{faq.question}</span>
                  <span className="shrink-0 text-[#FF5A1F] transition-transform group-open:rotate-180">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="relative z-10 px-6 pb-6 text-sm leading-relaxed text-[#8A8A93]">{faq.answer}</div>
              </details>
            ))}
          </motion.div>
        </div>
      </div>

      <section id="commercial-close" className="mx-auto max-w-5xl border-t border-white/5 px-4 py-16 text-center sm:px-6 md:py-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">THE DIAGNOSIS IS CLEAR</p>
        <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Remove the manual decision layer from your outbound workflow.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#888888] sm:text-lg">Put FrameLeads between the conversation and the next action.</p>
        <Link href="https://whop.com/checkout/plan_jdy5Z44fMKMAz" target="_blank" rel="noopener noreferrer" data-tripwire-guard="true" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FF5A1F] px-8 py-3.5 font-bold text-white transition-colors hover:bg-[#ff6b35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]">Deploy FrameLeads</Link>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#0D0D0D] py-12 px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Copyright */}
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="FrameLeads Logo" width={20} height={20} className="opacity-40 grayscale rounded-[4px]" />
            <span className="font-mono text-[10px] text-[#8A8A93] tracking-widest uppercase">
              © 2026 FrameLeads. A BrandFlow Studio Company.
            </span>
          </div>

          <p className="sr-only">FrameLeads is a B2B revenue decision intelligence platform for outbound sales teams.</p>

          {/* Legal */}
          <div className="flex items-center gap-6 font-mono text-[10px] text-[#5A5A63] tracking-widest uppercase">
            <Link href="/terms" className="hover:text-[#8A8A93] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#8A8A93] transition-colors">Privacy</Link>
          </div>
          
        </div>
      </footer>

      <ExitIntentPopup />
    </div>
  );
}
