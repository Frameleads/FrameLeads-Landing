"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { auditOptions, diagnosisCopy, diagnoseReplyWorkflow, emailPattern, normalizeCompanyWebsite, type AuditAnswers, type AuditResult } from "../audit";
import { getMarketingAttribution, trackLeadCaptureIfSuccessful, trackMarketingEvent } from "../marketing-events";
import {getMeasurementAttribution,observeMeasurement} from '../measurement';

export type { AuditResult } from "../audit";
type Props = { onAuditComplete?: (result: AuditResult) => void; onClose: () => void };
type Key = keyof AuditAnswers;
const questions: { key: Key; question: string; helper?: string; options: readonly string[] }[] = [
  { key: "monthlyQualifiedConversations", question: "How many qualified prospect conversations does outbound create in a typical month?", options: auditOptions.monthlyQualifiedConversations },
  { key: "dealValue", question: "What is a typical new client engagement worth?", options: auditOptions.dealValue },
  { key: "weeklyManualBurden", question: "How much time does someone spend each week reading replies, deciding next actions, drafting, routing, or escalating?", options: auditOptions.weeklyManualBurden },
  { key: "decisionOwner", question: "Who normally decides what happens after a qualified prospect replies?", options: auditOptions.decisionOwner },
  { key: "nonRoutineHandling", question: "What happens when the reply isn't routine?", helper: "For example: pricing, objections, custom terms, or unusual questions.", options: auditOptions.nonRoutineHandling },
];

export default function PipelineAudit({ onAuditComplete, onClose }: Props) {
  const [answers, setAnswers] = useState<Partial<AuditAnswers>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [captured, setCaptured] = useState(false);
  const completionTracked = useRef(false);
  const workflowMapTracked = useRef(false);
  const startTracked = useRef(false);
  const active = questions[index];
  const choose = (value: string) => {
    if (result || completionTracked.current) return;
    if(!startTracked.current){startTracked.current=true;observeMeasurement('AUDIT_STARTED');}
    const next = { ...answers, [active.key]: value };
    setAnswers(next);
    if (index < questions.length - 1) {
      window.setTimeout(() => setIndex((current) => current + 1), 120);
      return;
    }
    const diagnosis = diagnoseReplyWorkflow(next as AuditAnswers);
    completionTracked.current = true;
    setResult(diagnosis);
    observeMeasurement('AUDIT_COMPLETED',false);
    trackMarketingEvent("AUDIT_COMPLETED", { source: "REPLY_WORKFLOW_AUDIT", diagnosis: diagnosis.diagnosis });
    onAuditComplete?.(diagnosis);
  };
  useEffect(() => {
    if (!captured || !result || workflowMapTracked.current) return;
    workflowMapTracked.current = true;
    trackMarketingEvent("WORKFLOW_MAP_VIEWED", { source: "REPLY_WORKFLOW_AUDIT", diagnosis: result.diagnosis });
  }, [captured, result]);
  return <div>
    <header className="mb-7 flex items-start justify-between gap-4 border-b border-white/5 pb-6 sm:items-center"><div><p className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">Reply Workflow Audit</p><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A8A93]">5 questions · Instant diagnosis</p></div><button type="button" onClick={onClose} aria-label="Close reply workflow audit" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-lg text-white/45 hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">×</button></header>
    {!result ? <Question active={active} index={index} selected={answers[active.key]} onChoose={choose} onBack={() => setIndex((current) => Math.max(0, current - 1))} /> : captured ? <WorkflowMap result={result} onClose={onClose} /> : <Diagnosis result={result} onCaptured={() => setCaptured(true)} />}
  </div>;
}

