"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import ExitIntentPopup from "../components/ExitIntentPopup";
import EmbeddedSandbox from "../components/EmbeddedSandbox";
import Navbar from "../components/Navbar";
import PipelineAudit from "../components/PipelineAudit";
import VideoSection from "../components/VideoSection";

const CheckIcon = ({ className = "text-white" }: { className?: string }) => (
  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = ({ className = "text-gray-600" }: { className?: string }) => (
  <svg className={`mt-0.5 h-5 w-5 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

const faqs = [
  {
    question: "Does this replace my existing sending tools (Smartlead/Instantly)?",
    answer: "FrameLeads is the governed control layer. It executes natively across Email and LinkedIn—but for massive volume, it plugs directly into your existing sending stack via API.",
  },
  {
    question: "What prevents the AI from hallucinating and burning a $50k deal?",
    answer: "Our Velvet Rope Governance. The AI is authorized to handle standard routing autonomously. However, the moment it detects a high-stakes, complex objection, it pauses the automation and routes the drafted reply to your queue for 1-click manual approval.",
  },
  {
    question: "Why shouldn't I just hire another human SDR?",
    answer: "Humans sleep, suffer from fatigue, and eventually quit—taking your pipeline context with them. FrameLeads is permanent infrastructure. It operates 24/7 and never forgets an objection-handling rule.",
  },
  {
    question: "Do I need to be a developer to set this up?",
    answer: "No. We engineered this for founders, not engineers. If you can drag and drop a CSV file and flip a toggle switch, you can deploy the entire architecture in under 10 minutes.",
  },
  {
    question: "What happens if I hit my tier limit mid-month?",
    answer: "The system pauses gracefully. We do not auto-charge surprise overage fees. You will receive an alert to upgrade your tier, ensuring you always maintain absolute control over your spend.",
  },
];

const architectureModules = [
  {
    title: "Connect Any Lead Source",
    headline: "Bring the signal. Leave the cleanup.",
    description: "Upload a CSV or connect a webhook. FrameLeads maps the rest.",
    tags: ["• CSV uploaded", "• Webhook active"],
  },
  {
    title: "The Execution Sandbox",
    headline: "Generate, test, and send without leaving the screen.",
    description: "Inspect channel-ready outreach and execute it natively.",
    tags: ["• Send via Email", "• Send via LinkedIn"],
  },
  {
    title: "1-Click Deployment",
    headline: "Prove the message here. Scale it everywhere.",
    description: "Push approved campaigns directly to your sending stack.",
    tags: ["• Smartlead connected", "• Instantly connected"],
  },
  {
    title: "Native Inbox Triage",
    headline: "Every reply gets a decision—not a queue.",
    description: "Intent is scored and the next action is routed in real time.",
    tags: ["• Intent score: 94", "• Status: Meeting-ready"],
  },
  {
    title: "Zero-Click Concierge",
    headline: "Turn \"interested\" into \"invited.\"",
    description: "Qualified intent becomes a live calendar invitation.",
    tags: ["• Calendar connected", "• Meeting secured"],
  },
  {
    title: "Velvet Rope Governance",
    headline: "Automate the routine. Protect the consequential.",
    description: "Complex replies stop for human approval before sending.",
    tags: ["• Approve & Send", "• Keep Quarantined"],
  },
];

const operatingSteps = [
  {
    number: "01",
    title: "Ingest",
    description: "Upload a CSV or receive the lead by webhook.",
  },
  {
    number: "02",
    title: "Generate",
    description: "Create channel-specific outreach from the lead, offer, and account context.",
  },
  {
    number: "03",
    title: "Execute",
    description: "Send natively by email or LinkedIn—or deploy the verified campaign to Smartlead or Instantly.",
  },
  {
    number: "04",
    title: "Read",
    description: "Monitor replies and assign an intent score from 1-100.",
  },
  {
    number: "05",
    title: "Advance",
    description: "Dispatch the meeting invite when intent clears your threshold.",
  },
  {
    number: "06",
    title: "Govern",
    description: "Quarantine ambiguity, preserve context, and put high-value exceptions in front of a human.",
  },
];

function DisruptionVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-sm space-y-2 px-4">
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 opacity-60"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] font-mono text-[8px] text-[#888888]">LP</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] text-white/70">Newsletter unsubscribe</p><p className="font-mono text-[8px] text-[#555555]">Low priority · 2m ago</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-2.5 shadow-[0_0_22px_rgba(239,68,68,0.08)]"><span className="grid h-7 w-7 place-items-center rounded-full border border-red-500/20 bg-red-500/10 font-mono text-[8px] text-red-400">$50K</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">Ready to review pricing</p><p className="font-mono text-[8px] text-[#777777]">High-intent deal</p></div><span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 font-mono text-[8px] text-red-400">[ Delayed 14hrs ]</span></div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative flex w-full max-w-xs items-center justify-between px-5">
        <div className="absolute left-[26%] right-[26%] top-1/2 border-t-2 border-dashed border-red-500/30" />
        <span className="absolute left-1/2 top-1/2 z-20 h-4 w-7 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-transparent" />
        <div className="relative z-10 text-center"><div className="grid h-14 w-14 place-items-center rounded-full border border-red-500/30 bg-red-500/10 font-mono text-[9px] text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.14)]">SDR_01</div><p className="mt-2 font-mono text-[8px] uppercase text-red-400">Offline</p></div>
        <div className="relative z-10 grid h-14 w-16 place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-[9px] text-[#777777]">CRM</div>
        <span className="absolute bottom-[-1.25rem] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 font-mono text-[8px] text-red-400">Context connection lost</span>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3 px-4">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 text-center shadow-[0_0_22px_rgba(52,211,153,0.08)]"><p className="font-mono text-[8px] uppercase tracking-wider text-[#777777]">Response Time</p><p className="mt-2 font-mono text-2xl font-bold text-emerald-400">9m</p><p className="mt-1 text-[9px] text-emerald-400/70">Best rep</p></div>
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4 text-center shadow-[0_0_22px_rgba(239,68,68,0.08)]"><p className="font-mono text-[8px] uppercase tracking-wider text-[#777777]">Response Time</p><p className="mt-2 font-mono text-2xl font-bold text-red-400">9h</p><p className="mt-1 text-[9px] text-red-400/70">Newest rep</p></div>
    </div>
  );
}

function StopgapVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-xs rounded-xl border border-red-500/20 bg-white/[0.03] p-4 shadow-2xl">
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#777777]"><span>Task Queue</span><span className="font-bold text-red-400">100%</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full w-full rounded-full bg-gradient-to-r from-[#FF5A1F] to-red-500 shadow-[0_0_16px_rgba(239,68,68,0.55)]" /></div>
        <div className="mt-4 flex justify-center"><span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono text-[9px] text-red-400">[ Warning: High Burnout ]</span></div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
        <div className="rounded-xl rounded-tl-sm bg-white/[0.06] p-3 text-[10px] leading-relaxed text-white/55">Absolutely—we can guarantee the enterprise plan at <mark className="bg-red-500/20 px-1 text-red-300">$99 forever</mark>.</div>
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-red-500/30 bg-[#220d0d] px-3 py-1.5 font-mono text-[8px] text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.22)]">[ ! ] Hallucinated Pricing Detected</span>
      </div>
    );
  }

  return (
    <div className="relative flex w-full max-w-sm items-center justify-between px-3">
      <div className="absolute left-[15%] right-[15%] top-1/2 border-t-2 border-[#333333]" />
      <div className="absolute left-[44%] top-1/2 z-10 h-3 w-[12%] -translate-y-1/2 bg-transparent" />
      {["LEAD", "WEBHOOK", "CRM"].map((node, nodeIndex) => <div key={node} className={`relative z-20 grid h-12 w-16 place-items-center rounded-lg border bg-white/[0.03] font-mono text-[8px] ${nodeIndex === 1 ? "border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.12)]" : "border-white/10 text-[#777777]"}`}>{node}</div>)}
      <span className="absolute left-1/2 top-[78%] z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-red-500/30 bg-[#220d0d] px-2 py-1 font-mono text-[8px] text-red-400 animate-pulse">Webhook Failed</span>
    </div>
  );
}

function OperatingLoopDiagram() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
      <div className="pointer-events-none absolute bottom-20 left-1/2 top-20 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-400/35 via-[#FF5A1F]/50 to-emerald-400/35" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-sm rounded-xl border border-emerald-500/20 bg-[#090909]/90 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#666666]">Source intake</p>
            <p className="mt-2 font-mono text-sm font-semibold text-white">Q3_High_Intent_Leads.csv</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] text-emerald-400">✓ CSV Uploaded</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-[#FF5A1F]/20 bg-[#090909]/95 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        <div className="text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF5A1F]">Routing layer</p>
          <h3 className="mt-2 text-lg font-bold text-white">Intent Scoring Engine</h3>
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[9px] text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-[#FF5A1F]" />Signal classified · Score 94</div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-5">
          <div className="pointer-events-none absolute left-1/4 right-1/4 -top-4 border-t border-[#FF5A1F]/35" />
          <div className="rounded-xl border border-white/10 bg-[#121212] p-4 text-center"><span className="font-mono text-[10px] text-white/65">EMAIL</span><p className="mt-2 text-xs text-[#888888]">Native send ready</p></div>
          <div className="rounded-xl border border-white/10 bg-[#121212] p-4 text-center"><span className="font-mono text-[10px] text-white/65">LINKEDIN</span><p className="mt-2 text-xs text-[#888888]">Zero-ban handoff</p></div>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-sm rounded-xl border border-emerald-500/25 bg-[#090909]/95 p-5 shadow-[0_0_28px_rgba(52,211,153,0.08),0_18px_45px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3 shrink-0"><span className="absolute -inset-1 rounded-full bg-emerald-400/30 blur-sm" /><span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" /></span>
          <div><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/70">Advance complete</p><p className="mt-1 font-mono text-sm font-semibold text-white">[ Calendar Invite Dispatched ]</p></div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-white/[0.03] p-5 shadow-2xl">
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
          <div className="w-[88%] rounded-2xl rounded-tl-sm bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/75 sm:text-sm">Sounds interesting—do you have time Tuesday?</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[9px] text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.12)]">[ Intent: Meeting Ready ]</span>
          </div>
          <div className="mt-4 flex w-fit items-center gap-1 rounded-full border border-[#242424] bg-white/[0.03] px-3 py-2">
            {[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#888888]" style={{ animationDelay: `${dot * 150}ms` }} />)}
          </div>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 font-mono text-sm font-bold text-emerald-400">✓</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">10:30 AM</button>
            <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">2:00 PM</button>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />Live calendar connected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-white/[0.03] p-5 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 shadow-[0_0_28px_rgba(239,68,68,0.2)]">
          <div className="h-5 w-7 rounded-t-full border-2 border-b-0 border-red-500" /><div className="h-6 w-9 rounded-md bg-red-500" />
        </div>
        <div className="mt-5 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 font-mono text-[9px] text-red-400 sm:text-[10px]">High-Stakes Reply Paused</div>
        <button type="button" className="mt-5 w-full rounded-lg bg-[#FF5A1F] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_22px_rgba(255,90,31,0.25)]">Approve &amp; Send</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [isAuditExpanded, setIsAuditExpanded] = useState(false);
  const [customLeak, setCustomLeak] = useState<number | null>(null);
  const auditRef = useRef<HTMLDivElement>(null);

  const launchAudit = () => {
    setIsAuditExpanded(true);
    window.setTimeout(() => auditRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const hasCustomLeak = customLeak !== null;
  const firstLeakShare = hasCustomLeak ? Math.round(customLeak * 0.3) : 12000;
  const secondLeakShare = hasCustomLeak ? Math.round(customLeak * 0.45) : 18000;
  const thirdLeakShare = hasCustomLeak ? customLeak - firstLeakShare - secondLeakShare : 10000;
  const leakLedgerRows = [
    ["Leads ignored past the 48-hour intent window", firstLeakShare],
    ["Follow-ups that quietly never happened", secondLeakShare],
    ["High-intent signals nobody scored or noticed", thirdLeakShare],
  ] as const;

  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-[#111111] bg-grid-overlay font-sans selection:bg-[#FF5A1F] selection:text-white">
      
      <Navbar onAuditClick={launchAudit} />

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-12 pt-28 text-center sm:px-6 sm:pt-32 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
        >
          <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A1F] sm:text-xs">
            THE VELVET ROPE PROTOCOL - FOR $10K+ DEAL FLOW
          </p>
          <h1 className="mb-8 text-4xl font-bold leading-[1.08] tracking-tighter text-white sm:mb-10 sm:text-5xl md:text-6xl lg:text-7xl">
            Your SDR team isn&apos;t a growth function. It&apos;s a liability with a payroll.
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full"
        >
          <p className="mx-auto mb-10 max-w-4xl text-center text-lg font-light leading-relaxed text-gray-400 sm:text-xl">
            Every human-routed reply, every &apos;I&apos;ll get to it after lunch,&apos; every overnight cold-down—that&apos;s not a staffing problem. That&apos;s capital leaving your business, hour by hour, while you pay someone to watch it happen. FrameLeads replaces manual routing with an autonomous execution layer that reads intent, drafts the reply, sends it natively, and books the meeting—before your best rep would have finished reading the email.
          </p>
        </motion.div>

        <VideoSection />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md md:w-auto"
        >
          <button type="button" data-tripwire-guard="true" onClick={launchAudit} className="inline-flex w-full max-w-md items-center justify-center rounded-xl bg-[#FF5A1F] px-8 py-4 text-center text-base font-bold text-white shadow-[0_0_35px_rgba(255,90,31,0.4)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98] md:w-auto md:px-10 md:py-5 md:text-lg">
            Run a Pipeline Leak Audit
          </button>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#888888]">
            Free 3-question interactive audit. Discover exactly how much revenue is trapped in manual routing.
          </p>
        </motion.div>

      </main>

      {/* SECTION 2 — THE DISRUPTION */}
      <section className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">You didn&apos;t lose those leads. You spent money to lose them slower.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">
            You already built a system. A rep checks the inbox. A rep drafts the reply. A rep updates the CRM. A rep — eventually — books the call. That&apos;s not infrastructure. That&apos;s a single point of failure with a salary, a sick day, and a two-week notice.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "It's slow by design.",
              text: "They triage by 'what's on top,' not by what's about to close.",
            },
            {
              title: "It's fragile by design.",
              text: "One rep quits, and every objection-handling pattern walks out the door.",
            },
            {
              title: "It's inconsistent by design.",
              text: "Your best rep replies in nine minutes. Your newest rep replies in nine hours.",
            },
          ].map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="relative isolate h-[18rem] overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
            >
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex h-40 shrink-0 items-center justify-center overflow-hidden rounded-t-xl border-b border-white/[0.05]">
                  <DisruptionVisual index={index} />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
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
          You don&apos;t have a lead-generation problem. You have a routing infrastructure problem — and no amount of &apos;more leads&apos; fixes a broken pipe.
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
              {isAuditExpanded && <PipelineAudit onLeakCalculated={setCustomLeak} />}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — QUANTIFY THE LEAK */}
      <section id="leak-ledger" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{hasCustomLeak ? "Here’s what your routing delays are projected to cost you this year." : "Here’s what sitting on your hands is actually costing you this month."}</h2>
          <p className="mt-5 text-base text-gray-400 sm:text-lg">{hasCustomLeak ? "Your answers, translated into exposed pipeline:" : "The math your P&L isn’t showing you:"}</p>
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
            {leakLedgerRows.map(([label, amount]) => (
              <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-white/5 py-5 first:pt-0">
                <span className="text-sm leading-relaxed text-gray-400 sm:text-base">{label}</span>
                <span className="font-mono text-base font-bold tabular-nums text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.35)] sm:text-lg">–${amount.toLocaleString()}</span>
              </div>
            ))}

            <div className="mt-2 grid grid-cols-1 gap-3 border-t-2 border-white/10 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
              <span className="text-lg font-bold text-white">Total active leak</span>
              <span className="font-mono text-2xl font-black tabular-nums text-red-500 drop-shadow-[0_0_22px_rgba(239,68,68,0.55)] sm:text-3xl">–${(customLeak ?? 40000).toLocaleString()} / {hasCustomLeak ? "yr" : "mo"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-8 max-w-4xl space-y-5 text-center text-base leading-relaxed text-gray-400 sm:text-lg"
        >
          <p>{hasCustomLeak ? "This estimate is calculated from your deal value, reply volume, and response delays—not a generic industry benchmark." : <>That number isn&apos;t a projection. It&apos;s pipeline you <em className="text-white">already generated</em> — money you already paid to acquire — evaporating because a reply sat in a queue for six hours instead of six seconds.</>}</p>
          <p><strong className="font-bold text-white">Run this forward:</strong> {hasCustomLeak ? <><strong className="font-bold text-white">${customLeak.toLocaleString()} a year</strong> is exposed while qualified replies wait for routing, context, and follow-up.</> : <>at $40k/month, that&apos;s <strong className="font-bold text-white">$480,000 a year</strong> bleeding out of deals you already won the right to close.</>} You didn&apos;t lose these buyers to a competitor. You lost them to your own response time.</p>
          <p>The question isn&apos;t &apos;can we afford to fix this.&apos; It&apos;s <strong className="font-bold text-white">how much longer can we afford not to.</strong></p>
        </motion.div>
      </section>

      {/* SECTION 4 — WHY THE OBVIOUS FIXES DON'T WORK */}
      <section className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">WHY THE OBVIOUS FIXES DON&apos;T WORK</h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "I'll just hire another SDR.",
              text: "Humans get tired. You're not solving the bottleneck, you're renting it a little longer.",
            },
            {
              title: "I'll just use a cheap AI tool.",
              text: "One hallucinated pricing line doesn't just lose the sale — it burns the relationship permanently.",
            },
            {
              title: "I'll just wire together Zapier...",
              text: "Duct tape holds until your highest-intent prospect is waiting on a reply — and then it snaps.",
            },
          ].map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="relative isolate h-[21rem] overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-red-500/25"
            >
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5A1F]/70 to-transparent" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex h-48 shrink-0 items-center justify-center overflow-hidden border-b border-white/[0.05]">
                  <StopgapVisual index={index} />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-red-400">Failed fix 0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-white">{card.title}</h3>
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
          None of these are infrastructure. They&apos;re stopgaps wearing an infrastructure costume.
        </motion.p>
      </section>

      {/* CATEGORY DEFINITION + 6-MODULE ARCHITECTURE */}
      <section id="solutions" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">ONE CONTROL LAYER</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Outbound should be a closed loop. Not a chain of handoffs.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg">
            FrameLeads is the autonomous control layer between your lead sources, channels, inboxes, calendar, and sending stack. Routine work moves immediately. High-stakes work stops exactly where human judgment creates value.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {architectureModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="h-full"
            >
              <article className="relative isolate h-[42rem] overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.02] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/30">
                <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
                <div className="relative z-10 flex h-full flex-col">
                <div className="h-[64%] shrink-0 overflow-hidden border-b border-white/[0.05] p-5 sm:p-7">
                  <ArchitectureVisual index={index} />
                </div>
                <div className="flex h-[36%] flex-col justify-center p-5 sm:p-6">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">Module {String(index + 1).padStart(2, "0")} · {module.title}</span>
                  <h3 className="mt-2 font-sans text-xl font-bold leading-tight tracking-tight text-white">{module.headline}</h3>
                  <p className="mt-2 font-sans text-xs leading-relaxed text-[#888888] sm:text-sm">{module.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {module.tags.map((tag) => (
                      <span key={tag} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/75 shadow-[0_0_16px_rgba(255,90,31,0.07)] sm:text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      </section>

      <EmbeddedSandbox />

      {/* AUTONOMOUS ACQUISITION + ARCHITECTURE MOCKUP */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto mb-12 w-full max-w-7xl px-4 opacity-100 sm:px-6 md:mb-16 md:px-8"
      >
        <div className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.15] bg-white/[0.03] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-[24px]">
          <Image
            src="/hero-mockup-v2.png"
            alt="FrameLeads Platform Architecture"
            width={1920}
            height={1080}
            className="relative z-10 h-auto w-full object-cover opacity-100"
            priority
            unoptimized
          />
        </div>
      </motion.div>

      {/* OPERATING LOOP */}
      <section id="how-it-works" className="relative mx-auto w-full max-w-7xl scroll-mt-32 border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">FROM SOURCE TO MEETING</p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">One lead. One continuous decision path.</h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <div className="relative pl-6 sm:pl-8">
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-[#FF5A1F] via-red-500 to-[#FF5A1F]/20 shadow-[0_0_12px_rgba(255,90,31,0.7)]" />
              <div className="pointer-events-none absolute bottom-0 left-[-2px] top-0 w-[5px] bg-[#FF5A1F]/20 blur-sm" />
              {operatingSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
                  className="relative border-b border-white/5 py-5 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className={`absolute -left-[2.05rem] h-3 w-3 rounded-full border border-[#FF8A5F] bg-[#FF5A1F] shadow-[0_0_18px_rgba(255,90,31,0.75)] sm:-left-[2.55rem] ${index === 0 ? "top-0" : "top-5"}`} />
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-bold text-[#FF5A1F]">{step.number}</span>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-base">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-10 border-t border-white/5 pt-8"
            >
              <p className="text-lg font-medium leading-relaxed text-white">
                The lead never disappears between tools. The next action never depends on someone remembering.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.18] bg-white/[0.04] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0px_rgba(255,255,255,0.3)] backdrop-blur-[24px] lg:sticky lg:top-32"
            role="img"
            aria-label="FrameLeads pipeline from CSV upload through intent routing to calendar dispatch"
          >
            <OperatingLoopDiagram />
          </motion.div>
        </div>
      </section>

      {/* DEPLOYMENT OPTIONS (SCALABLE PRICING) */}
      <div id="pricing" className="relative mx-auto mb-16 max-w-7xl scroll-mt-32 px-4 sm:px-6 md:mb-24 lg:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center md:mb-12"
        >
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Select Your Deployment Architecture</h3>
          <p className="mt-3 px-2 font-mono text-xs text-[#8A8A93] sm:mt-4 sm:text-sm">
            Do not over-engineer. Deploy the tier that matches your current deal volume.
          </p>
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
                For teams actively running outbound and ready to stop routing by hand.
              </p>
              <div className="relative z-10 mb-6 mt-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
                <span className="text-4xl font-bold text-white">$147</span>
                <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
              </div>
              <ul className="relative z-10 mb-8 flex-grow space-y-4">
                {[
                  "500 AI-tailored outbound leads/mo",
                  "Full Omnichannel Sandbox + native send",
                  "1-Click Smartlead & Instantly Sync",
                  "Autonomous Inbox Triage",
                  "Zero-Click Calendar Concierge",
                  "Velvet Rope Governance",
                  "High-Intent Signal Scoring",
                  "Priority API processing (Dedicated Routing)",
                ].map((feature, index) => {
                  const isIncluded = index < 5;
                  return (
                    <li key={feature} className="flex items-start gap-3">
                      {isIncluded ? <CheckIcon className="text-white" /> : <CrossIcon className="text-gray-600 opacity-50" />}
                      <span className={isIncluded ? "text-sm text-white" : "text-sm text-gray-600 opacity-50 line-through"}>{feature}</span>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="https://whop.com/brandflowstudio/frameleads-24/"
                target="_blank"
                rel="noopener noreferrer"
                data-tripwire-guard="true"
                className="relative z-10 mt-auto block w-full rounded-lg border border-white/15 px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
              >
                Deploy Core Engine
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
                For teams where a single closed deal funds the subscription twenty times over.
              </p>
              <div className="relative z-10 mb-6 mt-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
                <span className="text-4xl font-bold text-[#FF5A1F]">$697</span>
                <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
              </div>
              <ul className="relative z-10 mb-8 flex-grow space-y-4">
                {[
                  "20,000 AI-tailored outbound leads/mo",
                  "Full Omnichannel Sandbox + native send",
                  "1-Click Smartlead & Instantly Sync",
                  "Autonomous Inbox Triage",
                  "Zero-Click Calendar Concierge",
                  "Velvet Rope Governance",
                  "High-Intent Signal Scoring",
                  "Priority API processing (Dedicated Routing)",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon className="text-white" />
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://whop.com/brandflowstudio/frameleads-enterprise-autonomous-architecture/"
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
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-[#8A8A93]">Enterprise deployments include Velvet Rope Governance: strict human-approval routing for high-value deal protection.</p>
      </div>

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
            <div className="font-mono text-xs text-[#FF5A1F] uppercase tracking-widest">{"// EXECUTIVE BRIEFING"}</div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Operational Clarity.</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed">Everything you need to know about the Velvet Rope infrastructure and deployment process.</p>
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
