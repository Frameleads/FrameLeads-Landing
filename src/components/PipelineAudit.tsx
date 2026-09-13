"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export type DiagnosisType = "LOW_PRESSURE" | "MANUAL_DECISION_BOTTLENECK" | "ROUTING_THROUGHPUT" | "GOVERNANCE_EXPOSURE";

export type AuditResult = {
  monthlyConversations: number;
  averageDealValue: number;
  weeklyTriageHours: number;
  annualTriageHours: number;
  monthlyPipelineTouched: number;
  diagnosis: DiagnosisType;
  modeledRoutingExposure?: number;
};

type PipelineAuditProps = {
  onAuditComplete: (result: AuditResult) => void;
  onClose: () => void;
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
}).format(value);

export function diagnoseReplyWorkflow(monthlyConversations: number, averageDealValue: number, weeklyTriageHours: number): DiagnosisType {
  if (monthlyConversations < 10 && weeklyTriageHours < 3) return "LOW_PRESSURE";
  if (monthlyConversations >= 40 || weeklyTriageHours >= 12) return "ROUTING_THROUGHPUT";
  if (averageDealValue >= 10000) return "GOVERNANCE_EXPOSURE";
  return "MANUAL_DECISION_BOTTLENECK";
}

export default function PipelineAudit({ onAuditComplete, onClose }: PipelineAuditProps) {
  const [monthlyConversations, setMonthlyConversations] = useState("");
  const [averageDealValue, setAverageDealValue] = useState("");
  const [weeklyTriageHours, setWeeklyTriageHours] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const isComplete = [monthlyConversations, averageDealValue, weeklyTriageHours].every((value) => value !== "" && Number(value) >= 0);

  const calculate = () => {
    const conversations = Number(monthlyConversations);
    const dealValue = Number(averageDealValue);
    const triageHours = Number(weeklyTriageHours);
    const nextResult: AuditResult = {
      monthlyConversations: conversations,
      averageDealValue: dealValue,
      weeklyTriageHours: triageHours,
      annualTriageHours: Math.round(triageHours * 52),
      monthlyPipelineTouched: Math.round(conversations * dealValue),
      diagnosis: diagnoseReplyWorkflow(conversations, dealValue, triageHours),
    };
    setResult(nextResult);
    onAuditComplete(nextResult);
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/5 pb-6 sm:items-center">
        <div className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">Reply Workflow Audit</div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden font-mono text-xs text-[#8A8A93] sm:block">3 INPUTS · INSTANT DIAGNOSIS</div>
          <button type="button" onClick={onClose} aria-label="Close reply workflow audit" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-lg text-white/45 transition-colors hover:border-white/20 hover:text-white">×</button>
        </div>
      </div>
      <div className="-mt-5 mb-7 font-mono text-[10px] text-[#8A8A93] sm:hidden">3 INPUTS · INSTANT DIAGNOSIS</div>
      {!result ? (
        <div className="grid gap-5">
          <AuditField label="Monthly Qualified Prospect Conversations" value={monthlyConversations} onChange={setMonthlyConversations} placeholder="25" suffix="conversations / month" helper="Unique prospect conversations where someone must review the reply and decide a next action." />
          <AuditField label="Average Deal Value" value={averageDealValue} onChange={setAverageDealValue} placeholder="10000" prefix="$" />
          <AuditField label="Hours Spent Triaging & Replying" value={weeklyTriageHours} onChange={setWeeklyTriageHours} placeholder="8" suffix="hours / week" helper="Time spent reading, prioritizing, drafting, escalating, and deciding next actions." />
          <button type="button" onClick={calculate} disabled={!isComplete} className="mt-3 w-full rounded-xl bg-[#FF5A1F] px-6 py-4 text-base font-bold text-white shadow-[0_0_28px_rgba(255,90,31,0.24)] transition-all duration-200 hover:bg-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-40">Diagnose My Reply Workflow</button>
        </div>
      ) : <AuditDiagnosis result={result} onRecalculate={() => setResult(null)} />}
    </div>
  );
}

