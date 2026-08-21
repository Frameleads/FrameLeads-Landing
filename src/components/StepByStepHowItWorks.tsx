"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Define Your Strategy",
    description: "Configure your baseline. Feed the engine your company name, value proposition, target audience, and preferred CTA once—so your outreach never sounds generic.",
  },
  {
    title: "Drop Your Leads",
    description: "Upload your raw lead list as a CSV. The engine automatically maps your columns, cleans the formatting, and preps the data for personalization.",
  },
  {
    title: "Test in the Sandbox",
    description: "Review your generated, highly personalized emails. Tweak the AI's logic, regenerate with one click, or export your finalized list as a CSV.",
  },
  {
    title: "Deploy to Your Stack",
    description: "Push your finalized list of personalized emails directly to Smartlead or Instantly with a single click. No manual data entry required.",
  },
  {
    title: "Autonomous Inbox Triage",
    description: "The AI takes over routine replies and books meetings on your calendar. Anything high-stakes waits for you — see how in the next step.",
  },
  {
    title: "Velvet Rope Governance",
    description: "You are always in control. Complex objections and high-stakes replies are routed to your Executive Dashboard for your 1-click manual review before sending.",
  },
];

function StepVisual({ activeStep }: { activeStep: number }) {
  switch (activeStep) {
    case 0:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl rounded-xl border border-[#242424] bg-[#0A0A0A] p-8 shadow-2xl lg:p-10">
            <div className="mb-5 font-mono text-sm uppercase tracking-[0.2em] text-[#888888]">Strategy baseline</div>
            <div className="space-y-3">
              {["[ Company Name ]", "[ Value Proposition ]", "[ Target Audience ]"].map((field) => (
                <div key={field} className="rounded-lg border border-[#242424] bg-black px-5 py-4 font-mono text-base text-[#888888] lg:text-lg">
                  {field}
                </div>
              ))}
            </div>
            <button type="button" className="mt-6 w-full animate-pulse rounded-lg bg-[#FF5A1F] px-5 py-4 font-mono text-base font-bold uppercase tracking-wider text-white shadow-[0_0_28px_rgba(255,90,31,0.35)] lg:text-lg">
              Initialize Engine
            </button>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl rounded-xl border-2 border-dashed border-[#333333] bg-[#0A0A0A] p-6 text-center shadow-2xl md:p-10 lg:p-12">
            <div className="relative mx-auto flex h-28 w-24 items-center justify-center rounded-xl border border-white/20 bg-black shadow-[0_0_30px_rgba(255,255,255,0.12)]">
              <div className="absolute right-0 top-0 h-5 w-5 rounded-bl-lg border-b border-l border-white/20 bg-[#1A1A1A]" />
              <span className="font-mono text-lg font-bold tracking-widest text-white">CSV</span>
            </div>
            <div className="mt-7 font-sans text-xl font-bold text-white lg:text-2xl">Drop leads list here</div>
            <div className="mt-5 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-2 font-mono text-sm text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.12)]">
              5,000 Contacts Ready
            </div>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl rounded-xl border border-[#242424] bg-[#0A0A0A] p-8 shadow-2xl lg:p-10">
            <div className="flex items-center justify-between border-b border-[#242424] pb-5 font-mono text-sm uppercase tracking-widest text-[#888888]">
              <span>Email Draft</span>
              <span className="text-emerald-400">Personalized</span>
            </div>
            <div className="mt-6 rounded-lg border border-[#242424] bg-black p-6 font-mono text-base leading-8 text-[#888888] lg:text-lg">
              Hi <span className="text-[#FF5A1F]">{"{{first_name}}"}</span>, noticed your team at <span className="text-[#FF5A1F]">{"{{company}}"}</span> is scaling outbound...
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button type="button" className="rounded-lg border border-[#333333] bg-[#181818] px-4 py-4 font-mono text-base font-bold text-[#B0B0B0]">Export CSV</button>
              <button type="button" className="rounded-lg bg-[#FF5A1F] px-4 py-4 font-mono text-base font-bold text-white shadow-[0_0_22px_rgba(255,90,31,0.28)]">Regenerate</button>
            </div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative h-80 w-full max-w-2xl">
            <div className="absolute left-[24%] right-[24%] top-1/2 h-px -translate-y-1/2 bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.75)]">
              <div className="h-full w-full animate-pulse bg-[#FF5A1F]" />
            </div>
            <div className="absolute left-[60%] top-1/2 h-[42%] w-px -translate-y-1/2 bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.75)]" />
            <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/10 px-5 py-2 font-mono text-sm text-[#FF5A1F]">
              Deploying 500 Leads...
            </div>
            <div className="absolute left-0 top-1/2 z-10 flex h-24 w-24 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#FF5A1F]/35 bg-[#0A0A0A] font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_30px_rgba(255,90,31,0.18)] sm:h-28 sm:w-28 sm:text-base lg:h-32 lg:w-32 lg:text-lg">
              FrameLeads
            </div>
            <div className="absolute right-0 top-[20%] z-10 flex h-16 w-24 items-center justify-center rounded-xl border border-[#242424] bg-[#0A0A0A] font-mono text-xs text-white shadow-xl sm:w-28 sm:text-base lg:h-20 lg:w-36 lg:text-lg">Smartlead</div>
            <div className="absolute bottom-[20%] right-0 z-10 flex h-16 w-24 items-center justify-center rounded-xl border border-[#242424] bg-[#0A0A0A] font-mono text-xs text-white shadow-xl sm:w-28 sm:text-base lg:h-20 lg:w-36 lg:text-lg">Instantly</div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl rounded-xl border border-[#242424] bg-[#0A0A0A] p-8 shadow-2xl lg:p-10">
            <div className="flex items-center justify-between border-b border-[#242424] pb-4 font-mono text-sm uppercase tracking-widest text-[#888888]">
              <span>Inbox / New reply</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="mt-6 rounded-2xl rounded-tl-sm bg-[#242424] px-6 py-5 font-sans text-lg leading-relaxed text-white/80">
              Sounds interesting, do you have time Tuesday?
            </div>
            <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 font-mono text-sm text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.12)]">
                [ Intent: Meeting Ready ]
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#242424] bg-black">
                <div className="relative h-7 w-7 rounded-sm border border-[#FF5A1F]">
                  <div className="absolute left-0 right-0 top-1.5 border-t border-[#FF5A1F]" />
                  <div className="absolute -top-1 left-1 h-2 border-l border-[#FF5A1F]" />
                  <div className="absolute -top-1 right-1 h-2 border-l border-[#FF5A1F]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full max-w-xl rounded-xl border border-[#242424] bg-[#0A0A0A] p-8 text-center shadow-2xl lg:p-10">
            <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 shadow-[0_0_32px_rgba(255,90,31,0.22)]">
              <div className="h-7 w-10 rounded-t-full border-2 border-b-0 border-[#FF5A1F]" />
              <div className="h-9 w-14 rounded-md bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.55)]" />
            </div>
            <div className="mt-7 font-mono text-lg font-bold text-red-500">High-Stakes Reply Paused</div>
            <button type="button" className="mt-7 w-full rounded-lg bg-[#FF5A1F] px-5 py-4 font-mono text-base font-bold text-white shadow-[0_0_24px_rgba(255,90,31,0.28)] lg:text-lg">
              Review in Dashboard &rarr;
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function StepByStepHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="relative mx-auto w-full max-w-7xl border-t border-white/5 px-4 py-16 sm:px-6 md:py-24 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mb-10 flex flex-col items-center text-center md:mb-16 lg:mb-20"
      >
        <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[#FF5A1F]">{"// THE ARCHITECTURE"}</div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">How it works</h2>
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#8A8A93] sm:text-lg">
          FrameLeads handles the heavy lifting of signal-based acquisition so you can focus on closing.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="order-last flex w-full flex-col space-y-0 pb-10 md:pb-16 lg:order-first lg:col-span-5 lg:pb-32">
          {steps.map((step, index) => {
            const isActive = activeStep === index;

            return (
              <button
                type="button"
                key={step.title}
                onClick={() => setActiveStep(index)}
                className="group flex cursor-pointer flex-col items-start space-y-1 rounded-xl p-3 text-left transition-all duration-300 hover:bg-white/[0.02] sm:p-4"
              >
                <span className={`font-mono text-[10px] font-bold uppercase transition-colors duration-300 sm:text-xs ${isActive ? "text-[#FF5A1F]" : "text-neutral-500"}`}>
                  STEP {index + 1}
                </span>
                <span className={`font-sans text-lg font-bold transition-colors duration-300 sm:text-xl ${isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"}`}>
                  {step.title}
                </span>
                <span className={`overflow-hidden pl-0 transition-all duration-500 ease-in-out ${isActive ? "mt-1 max-h-[150px] opacity-100" : "mt-0 max-h-0 opacity-0"}`}>
                  <span className="block text-xs leading-relaxed text-[#8A8A93] sm:text-sm">{step.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="sticky top-32 order-first mb-8 h-fit w-full self-start max-lg:static max-lg:top-auto lg:order-last lg:col-span-7 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#242424] bg-[#1A1A1A]/80 p-6 shadow-2xl backdrop-blur-xl [box-shadow:0_25px_50px_-12px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.05)] sm:min-h-[480px] md:p-8 lg:min-h-[550px] lg:p-12">
              <div key={activeStep} className="step-visual-enter flex h-full w-full items-center justify-center">
                <StepVisual activeStep={activeStep} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
