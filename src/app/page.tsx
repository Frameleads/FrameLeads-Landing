"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OutboundFragilityAudit from "../components/OutboundFragilityAudit";
import HowItWorks from "../components/HowItWorks";

const CheckIcon = ({ className = "text-white" }: { className?: string }) => (
  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = ({ className = "text-[#8A8A93]" }: { className?: string }) => (
  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] bg-grid-overlay selection:bg-[#FF5A1F] selection:text-white overflow-hidden font-sans">
      
      {/* Top Status Bar */}
      <div className="w-full border-b border-white/10 px-4 sm:px-6 py-2 bg-black/50 relative z-50">
        <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase text-center sm:text-left">
          // SYSTEM: ACTIVE | PROTOCOL: VELVET ROPE
        </p>
      </div>

      {/* Navigation Header */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between relative z-50 border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FrameLeads Logo" width={32} height={32} className="object-contain rounded-[8px]" />
          <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-wide text-white">
            FrameLeads
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-[#8A8A93]">
          <button onClick={() => scrollToSection('audit')} className="hover:text-white transition-colors">Audit</button>
          <button onClick={() => scrollToSection('architecture')} className="hover:text-white transition-colors">Architecture</button>
          <button onClick={() => scrollToSection('deploy')} className="hover:text-white transition-colors">Products</button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">Briefing</button>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="md:hidden text-white p-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0D0D0D] pt-32 px-6 flex flex-col gap-8 h-screen border-b border-white/10 animate-in fade-in slide-in-from-top-4">
          <button onClick={() => scrollToSection('audit')} className="text-left text-3xl font-bold text-white tracking-tight border-b border-white/10 pb-4">01. Fragility Audit</button>
          <button onClick={() => scrollToSection('architecture')} className="text-left text-3xl font-bold text-white tracking-tight border-b border-white/10 pb-4">02. Architecture</button>
          <button onClick={() => scrollToSection('deploy')} className="text-left text-3xl font-bold text-white tracking-tight border-b border-white/10 pb-4">03. Products</button>
          <button onClick={() => scrollToSection('faq')} className="text-left text-3xl font-bold text-white tracking-tight border-b border-white/10 pb-4">04. Executive Briefing</button>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 sm:mb-10 text-white">
          Your best rep just quit. Their objection logic didn't get backed up — <span className="text-[#FF5A1F] drop-shadow-[0_0_15px_rgba(255,90,31,0.6)]">it left with them.</span>
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-[#8A8A93] font-light leading-relaxed mb-12 sm:mb-16">
          Volume and brand safety are not a trade-off. They are an architecture decision.
        </p>

        {/* HIGH TICKET VSL EMBED */}
        <div className="w-full max-w-4xl mx-auto mb-12 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,90,31,0.15)] bg-black relative z-20">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/qRsUD60-e9I?modestbranding=1&rel=0&controls=1"
            title="FrameLeads Autonomous Architecture Walkthrough"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <button onClick={() => scrollToSection('audit')} className="group relative w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#FF5A1F] text-white font-bold text-base sm:text-lg tracking-wider px-8 sm:px-10 py-4 sm:py-5 shadow-[0_0_35px_rgba(255,90,31,0.4)] hover:bg-[#ff6b35] hover:scale-105 transition-all">
          <span className="relative z-10 flex items-center gap-2">
            Run the Outbound Fragility Audit
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </span>
        </button>
        <p className="mt-4 text-[10px] sm:text-xs text-[#8A8A93] font-mono tracking-widest uppercase">100% self-serve diagnostic. Discover your pipeline leaks in 60 seconds. No sales call required.</p>
      </main>

      {/* THE KNIFE TWIST SECTION */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            You know exactly what's wrong.<br/>
            <span className="text-[#8A8A93] font-light">You're still inside it.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A93] font-mono leading-relaxed px-2">
            Every solution you have tried installed labor, or installed risk. Neither is infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FAILURES */}
          <div className="p-6 sm:p-8 border border-white/5 bg-[#121212] rounded-xl hover:border-[#FF5A1F]/30 transition-colors group">
            <div className="font-mono text-xs text-[#FF5A1F] mb-6 uppercase tracking-widest">// The AI Wrapper Failure</div>
            <h3 className="text-lg sm:text-xl text-white font-bold mb-4">The Whale Lead Burn</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed mb-6">Fully autonomous AI was designed for deals where a wrong message costs a lost lead. You are in deals where a wrong message costs a lost relationship.</p>
            <div className="font-mono text-xs text-[#8A8A93] p-4 bg-black/50 border-l-2 border-[#FF5A1F]">"It books meetings. It also permanently disqualifies whale leads you will never know about."</div>
          </div>
          <div className="p-6 sm:p-8 border border-white/5 bg-[#121212] rounded-xl hover:border-[#FF5A1F]/30 transition-colors group">
            <div className="font-mono text-xs text-[#FF5A1F] mb-6 uppercase tracking-widest">// The Human SDR Failure</div>
            <h3 className="text-lg sm:text-xl text-white font-bold mb-4">The Knowledge Event</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed mb-6">An SDR isn't a hire. It's a rental. When they quit, your institutional knowledge and pipeline relationship context leaves with them — and you find out mid-deal.</p>
          </div>
          <div className="p-6 sm:p-8 border border-white/5 bg-[#121212] rounded-xl hover:border-[#FF5A1F]/30 transition-colors group">
            <div className="font-mono text-xs text-[#FF5A1F] mb-6 uppercase tracking-widest">// The DIY Stack Failure</div>
            <h3 className="text-lg sm:text-xl text-white font-bold mb-4">The 2:00 AM Alert</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed mb-6">You built a Rube Goldberg machine out of Zapier and Make. The part of your stack that breaks is exactly the part your largest deal depends on.</p>
            <div className="font-mono text-xs text-[#8A8A93] p-4 bg-black/50 border-l-2 border-[#FF5A1F]">"You spent $80,000 on infrastructure. All you have to show for it is a spreadsheet and held-together wiring."</div>
          </div>
        </div>
      </section>

      {/* SHIFTED HERO MOCKUP */}
      <div className="relative w-full max-w-7xl mx-auto mb-16 px-4 sm:px-6 md:px-8 opacity-100">
        <div className="absolute inset-0 z-0 bg-[#FF5A1F]/10 blur-[80px] md:blur-[100px] rounded-full transform scale-90 pointer-events-none" />
        <div className="border border-white/10 rounded-xl md:rounded-2xl bg-[#121212] shadow-2xl overflow-hidden relative z-10">
          <Image
            src="/hero-mockup-v2.jpg"
            alt="FrameLeads Platform Architecture"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover opacity-100"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* AUDIT INJECTION */}
      <div className="px-4 sm:px-6" id="audit">
        <OutboundFragilityAudit />
      </div>

      {/* 6-PILLAR ARCHITECTURE (HOW IT WORKS) */}
      <HowItWorks />

      {/* DEPLOYMENT OPTIONS (SCALABLE PRICING) */}
      <div id="deploy" className="max-w-5xl mx-auto mb-20 md:mb-32 px-4 sm:px-6">
        
        {/* MOTION GRAPHIC INJECTION */}
        <div className="w-full mb-16 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(255,90,31,0.08)] bg-[#121212]">
          <video
            src="/motion-graphic.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover opacity-90"
          />
        </div>

        <div className="text-center mb-10 md:mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Select Your Deployment Architecture</h3>
          <p className="text-[#8A8A93] mt-3 sm:mt-4 font-mono text-xs sm:text-sm px-2">Do not over-engineer. Deploy the tier that matches your current deal volume.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          
          {/* Core */}
          <div className="p-6 sm:p-8 border border-white/10 bg-[#121212] rounded-xl flex flex-col h-full relative">
            <div className="text-[#FF5A1F] text-[10px] font-mono uppercase tracking-[0.2em] mb-3">For Individuals</div>
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2">FrameLeads Core</h4>
            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/5">
              <span className="text-4xl font-bold text-white">$147</span>
              <span className="text-[#8A8A93] text-sm font-mono">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-[#E0E0E0]">500 AI-tailored outbound leads per month</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-[#E0E0E0]">Zero-Code Data Ingestion & Omnichannel Sandbox</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-[#E0E0E0]">1-Click Smartlead Sync</span>
              </li>
              <li className="flex items-start gap-3 opacity-40 grayscale">
                <CrossIcon />
                <span className="text-sm text-[#8A8A93] line-through decoration-white/20">Autonomous Inbox Triage</span>
              </li>
              <li className="flex items-start gap-3 opacity-40 grayscale">
                <CrossIcon />
                <span className="text-sm text-[#8A8A93] line-through decoration-white/20">Velvet Rope Governance</span>
              </li>
            </ul>
            
            <div className="mt-auto">
              <Link href="https://whop.com/checkout/plan_MUeh0CYdRPPaJ" target="_blank" className="block text-center px-4 sm:px-6 py-4 border border-white/10 text-white font-bold text-sm sm:text-base tracking-widest uppercase font-mono rounded-lg hover:bg-white hover:text-black transition-all w-full">Deploy Core Engine</Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="p-6 sm:p-8 border border-[#FF5A1F] bg-[#121212] rounded-xl flex flex-col h-full relative shadow-[0_0_40px_rgba(255,90,31,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A1F]/10 blur-3xl pointer-events-none" />
            <div className="text-[#FF5A1F] text-[10px] font-mono uppercase tracking-[0.2em] mb-3 relative z-10">For Teams & Businesses</div>
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2 relative z-10">FrameLeads Enterprise</h4>
            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/5 relative z-10">
              <span className="text-4xl font-bold text-[#FF5A1F]">$697</span>
              <span className="text-[#8A8A93] text-sm font-mono">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow relative z-10">
              <li className="flex items-start gap-3">
                <CheckIcon className="text-[#FF5A1F]" />
                <span className="text-sm text-[#E0E0E0]">Uncapped, unlimited AI generation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-[#FF5A1F]" />
                <span className="text-sm text-white font-medium">Unlocks Autonomous Inbox Triage</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-[#FF5A1F]" />
                <span className="text-sm text-white font-medium">Unlocks Velvet Rope Governance & manual override</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="text-[#FF5A1F]" />
                <span className="text-sm text-[#E0E0E0]">Priority API processing for zero-latency execution</span>
              </li>
            </ul>
            
            <div className="mt-auto relative z-10">
              <div className="mb-4 text-center">
                <p className="text-[10px] text-[#666666] font-mono uppercase tracking-wide">$697/mo — less than 2% of a single closed deal in your pipeline.</p>
              </div>
              <Link href="https://whop.com/checkout/plan_vYopYzyoqunDb" target="_blank" className="block text-center px-4 sm:px-6 py-4 bg-[#FF5A1F] text-white font-bold text-sm sm:text-base tracking-widest uppercase font-mono rounded-lg hover:bg-[#ff6b35] transition-all hover:scale-[1.02] w-full">Deploy Full Architecture</Link>
            </div>
          </div>

        </div>
      </div>

      {/* EXECUTIVE BRIEFING (FAQ SPLIT LAYOUT) */}
      <div id="faq" className="max-w-7xl mx-auto border-t border-white/5 pt-16 md:pt-24 mb-20 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Left Column (Sticky Header) */}
          <div className="md:col-span-1 md:sticky top-32 space-y-6 self-start">
            <div className="font-mono text-xs text-[#FF5A1F] uppercase tracking-widest">// EXECUTIVE BRIEFING</div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Operational Clarity.</h3>
            <p className="text-[#8A8A93] text-sm leading-relaxed">Everything you need to know about the Velvet Rope infrastructure and deployment process.</p>
            <a href="https://www.linkedin.com/in/akram-walid-4717893a9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 border border-white/10 text-white font-mono text-xs uppercase tracking-widest rounded hover:bg-white hover:text-black transition-colors mt-4">
              Contact Support
            </a>
          </div>

          {/* Right Column (Accordions) */}
          <div className="md:col-span-2 space-y-4">
            
            <details className="group border border-white/10 bg-[#121212] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-white sm:text-lg select-none">
                <span>Does this replace my existing tech stack?</span>
                <span className="transition-transform group-open:rotate-180 text-[#FF5A1F]">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#8A8A93] text-sm leading-relaxed">
                No. We are an orchestration layer, not a replacement for your sending infrastructure. FrameLeads connects directly to tools like Smartlead, ingests the data, and applies our Velvet Rope routing logic over the top.
              </div>
            </details>

            <details className="group border border-white/10 bg-[#121212] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-white sm:text-lg select-none">
                <span>What prevents the AI from hallucinating and burning a $50k deal?</span>
                <span className="transition-transform group-open:rotate-180 text-[#FF5A1F]">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#8A8A93] text-sm leading-relaxed">
                The architecture itself. We do not let AI touch high-ticket nuance unsupervised. The moment the system detects a complex inquiry or high-value signal, it halts the automation and queues a drafted response for your manual 1-click approval.
              </div>
            </details>

            <details className="group border border-white/10 bg-[#121212] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-white sm:text-lg select-none">
                <span>Why shouldn't I just hire another SDR to manage my inbox?</span>
                <span className="transition-transform group-open:rotate-180 text-[#FF5A1F]">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#8A8A93] text-sm leading-relaxed">
                An SDR is a rental. When they quit, your institutional knowledge and pipeline relationship context leaves with them. FrameLeads is permanent infrastructure that never forgets an objection handling matrix.
              </div>
            </details>

            <details className="group border border-white/10 bg-[#121212] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-white sm:text-lg select-none">
                <span>How fast is deployment?</span>
                <span className="transition-transform group-open:rotate-180 text-[#FF5A1F]">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-[#8A8A93] text-sm leading-relaxed">
                Instant. Upon checkout, you immediately unlock the FrameLeads Core SaaS environment. If you deploy the Enterprise tier, your bespoke Cognitive Architecture calibrations begin immediately upon onboarding.
              </div>
            </details>

          </div>
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

          {/* Socials & Legal */}
          <div className="flex items-center gap-6 font-mono text-[10px] text-[#5A5A63] tracking-widest uppercase">
            <a href="https://x.com/BrandFlowStudio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X (Twitter)</a>
            <a href="https://www.linkedin.com/in/brand-flow-4717893a9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <span className="opacity-20">|</span>
            <Link href="/terms" className="hover:text-[#8A8A93] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#8A8A93] transition-colors">Privacy</Link>
          </div>
          
        </div>
      </footer>
    </div>
  );
}