"use client";

import { useState } from "react";

type PipelineAuditProps = {
  onLeakCalculated: (annualLeak: number) => void;
};

export default function PipelineAudit({ onLeakCalculated }: PipelineAuditProps) {
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [averageDealSize, setAverageDealSize] = useState("");
  const [triageHours, setTriageHours] = useState("");
  const [result, setResult] = useState<{ hoursRecovered: number; pipelineRouted: number; annualLeak: number } | null>(null);

  const calculate = () => {
    const volume = Number(monthlyVolume) || 0;
    const dealValue = Number(averageDealSize) || 0;
    const weeklyHours = Number(triageHours) || 0;
    const pipelineRouted = Math.round(volume * dealValue);
    const hoursRecovered = Math.round(weeklyHours * 52);
    const delayRisk = Math.min(Math.max(weeklyHours / 40, 0.05), 0.4);
    const annualLeak = Math.round(pipelineRouted * 12 * 0.1 * delayRisk);

    const nextResult = { hoursRecovered, pipelineRouted, annualLeak };
    setResult(nextResult);
    onLeakCalculated(annualLeak);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-3 border-b border-white/5 pb-6 sm:flex-row sm:items-center">
        <div className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">Interactive Pipeline Audit</div>
        <div className="font-mono text-xs text-[#8A8A93]">3 INPUTS · INSTANT DIAGNOSIS</div>
      </div>

      {!result ? (
        <div className="grid gap-5">
          <AuditField label="Monthly Inbound Volume" value={monthlyVolume} onChange={setMonthlyVolume} placeholder="25" suffix="qualified leads" />
          <AuditField label="Average Deal Size" value={averageDealSize} onChange={setAverageDealSize} placeholder="10,000" prefix="$" />
          <AuditField label="Current Hours Spent Triaging" value={triageHours} onChange={setTriageHours} placeholder="8" suffix="hours / week" />
          <button type="button" onClick={calculate} disabled={!monthlyVolume || !averageDealSize || !triageHours} className="mt-3 w-full rounded-xl bg-[#FF5A1F] px-6 py-4 text-base font-bold text-white shadow-[0_0_28px_rgba(255,90,31,0.24)] transition-all duration-200 hover:bg-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-40">Calculate My Pipeline Leak</button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#8A8A93]">Your current routing exposure</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Metric label="Hours recovered annually" value={result.hoursRecovered.toLocaleString()} />
            <Metric label="Pipeline routed monthly" value={formatCurrency(result.pipelineRouted)} accent />
          </div>
          <p className="mt-7 text-xl font-semibold leading-relaxed text-white sm:text-2xl">FrameLeads recovers <span className="text-[#FF5A1F]">{result.hoursRecovered.toLocaleString()} hours</span> and routes <span className="text-[#FF5A1F]">{formatCurrency(result.pipelineRouted)}</span> in pipeline autonomously.</p>
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A93]">Estimated annual revenue exposed to manual routing: <span className="font-mono font-bold text-red-400">{formatCurrency(result.annualLeak)}</span>.</p>
          <a
            href="#leak-ledger"
            data-tripwire-guard="true"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("leak-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" });
              window.history.replaceState(null, "", "#leak-ledger");
            }}
            className="mt-8 block w-full rounded-xl bg-[#FF5A1F] px-6 py-4 text-center text-base font-bold text-white shadow-[0_0_34px_rgba(255,90,31,0.3)] transition-all duration-200 hover:bg-[#ff6b35] hover:shadow-[0_0_42px_rgba(255,90,31,0.4)] active:scale-[0.99]"
          >
            See How to Recover This Pipeline ↓
          </a>
          <button type="button" onClick={() => setResult(null)} className="mx-auto mt-5 block text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">Recalculate</button>
        </div>
      )}
    </div>
  );
}

function AuditField({ label, value, onChange, placeholder, prefix, suffix }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; prefix?: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-mono text-lg text-white/45">{prefix}</span>}
        <input type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-xl text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.05] ${prefix ? "pl-10" : ""} ${suffix ? "pr-32" : ""}`} />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">{suffix}</span>}
      </span>
    </label>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.12em] text-[#777777]">{label}</p><p className={`mt-2 font-heading text-3xl font-bold ${accent ? "text-[#FF5A1F]" : "text-white"}`}>{value}</p></div>;
}