function Question({ active, index, selected, onChoose, onBack }: { active: (typeof questions)[number]; index: number; selected?: string; onChoose: (value: string) => void; onBack: () => void }) {
  return <motion.fieldset key={active.key} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="min-w-0"><legend className="text-xl font-semibold leading-snug text-white sm:text-2xl">{active.question}</legend>{active.helper && <p className="mt-2 text-sm text-[#888888]">{active.helper}</p>}<div className="mt-6 grid gap-3 sm:grid-cols-2">{active.options.map((option) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${selected === option ? "border-[#FF5A1F]/45 bg-[#FF5A1F]/[0.07]" : "border-white/[0.08] bg-white/[0.025] hover:border-white/20"}`}><input type="radio" name={active.key} value={option} checked={selected === option} onChange={() => onChoose(option)} className="h-4 w-4 accent-[#FF5A1F]" /><span className="text-sm font-medium text-white/90">{option}</span></label>)}</div><div className="mt-7 flex items-center justify-between"><button type="button" onClick={onBack} disabled={index === 0} className="text-sm text-white/45 hover:text-white disabled:invisible">Back</button><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#888888]">{index + 1} / {questions.length}</span></div></motion.fieldset>;
}

function Diagnosis({ result, onCaptured }: { result: AuditResult; onCaptured: () => void }) {
  const copy = diagnosisCopy[result.diagnosis];
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Your diagnosis</p><h3 className="mt-3 text-3xl font-bold tracking-tight text-white">{copy.title}</h3><p className="mt-4 text-base leading-relaxed text-gray-300">{copy.body}</p><p className="mt-4 border-l-2 border-[#FF5A1F] pl-4 font-semibold leading-relaxed text-white">{copy.emphasis}</p><div className="mt-7 grid gap-3 rounded-xl border border-white/[0.08] bg-black/10 p-4 sm:grid-cols-2"><State label="Current state" text={`Outbound → Reply → ${currentOwner(result)} → Decision → Next action`} /><State label="Target state" text="Reply → FrameLeads Decision Layer → Routine continues / Consequential human review" accent /></div><div className="mt-6 grid gap-2 sm:grid-cols-3"><Context label="Conversation volume" value={result.answers.monthlyQualifiedConversations} /><Context label="Typical engagement" value={result.answers.dealValue} /><Context label="Weekly manual burden" value={result.answers.weeklyManualBurden} /></div><LeadCapture result={result} onCaptured={onCaptured} /></motion.div>;
}

function LeadCapture({ result, onCaptured }: { result: AuditResult; onCaptured: () => void }) {
  const [firstName, setFirstName] = useState(""); const [workEmail, setWorkEmail] = useState(""); const [websiteInput, setWebsiteInput] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const submitting = useRef(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    const companyWebsite = normalizeCompanyWebsite(websiteInput);
    if (!emailPattern.test(workEmail.trim()) || !companyWebsite) { setError("Enter a valid work email and company website."); return; }
    submitting.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/audit-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: firstName.trim() || undefined, workEmail: workEmail.trim().toLowerCase(), companyWebsite, diagnosis: result.diagnosis, signals: result.signals, answers: result.answers, attribution: {...getMarketingAttribution(),...getMeasurementAttribution()} }) });
      if (!response.ok) {
        const code = response.headers.get("X-Audit-Bridge-Code");
        const reference = code && /^AUDIT_BRIDGE_(CONFIG|UPSTREAM_AUTH|UPSTREAM_INVALID|UPSTREAM_UNAVAILABLE|TIMEOUT)$/.test(code) ? ` (${code})` : "";
        setError((response.status === 503 ? "Workflow map delivery is temporarily unavailable. Please try again shortly." : "We couldn't save your workflow map. Please try again.") + reference);
        return;
      }
      trackLeadCaptureIfSuccessful(true, { source: "REPLY_WORKFLOW_AUDIT", diagnosis: result.diagnosis });
      onCaptured();
    } catch {
      setError("We couldn't save your workflow map. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return <form onSubmit={submit} aria-busy={busy} className="mt-8 border-t border-white/[0.08] pt-7"><h4 className="text-xl font-semibold text-white">Want your personalized Reply Workflow Map?</h4><p className="mt-2 text-sm leading-relaxed text-[#888888]">Enter your work email and company website and we&apos;ll map where FrameLeads would sit in your current workflow.</p><div data-audit-bonus="true" className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#FF5A1F]">Bonus included</p><p className="mt-1 text-sm font-semibold text-white">AI SDR Prompt Framework</p><p className="mt-1 text-xs leading-relaxed text-[#888888]">We&apos;ll also send the 5-prompt framework for classifying, deciding, controlling, prioritizing and escalating prospect replies safely.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Work email" type="email" required value={workEmail} onChange={setWorkEmail} placeholder="you@company.com" /><Field label="Company website" required value={websiteInput} onChange={setWebsiteInput} placeholder="company.com" /><div className="sm:col-span-2"><Field label="First name (optional)" value={firstName} onChange={setFirstName} placeholder="Alex" /></div></div><p className="mt-4 text-xs leading-relaxed text-white/40">We&apos;ll send your workflow result and relevant FrameLeads follow-up. Unsubscribe anytime.</p>{error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}<button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-[#FF5A1F] px-6 py-4 font-bold text-white hover:bg-[#ff6b35] disabled:cursor-wait disabled:opacity-60">{busy ? <span role="status" aria-live="polite">Creating your map…</span> : "Get My Workflow Map"}</button></form>;
}

function WorkflowMap({ result, onClose }: { result: AuditResult; onClose: () => void }) {
  const low = result.diagnosis === "LOW_CURRENT_PRESSURE"; const target = low ? "capabilities" : "simulation"; const copy = diagnosisCopy[result.diagnosis];
  const go = () => { onClose(); window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150); };
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF5A1F]">Your Reply Workflow Map</p><h3 className="mt-3 text-3xl font-bold text-white">{copy.title}</h3><div className="mt-7 grid gap-3"><State label="Current state" text={`Reply decisions currently route through: ${currentOwner(result)}.`} /><State label="Gap" text={copy.gap} /><State label="Recommended operating state" text="Reply → FrameLeads Decision Layer → Routine continues / Consequential human review" accent /><State label="Why" text={`${result.answers.monthlyQualifiedConversations} qualified conversations per month · ${result.answers.dealValue} typical engagement · ${result.answers.weeklyManualBurden} of weekly manual decision work.`} /></div><button type="button" onClick={go} className="mt-7 w-full rounded-xl bg-[#FF5A1F] px-6 py-4 font-bold text-white hover:bg-[#ff6b35]">{low ? "See How the System Works" : "See FrameLeads Handle This"}</button></motion.div>;
}

function currentOwner(result: AuditResult) { if (result.diagnosis === "FOUNDER_DECISION_BOTTLENECK") return "Founder"; if (result.diagnosis === "UNCONTROLLED_AUTOMATION") return "AI / Automation"; if (result.diagnosis === "FRAGMENTED_REPLY_WORKFLOW" && result.signals.includes("INCONSISTENT_OWNERSHIP")) return "Inconsistent owner"; if (result.answers.decisionOwner === "SDR / salesperson" || result.answers.decisionOwner === "VA / assistant") return "Team / Individual operator"; return "Human workflow"; }
function State({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) { return <div className={`rounded-lg border p-4 ${accent ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/[0.05]" : "border-white/[0.07] bg-white/[0.02]"}`}><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#888888]">{label}</p><p className="mt-2 text-sm leading-relaxed text-white/80">{text}</p></div>; }
function Context({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-white/[0.07] p-3"><p className="font-mono text-[8px] uppercase tracking-wider text-[#888888]">{label}</p><p className="mt-1 text-sm text-white/80">{value}</p></div>; }
function Field({ label, type = "text", value, onChange, placeholder, required = false }: { label: string; type?: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="block"><span className="mb-2 block text-sm font-medium text-white/70">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-white outline-none placeholder:text-white/25 focus:border-[#FF5A1F]/45" /></label>; }