function AuditDiagnosis({ result, onRecalculate }: { result: AuditResult; onRecalculate: () => void }) {
  const diagnosisCopy: Record<DiagnosisType, { title: string; body: ReactNode; emphasis: string }> = {
    LOW_PRESSURE: {
      title: "Low Current Routing Pressure",
      body: <>Based on the numbers you entered, your current reply workload is still relatively light.</>,
      emphasis: "FrameLeads may be more infrastructure than this workflow needs today.",
    },
    MANUAL_DECISION_BOTTLENECK: {
      title: "Manual Decision Bottleneck",
      body: <>The issue isn&apos;t your lead volume. It&apos;s the <strong className="font-semibold text-white">{result.weeklyTriageHours.toLocaleString()} hours</strong> every week still being spent deciding what each reply means and what should happen next.</>,
      emphasis: "You don't need another writing tool. You need fewer manual decisions between the reply and the next action.",
    },
    ROUTING_THROUGHPUT: {
      title: "Routing Throughput Bottleneck",
      body: <>You&apos;re asking a human workflow to process <strong className="font-semibold text-white">{result.monthlyConversations.toLocaleString()} qualified conversations</strong> every month while spending roughly <strong className="font-semibold text-white">{result.weeklyTriageHours.toLocaleString()} hours</strong> a week triaging and responding.</>,
      emphasis: "At this volume, writing replies faster does not remove the queue. The routing decisions themselves have to scale.",
    },
    GOVERNANCE_EXPOSURE: {
      title: "High-Stakes Decision Exposure",
      body: <><span>At an average deal value of <strong className="font-semibold text-white">{formatCurrency(result.averageDealValue)}</strong>, the important question isn&apos;t only how quickly a reply gets answered. It&apos;s who — or what — is allowed to decide what happens next.</span><span className="mt-3 block">Pricing, technical, legal, and high-value conversations should not move through the same automation rules as routine replies.</span></>,
      emphasis: "Your pipeline needs a decision layer, not another autoresponder.",
    },
  };
  const diagnosisState: Record<DiagnosisType, { severity: string; dot: string; badge: string; ambient: string }> = {
    LOW_PRESSURE: { severity: "Low current pressure", dot: "bg-[#00FF66]/70", badge: "border-white/10 bg-white/[0.03] text-white/55", ambient: "" },
    MANUAL_DECISION_BOTTLENECK: { severity: "Manual bottleneck detected", dot: "bg-[#FF5A1F]", badge: "border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.06] text-[#FF5A1F]", ambient: "" },
    ROUTING_THROUGHPUT: { severity: "Routing pressure detected", dot: "bg-[#FF3333]", badge: "border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.06] text-[#FF5A1F]", ambient: "bg-[radial-gradient(circle_at_15%_10%,rgba(255,51,51,0.055),transparent_38%)]" },
    GOVERNANCE_EXPOSURE: { severity: "High-consequence workflow", dot: "bg-[#FF3333]", badge: "border-[#FF3333]/25 bg-[#FF3333]/[0.055] text-[#FF3333]", ambient: "bg-[radial-gradient(circle_at_15%_10%,rgba(255,51,51,0.07),transparent_40%)]" },
  };
  const copy = diagnosisCopy[result.diagnosis];
  const state = diagnosisState[result.diagnosis];
  const isLowPressure = result.diagnosis === "LOW_PRESSURE";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className={`relative -m-2 overflow-hidden rounded-xl p-2 ${state.ambient}`}>
      <div className="relative">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-white/55">Your diagnosis</p>
        <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${state.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />{state.severity}
        </div>
        <h3 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">{copy.title}</h3>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">{copy.body}</p>
        <p className="mt-4 max-w-3xl border-l-2 border-white/15 pl-4 text-base font-semibold leading-relaxed text-white">{copy.emphasis}</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Metric label="Annual manual triage time" value={`${result.annualTriageHours.toLocaleString()} hours`} accent="orange" />
        <Metric label="Monthly deal value in these conversations" value={formatCurrency(result.monthlyPipelineTouched)} accent="white" />
      </div>
      <p className="mt-5 rounded-lg border border-white/[0.06] bg-black/10 px-4 py-3 text-sm leading-relaxed text-white/55">Based on <span className="text-white/80">{result.monthlyConversations.toLocaleString()} unique qualified conversations × {formatCurrency(result.averageDealValue)} average deal value</span>. This represents deal value involved in the workflow — not projected or lost revenue.</p>
      <a href="#leak-ledger" data-tripwire-guard="true" onClick={(event) => { event.preventDefault(); document.getElementById("leak-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" }); window.history.replaceState(null, "", "#leak-ledger"); }} className="mt-8 block w-full rounded-xl bg-[#FF5A1F] px-6 py-4 text-center text-base font-bold text-white shadow-[0_0_34px_rgba(255,90,31,0.3)] transition-all duration-200 hover:bg-[#ff6b35] hover:shadow-[0_0_42px_rgba(255,90,31,0.4)] active:scale-[0.99]">
        {isLowPressure ? "See How the Architecture Works ↓" : "See the Decision Layer ↓"}
      </a>
      <button type="button" onClick={onRecalculate} className="mx-auto mt-5 block text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">Recalculate</button>
    </motion.div>
  );
}

function AuditField({ label, value, onChange, placeholder, prefix, suffix, helper }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; prefix?: string; suffix?: string; helper?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-mono text-lg text-white/45">{prefix}</span>}
        <input type="number" min="0" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-xl text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${prefix ? "pl-10" : ""} ${suffix ? "pr-32" : ""}`} />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">{suffix}</span>}
      </span>
      {helper && <span className="mt-2 block text-xs leading-relaxed text-white/35">{helper}</span>}
    </label>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: "orange" | "white" }) {
  return <div className={`rounded-xl border bg-white/[0.03] p-5 ${accent === "orange" ? "border-[#FF5A1F]/20" : "border-white/[0.08]"}`}><p className="text-xs uppercase tracking-[0.12em] text-[#777777]">{label}</p><p className={`mt-2 font-heading text-2xl font-bold sm:text-3xl ${accent === "orange" ? "text-[#FF5A1F]" : "text-white"}`}>{value}</p>{accent === "white" && <div className="mt-3 h-px w-12 bg-[#FF5A1F]/60" />}</div>;
}
