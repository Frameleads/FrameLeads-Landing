"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import OutboundFragilityAudit from "../components/OutboundFragilityAudit";
import HowItWorks from "../components/HowItWorks";
import StepByStepHowItWorks from "../components/StepByStepHowItWorks";

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

const MicroPilotIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14">
    {[-45, 15, 75, 135, 195, 255].map((angle, index) => (
      <rect
        key={angle}
        x="29"
        y="5"
        width="6"
        height="14"
        rx="3"
        fill={index === 0 ? "#FF5A1F" : "#FFFFFF"}
        transform={`rotate(${angle} 32 32)`}
      />
    ))}
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
    answer: "No. FrameLeads is the intelligence layer; they are the delivery layer. We plug directly into your existing tools via API to give them autonomous reasoning, personalization, and triage capabilities.",
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

const navItems = [
  { label: "Audit", href: "#audit" },
  { label: "Solutions", href: "#solutions" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeNavHref, setActiveNavHref] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#1A1A1A] bg-grid-overlay font-sans selection:bg-[#FF5A1F] selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-6 z-50 mx-auto mt-6 flex w-[95%] max-w-5xl items-center justify-between rounded-2xl border border-[#242424] bg-[#0A0A0A]/70 px-6 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FrameLeads Logo" width={32} height={32} className="object-contain rounded-[8px]" />
          <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-wide text-white">
            FrameLeads
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label="Primary navigation"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navItems.map((item, index) => {
            const showPill = hoveredIndex === index || (hoveredIndex === null && activeNavHref === item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => setActiveNavHref(item.href)}
                className={`relative z-0 isolate rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-white ${activeNavHref === item.href ? "text-white" : "text-[#888888]"}`}
              >
                {showPill && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 z-[-1] rounded-xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button className="md:hidden text-white p-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <nav className="md:hidden fixed inset-0 z-40 bg-[#0D0D0D] pt-32 px-6 flex flex-col gap-8 h-screen border-b border-white/10 animate-in fade-in slide-in-from-top-4" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                setActiveNavHref(item.href);
                setIsMenuOpen(false);
              }}
              className={`border-b border-white/10 pb-4 text-left text-3xl font-bold tracking-tight transition-colors duration-200 hover:text-white ${activeNavHref === item.href ? "text-white" : "text-[#888888]"}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pt-24 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
        >
          <h2 className="mb-8 text-4xl font-bold leading-[1.1] tracking-tighter text-white sm:mb-10 sm:text-5xl md:text-6xl lg:text-7xl">
            You don&apos;t need more leads. <span className="text-[#FF5A1F] drop-shadow-[0_0_12px_rgba(255,90,31,0.35)]">You need to stop burning the ones you have.</span>
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full"
        >
          <p className="mx-auto mb-12 max-w-4xl text-lg font-light leading-relaxed text-[#8A8A93] sm:mb-16 sm:text-xl md:text-2xl">
            <span className="font-bold text-white">Every manual delay leaks part of the $40k/month already sitting in your pipeline.</span>{" "}
            FrameLeads drafts the perfect reply, drops booked meetings directly onto your live calendar, and never sends a complex response without your 1-click approval.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full sm:w-auto"
        >
          <button onClick={() => scrollToSection('audit')} className="group relative inline-flex w-full items-center justify-center rounded-xl bg-[#FF5A1F] px-8 py-4 text-base font-bold tracking-wider text-white shadow-[0_0_35px_rgba(255,90,31,0.4)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98] sm:w-auto sm:px-10 sm:py-5 sm:text-lg">
            <span className="relative z-10 flex items-center gap-2">
              See your active leak in 60 seconds.
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </span>
          </button>
        </motion.div>
        <p className="mt-5 text-xs text-[#888888] font-mono uppercase tracking-[0.15em]">NO SALES CALL REQUIRED.</p>

        {/* HIGH TICKET VSL EMBED */}
        <div className="w-full max-w-4xl mx-auto mt-12 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,90,31,0.15)] bg-black relative z-20">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/FXa9uZeuSsg?rel=0&modestbranding=1"
            title="FrameLeads Autonomous Architecture Walkthrough"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </main>

      {/* THE KNIFE TWIST SECTION */}
      <section className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 py-12 sm:px-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            You already know exactly why your pipeline is leaking.
          </h2>
          <p className="text-base sm:text-lg text-[#8A8A93] leading-relaxed px-2">
            Every fix you have tried either added more human fatigue or installed dangerous AI risk. Neither actually solves the bottleneck.
          </p>
        </motion.div>

        <div className="flex flex-col gap-12">
          {/* Human SDR Failure: text left, visual right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
            className="flex flex-col items-center gap-12 md:flex-row md:gap-24"
          >
            <div className="w-full md:w-1/2">
              <h3 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#FF5A1F] mb-6">The Human SDR Failure</h3>
              <p className="font-sans text-base sm:text-lg text-[#B0B0B0] leading-relaxed">Humans get tired. They forget objection rules. Warm leads go cold overnight. And when a rep eventually quits, your pipeline intelligence walks out the door with them.</p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="metric-card-shell" aria-label="Estimated active monthly pipeline leak">
                <div className="metric-card" role="group">
                  <dl className="metric-card__rows">
                    <div className="metric-card__row">
                      <dt>Leads ignored &gt; 48hrs</dt>
                      <dd>-$12,000</dd>
                    </div>
                    <div className="metric-card__row">
                      <dt>Missed follow-ups</dt>
                      <dd>-$18,000</dd>
                    </div>
                    <div className="metric-card__row">
                      <dt>Dropped intent</dt>
                      <dd>-$10,000</dd>
                    </div>
                    <div className="metric-card__total">
                      <dt>Active leak:</dt>
                      <dd>-$40,000 / mo</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Wrapper Failure: visual left, text right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col items-center gap-12 md:flex-row-reverse md:gap-24"
          >
            <div className="w-full md:w-1/2">
              <h3 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#FF5A1F] mb-6">The AI Wrapper Failure</h3>
              <p className="font-sans text-base sm:text-lg text-[#B0B0B0] leading-relaxed">Cheap AI is built for low-ticket spam. In high-ticket sales, one hallucinated reply permanently burns a $50,000 relationship. It disqualifies whale leads entirely behind your back.</p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="metric-card-shell" aria-label="Critical AI pricing error">
                <div className="metric-card aspect-video flex items-center justify-center p-5 sm:p-8">
                  <div className="absolute -left-12 top-4 h-40 w-40 rounded-full bg-red-600/10" aria-hidden="true" />
                  <div className="absolute -right-8 bottom-0 h-36 w-36 rounded-full bg-white/5" aria-hidden="true" />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl" aria-hidden="true" />
                  <div className="relative z-10 w-full max-w-sm rounded-xl border border-red-900/30 bg-black p-5 sm:p-6 text-left shadow-2xl">
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 font-mono text-lg font-bold text-red-500" aria-hidden="true">!</div>
                      <div>
                        <h4 className="font-sans text-base sm:text-lg font-bold tracking-wide text-red-500">CRITICAL ERROR</h4>
                        <p className="mt-2 font-sans text-sm sm:text-base leading-relaxed text-white/55">
                          AI hallucinated pricing logic.<br />
                          <span className="font-bold text-white">$50,000 deal at risk.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Duct-Tape Failure: text left, visual right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center gap-12 md:flex-row md:gap-24"
          >
            <div className="w-full md:w-1/2">
              <h3 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-[#FF5A1F] mb-6">The Duct-Tape Failure</h3>
              <p className="font-sans text-base sm:text-lg text-[#B0B0B0] leading-relaxed">You wired together Zapier, Make, and five different tools. It is a fragile mess. It always breaks at the exact moment your highest-intent prospect is waiting for a response.</p>
            </div>

            <div className="w-full md:w-1/2">
              <div className="metric-card-shell" aria-label="Broken webhook connection">
                <div className="metric-card aspect-video flex items-center justify-center px-8">
                  <div className="relative flex w-full max-w-sm items-center justify-between">
                    <div className="absolute left-12 right-[58%] top-1/2 border-t-2 border-[#333]" aria-hidden="true" />
                    <div className="absolute left-[58%] right-12 top-1/2 border-t-2 border-[#333]" aria-hidden="true" />

                    {[0, 1, 2].map((node) => (
                      <div key={node} className="relative z-10 h-12 w-12 rounded-lg border border-[#242424] bg-black shadow-xl" aria-hidden="true" />
                    ))}

                    <div className="absolute left-1/2 top-[calc(50%+2rem)] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 font-mono text-[9px] text-red-500 sm:text-xs">
                      Webhook Failed: Intent Unrecognized
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6-CARD ARCHITECTURE BENTO */}
      <HowItWorks />

      {/* AUTONOMOUS ACQUISITION + ARCHITECTURE MOCKUP */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto mb-12 w-full max-w-7xl px-4 opacity-100 sm:px-6 md:mb-16 md:px-8"
      >
        <div className="absolute inset-0 z-0 bg-[#FF5A1F]/10 blur-[80px] md:blur-[100px] rounded-full transform scale-90 pointer-events-none" />
        <div className="border border-white/10 rounded-xl md:rounded-2xl bg-[#121212] shadow-2xl overflow-hidden relative z-10">
          <Image
            src="/hero-mockup-v2.png"
            alt="FrameLeads Platform Architecture"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover opacity-100"
            priority
            unoptimized
          />
        </div>
      </motion.div>

      {/* AUDIT INJECTION */}
      <div className="my-16 px-4 sm:px-6 md:my-24 lg:my-32">
        <OutboundFragilityAudit />
      </div>

      {/* RESTORED STEP-BY-STEP HOW IT WORKS */}
      <StepByStepHowItWorks />

      {/* DEPLOYMENT OPTIONS (SCALABLE PRICING) */}
      <div id="pricing" className="mx-auto mb-16 max-w-7xl px-4 sm:px-6 md:mb-24 lg:mb-32">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center md:mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Select Your Deployment Architecture</h3>
          <p className="text-[#8A8A93] mt-3 sm:mt-4 font-mono text-xs sm:text-sm px-2">Do not over-engineer. Deploy the tier that matches your current deal volume.</p>
        </motion.div>

        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-6 lg:flex-row">
          {/* Micro-Pilot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:flex-1"
          >
          <div className="relative flex h-full flex-col rounded-2xl border border-[#242424] bg-[#121212] p-6 shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FF5A1F]/30 hover:shadow-[0_10px_40px_-10px_rgba(255,90,31,0.15)] sm:p-8 lg:flex-1">
            <div className="mb-6"><MicroPilotIcon /></div>
            <h4 className="mb-2 text-2xl font-bold text-white">FrameLeads Micro-Pilot</h4>
            <div className="mb-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
              <span className="text-4xl font-bold text-white">$10</span>
              <span className="font-mono text-sm text-[#8A8A93]">one-time purchase</span>
            </div>
            <ul className="mb-8 flex-grow space-y-4">
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">25 AI-tailored outbound leads (One-Time)</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Zero-Code Data Ingestion &amp; Sandbox</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">1-Click Smartlead Sync</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">1-Click Instantly Sync</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Autonomous Inbox Triage</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Zero-Click Calendar Concierge</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Velvet Rope Governance</span></li>
            </ul>
            <Link href="https://whop.com/brandflowstudio/frameleads-micro-pilot/" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-lg border border-white/15 px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black">Start Micro-Pilot</Link>
          </div>
          </motion.div>

          {/* Core */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:flex-1"
          >
          <div className="relative flex h-full flex-col rounded-2xl border border-[#242424] bg-[#121212] p-6 shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FF5A1F]/30 hover:shadow-[0_10px_40px_-10px_rgba(255,90,31,0.15)] sm:p-8 lg:flex-1">
            <div className="mb-6"><CoreIcon /></div>
            <h4 className="mb-2 text-2xl font-bold text-white">FrameLeads Core</h4>
            <div className="mb-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
              <span className="text-4xl font-bold text-white">$147</span>
              <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
            </div>
            <ul className="mb-8 flex-grow space-y-4">
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">500 AI-tailored outbound leads per month</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Zero-Code Data Ingestion</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">The Omnichannel Sandbox</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">1-Click Smartlead Sync</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">1-Click Instantly Sync</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Autonomous Inbox Triage</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Zero-Click Calendar Concierge</span></li>
              <li className="flex items-start gap-3 opacity-50"><CrossIcon /><span className="text-sm text-[#8A8A93]">Velvet Rope Governance</span></li>
            </ul>
            <Link href="https://whop.com/brandflowstudio/frameleads-24/" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-lg border border-white/15 px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black">Deploy Core Engine</Link>
          </div>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="lg:flex-1"
          >
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#FF5A1F] bg-[#121212] p-6 shadow-[0_0_40px_rgba(255,90,31,0.15)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FF5A1F]/30 hover:shadow-[0_10px_40px_-10px_rgba(255,90,31,0.15)] sm:p-8 lg:flex-1">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 bg-[#FF5A1F]/10 blur-3xl" />
            <div className="relative z-10 mb-6"><EnterpriseIcon /></div>
            <h4 className="relative z-10 mb-2 text-2xl font-bold text-white">FrameLeads Enterprise</h4>
            <div className="relative z-10 mb-6 flex items-baseline gap-1 border-b border-white/5 pb-6">
              <span className="text-4xl font-bold text-[#FF5A1F]">$697</span>
              <span className="font-mono text-sm text-[#8A8A93]">/mo</span>
            </div>
            <ul className="relative z-10 mb-8 flex-grow space-y-4">
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">20,000 AI-tailored outbound leads per month</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Zero-Code Data Ingestion &amp; Sandbox</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">1-Click Smartlead &amp; Instantly Sync</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Autonomous Inbox Triage</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">High-Intent Signal Scoring</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Zero-Click Calendar Concierge</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Velvet Rope Governance</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="text-white" /><span className="text-sm text-white">Priority API processing (Dedicated Routing)</span></li>
            </ul>
            <Link href="https://whop.com/brandflowstudio/frameleads-enterprise-autonomous-architecture/" target="_blank" rel="noopener noreferrer" className="relative z-10 mt-auto block w-full rounded-lg bg-[#FF5A1F] px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_28px_rgba(255,90,31,0.35)] transition-transform duration-200 hover:scale-[1.02] hover:bg-[#ff6b35] active:scale-[0.98]">Deploy Full Architecture</Link>
          </div>
          </motion.div>
        </div>
      </div>

      {/* EXECUTIVE BRIEFING (FAQ SPLIT LAYOUT) */}
      <div id="faq" className="mx-auto mb-16 max-w-7xl border-t border-white/5 px-4 pt-12 sm:px-6 md:mb-20 md:pt-24">
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
            <a href="https://www.linkedin.com/in/akram-walid-4717893a9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 border border-white/10 text-white font-mono text-xs uppercase tracking-widest rounded hover:bg-white hover:text-black transition-colors mt-4">
              Contact Support
            </a>
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
              <details key={faq.question} className="group overflow-hidden rounded-xl border border-white/10 bg-[#121212] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer select-none items-center justify-between gap-5 p-6 font-bold text-white sm:text-lg">
                  <span>{faq.question}</span>
                  <span className="shrink-0 text-[#FF5A1F] transition-transform group-open:rotate-180">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-[#8A8A93]">{faq.answer}</div>
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
