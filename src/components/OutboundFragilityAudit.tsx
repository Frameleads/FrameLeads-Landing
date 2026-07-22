"use client";

import { useState } from "react";
import Link from "next/link";

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
    const calls = parseInt(unqualifiedCalls) || 0;
    const duration = parseInt(callDuration) || 0;
    const rate = parseInt(hourlyRate) || 0;
    const checking = parseInt(hoursChecking) || 0;

    const weeklyCallHours = (calls * duration) / 60 / 4; 
    const totalWeeklyWaste = weeklyCallHours + checking;
    const annualBleed = totalWeeklyWaste * 52 * rate;

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

  return (
    <div id="audit" className="w-full max-w-4xl mx-auto mt-24 mb-32 p-8 md:p-12 bg-[#0D0D0D] border border-white/10 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <div className="font-mono text-xs text-[#FF5A1F] tracking-widest uppercase">
          // Outbound Fragility Audit
        </div>
        <div className="font-mono text-xs text-[#8A8A93]">
          {step > 6 ? "DIAGNOSIS COMPLETE" : `NODE 0${step} / 06`}
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-8">What is the average ARR or LTV of a single closed deal in your pipeline?</h2>
          <div className="space-y-4">
            <button onClick={() => { setDealSize("low"); setStep(2); }} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">A)</span> 
              <span className="text-lg text-white">Under $5,000 (Standard B2B)</span>
            </button>
            <button onClick={() => { setDealSize("high"); setStep(2); }} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">B)</span> 
              <span className="text-lg text-white">$10,000 – $50,000+ (High-Ticket)</span>
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
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">How many hours per week do you spend personally reviewing sequences, intervening in threads, or checking dashboards?</h2>
          <p className="text-[#8A8A93] mb-8 font-mono text-sm">Be brutally honest. Include the 11 PM inbox checks.</p>
          <input type="number" value={hoursChecking} onChange={(e) => setHoursChecking(e.target.value)} placeholder="e.g., 5" className="w-full bg-black/40 border border-white/10 focus:border-[#FF5A1F] text-white text-2xl p-6 rounded-lg outline-none font-mono"/>
          <button onClick={() => setStep(3)} disabled={!hoursChecking} className="mt-8 px-8 py-4 bg-[#FF5A1F] text-white font-bold tracking-widest uppercase font-mono disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:scale-[1.02] transition-transform w-full">Commit Data →</button>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-8">In a typical month, how many discovery calls do you take that end up being completely unqualified or outside budget?</h2>
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
          <button onClick={() => setStep(4)} disabled={!unqualifiedCalls || !callDuration} className="mt-8 px-8 py-4 bg-[#FF5A1F] text-white font-bold tracking-widest uppercase font-mono disabled:opacity-50 rounded-lg hover:scale-[1.02] transition-transform w-full">Next Node →</button>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">What is your effective hourly rate as an executive?</h2>
          <p className="text-[#8A8A93] mb-8 font-mono text-sm">If unsure, divide your target annual revenue by 2,000.</p>
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
              <button onClick={calculateDrain} disabled={!hourlyRate} className="mt-8 px-8 py-4 bg-red-600/90 text-white font-bold tracking-widest uppercase font-mono disabled:opacity-50 rounded-lg hover:bg-red-500 transition-colors w-full">Run Diagnostic Matrix →</button>
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
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">If your top outbound SDR (or stack manager) gave two weeks' notice today, what happens to your pipeline?</h2>
          <div className="space-y-4">
            <button onClick={() => setStep(6)} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">A)</span> 
              <span className="text-lg text-white">Nothing. The logic is fully automated and documented.</span>
            </button>
            <button onClick={() => setStep(6)} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="font-mono text-[#8A8A93] group-hover:text-[#FF5A1F] mr-4">B)</span> 
              <span className="text-lg text-white">We lose months of relationship context and objection handling instantly.</span>
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Why haven't you deployed autonomous AI outreach to replace this manual overhead?</h2>
          <div className="space-y-4">
            <button onClick={() => setStep(7)} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="text-lg text-white">A) I tried it. It hallucinated and burned a relationship I spent 18 months building.</span>
            </button>
            <button onClick={() => setStep(7)} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="text-lg text-white">B) I am terrified of a bot sending an uncalibrated reply to a $40k prospect while I sleep.</span>
            </button>
            <button onClick={() => setStep(7)} className="w-full text-left p-6 border border-white/10 hover:border-[#FF5A1F] bg-black/40 hover:bg-[#FF5A1F]/5 transition-all group rounded-lg">
              <span className="text-lg text-white">C) I haven't found an AI sophisticated enough to understand our deal complexity.</span>
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="animate-in zoom-in-95 duration-700">
          <div className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs px-3 py-1 rounded mb-6">
            STATUS: CRITICAL FRAGILITY DETECTED
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
            You are bleeding <span className="text-[#FF2A2A] drop-shadow-[0_0_15px_rgba(255,42,42,0.6)]">{formatCurrency(capitalDrain)}</span> a year running a surveillance job masked as a business.
          </h2>
          <p className="text-[#8A8A93] text-lg mb-10 font-light leading-relaxed">
            Your execution is not the issue. The architecture is. Fully autonomous AI was designed for deals where a wrong message costs a lost lead. You are in deals where a wrong message costs a lost relationship.
          </p>
          <Link href="https://whop.com/checkout/plan_vYopYzyoqunDb" target="_blank" className="block text-center px-8 py-5 bg-[#FF5A1F] text-white font-bold tracking-widest uppercase font-mono rounded-lg hover:bg-[#ff6b35] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,90,31,0.3)]">
            Deploy Velvet Rope Protocol →
          </Link>
        </div>
      )}
    </div>
  );
}