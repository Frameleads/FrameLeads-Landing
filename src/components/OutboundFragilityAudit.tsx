"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OutboundFragilityAudit() {
  const [step, setStep] = useState(1);
  const [dealSize, setDealSize] = useState("");
  const [hoursChecking, setHoursChecking] = useState("");
  const [unqualifiedCalls, setUnqualifiedCalls] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcText, setCalcText] = useState("> INITIALIZING DIAGNOSTIC MATRIX...");
  const [capitalDrain, setCapitalDrain] = useState(0);

  const calculateDrain = () => {
    setIsCalculating(true);
    const callsPerMonth = parseInt(unqualifiedCalls) || 0;
    const founderHourlyRate = parseFloat(hourlyRate) || 0;
    const hoursWastedPerWeek = parseFloat(hoursChecking) || 0;
    const closedDealValue = dealSize === "high" ? 10000 : 5000;

    const timeWasteCost = hoursWastedPerWeek * 52 * founderHourlyRate;
    const badCallCost = callsPerMonth * 12 * founderHourlyRate;
    const lostOpportunityCost = closedDealValue * 2;
    const annualBleed = timeWasteCost + badCallCost + lostOpportunityCost;

    // The Psychological Escalation
    setTimeout(() => setCalcText("> QUANTIFYING EXECUTIVE TIME LEAK..."), 1200);
    setTimeout(() => setCalcText("> CALCULATING ANNUAL CAPITAL DRAIN..."), 2500);

    setTimeout(() => {
      setCapitalDrain(annualBleed);
      setIsCalculating(false);
      setStep(5);
    }, 4000); 
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isEnterpriseBleed = capitalDrain >= 100000;
  const finalCtaHref = isEnterpriseBleed
    ? "https://whop.com/brandflowstudio/frameleads-enterprise-autonomous-architecture/"
    : "https://whop.com/brandflowstudio/frameleads-24/";
  const finalCtaText = isEnterpriseBleed ? "SECURE YOUR PIPELINE →" : "STOP THE BLEED →";

  return (
    <motion.div
      id="audit"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[95%] overflow-hidden rounded-3xl border border-[#242424] bg-[#1A1A1A]/90 p-6 shadow-[0_0_50px_-15px_rgba(255,90,31,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl md:max-w-4xl md:p-10 lg:p-16"
    >
      <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute top-0 inset-x-0 h-32 w-full bg-[#FF5A1F]/[0.03] blur-3xl rounded-t-3xl pointer-events-none"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 flex flex-col items-start justify-between gap-3 border-b border-white/5 pb-6 sm:mb-12 sm:flex-row sm:items-center"
      >
        <div className="font-mono text-xs text-[#FF5A1F] tracking-widest uppercase">
          {"// Outbound Fragility Audit"}
        </div>
        <div className="font-mono text-xs text-[#8A8A93]">
          {step > 6 ? "DIAGNOSIS COMPLETE" : `NODE 0${step} / 06`}
        </div>
      </motion.div>

      {step === 1 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">What is one closed deal actually worth to your business?</h2>
          <div className="space-y-4">
            <button onClick={() => { setDealSize("low"); setStep(2); }} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">A)</span> 
              <span className="text-base text-white sm:text-lg">Under $5,000 (Standard B2B)</span>
            </button>
            <button onClick={() => { setDealSize("high"); setStep(2); }} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">B)</span> 
              <span className="text-base text-white sm:text-lg">$10,000 – $50,000+ (High-Ticket)</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-500">
          {dealSize === "high" && (
            <div className="mb-6 inline-block bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs px-3 py-1 rounded">
              ⚠ WARNING: High-Ticket Deal Complexity Detected. Standard AI error models do not apply.
            </div>
          )}
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">How many hours a week do you waste babysitting your inbox and checking on leads?</h2>
          <p className="text-[#8A8A93] mb-8 font-mono text-sm">Be brutally honest. Count the 11 PM checks from your phone.</p>
          <input type="number" value={hoursChecking} onChange={(e) => setHoursChecking(e.target.value)} placeholder="e.g., 5" className="w-full rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xl text-white outline-none focus:border-[#FF5A1F] sm:p-6 sm:text-2xl"/>
          <button onClick={() => setStep(3)} disabled={!hoursChecking} className="mt-8 w-full rounded-lg bg-[#FF5A1F] px-4 py-4 font-mono font-bold uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8">Commit Data →</button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">How many sales calls do you take each month with people who can never afford you?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-mono text-xs text-[#8A8A93] mb-2 uppercase">Unqualified Calls / Month</label>
              <input type="number" value={unqualifiedCalls} onChange={(e) => setUnqualifiedCalls(e.target.value)} placeholder="e.g., 12" className="w-full bg-black/40 border border-white/10 focus:border-[#FF5A1F] text-white text-xl p-4 rounded-lg outline-none font-mono"/>
            </div>
            <div>
              <label className="block font-mono text-xs text-[#8A8A93] mb-2 uppercase">Avg Duration (Minutes)</label>
              <input type="number" value={callDuration} onChange={(e) => setCallDuration(e.target.value)} placeholder="e.g., 45" className="w-full bg-black/40 border border-white/10 focus:border-[#FF5A1F] text-white text-xl p-4 rounded-lg outline-none font-mono"/>
            </div>
          </div>
          <button onClick={() => setStep(4)} disabled={!unqualifiedCalls || !callDuration} className="mt-8 w-full rounded-lg bg-[#FF5A1F] px-4 py-4 font-mono font-bold uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 sm:px-8">Next Node →</button>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">What is your true hourly rate as a founder?</h2>
          <p className="text-[#8A8A93] mb-8 font-mono text-sm">If you don&apos;t know, divide your target annual revenue by 2,000. Stop pricing your time at zero.</p>
          {isCalculating ? (
            <div className="py-12 text-center border border-[#FF5A1F]/20 bg-[#FF5A1F]/5 rounded-lg animate-in fade-in">
              <div className="font-mono text-[#FF5A1F] animate-pulse tracking-widest">{calcText}</div>
            </div>
          ) : (
            <>
              <div className="relative">
                <span className="absolute left-6 top-6 text-white text-2xl font-mono">$</span>
                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="500" className="w-full bg-black/40 border border-white/10 focus:border-[#FF5A1F] text-white text-2xl p-6 pl-12 rounded-lg outline-none font-mono"/>
              </div>
              <button onClick={calculateDrain} disabled={!hourlyRate} className="mt-8 w-full rounded-lg bg-red-600/90 px-4 py-4 font-mono font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-500 disabled:opacity-50 sm:px-8">Run Diagnostic Matrix →</button>
            </>
          )}
        </div>
      )}

      {step >= 5 && (
        <div className="mb-10 p-6 border border-red-500/20 bg-red-500/5 rounded-lg animate-in fade-in">
          <div className="font-mono text-xs text-red-400 mb-2 uppercase tracking-widest">Calculated Annual Capital Drain</div>
          <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tighter">{formatCurrency(capitalDrain)}</div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">If your main sales rep quits tomorrow, what happens to your pipeline?</h2>
          <div className="space-y-4">
            <button onClick={() => setStep(6)} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">A)</span> 
              <span className="text-base text-white sm:text-lg">Nothing. The system already has the context — it doesn&apos;t depend on one person.</span>
            </button>
            <button onClick={() => setStep(6)} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">B)</span> 
              <span className="text-base text-white sm:text-lg">We lose months of relationship context and objection handling instantly.</span>
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Why haven’t you let AI take over your follow-ups yet?</h2>
          <div className="space-y-4">
            <button onClick={() => setStep(7)} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="text-base text-white sm:text-lg">A) I tried it. It hallucinated and burned a deal I spent months building.</span>
            </button>
            <button onClick={() => setStep(7)} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="text-base text-white sm:text-lg">B) I refuse to let a dumb bot talk to a $50,000 prospect while I sleep.</span>
            </button>
            <button onClick={() => setStep(7)} className="group w-full rounded-lg border border-white/10 bg-black/40 p-4 text-left transition-all hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 sm:p-6">
              <span className="text-base text-white sm:text-lg">C) Current AI is too stupid to understand our complex deal cycles.</span>
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs px-3 py-1 rounded mb-6">
            STATUS: CRITICAL FRAGILITY DETECTED
          </div>
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            You are bleeding <span className="text-[#FF2A2A] drop-shadow-[0_0_15px_rgba(255,42,42,0.6)]">{formatCurrency(capitalDrain)}</span> a year running a surveillance job masked as a business.
          </h2>
          <p className="text-[#8A8A93] text-lg mb-10 font-light leading-relaxed">
            Your execution is not the issue. The architecture is. Fully autonomous AI was designed for deals where a wrong message costs a lost lead. You are in deals where a wrong message costs a lost relationship.
          </p>
          <Link href={finalCtaHref} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-[#FF5A1F] px-4 py-5 text-center font-mono font-bold uppercase tracking-widest text-white shadow-[0_0_40px_rgba(255,90,31,0.3)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98] sm:px-8">
            {finalCtaText}
          </Link>
        </div>
      )}
    </motion.div>
  );
}
