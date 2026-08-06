"use client";

import { useState } from "react";

import Image from "next/image";

const steps = [
  {
    title: "Zero-Code Data Ingestion",
    description: "Drop raw CSVs directly into the engine. The system automatically maps columns and preps your lead list.",
    image: "/ingestion.jpg",
  },
  {
    title: "Campaign Context Engine",
    description: "Define your value proposition and angles once. The engine guarantees your outreach never sounds generic.",
    image: "/campaign.jpg",
  },
  {
    title: "Omnichannel Sandbox",
    description: "Generate tailored, multi-channel copy instantly across Email, LinkedIn, and WhatsApp.",
    image: "/sandbox.jpg",
  },
  {
    title: "1-Click Smartlead Sync",
    description: "Push your generated, highly-personalized campaigns directly to your sending stack with a single click.",
    image: "/deploy.jpg",
  },
  {
    title: "Autonomous Inbox Triage",
    description: "The AI actively monitors your inbox, handles standard objections, and identifies high-intent signals instantly.",
    image: "/inbox-triage.jpg",
  },
  {
    title: "Velvet Rope Governance",
    description: "Pause automation on high-stakes replies. The system queues them for your manual review before anything sends.",
    image: "/governance.jpg",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 border-t border-white/5">
      <div className="mb-16 md:mb-20">
        <div className="font-mono text-xs text-[#FF5A1F] mb-6 uppercase tracking-widest">// THE ARCHITECTURE</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">How it works</h2>
        <p className="text-base sm:text-lg text-[#8A8A93] leading-relaxed max-w-2xl">
          FrameLeads handles the heavy lifting of signal-based acquisition so you can focus on closing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
        
        {/* LEFT COLUMN: INTERACTIVE STEPS */}
        <div className="w-full lg:col-span-5 flex flex-col space-y-0 pb-32">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <div 
                key={index}
                onClick={() => setActiveStep(index)}
                className="cursor-pointer group flex flex-col items-start text-left space-y-1 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:bg-white/[0.02]"
              >
                <span className={`font-mono text-[10px] sm:text-xs font-bold uppercase transition-colors duration-300 ${isActive ? 'text-[#FF5A1F]' : 'text-neutral-500'}`}>
                  STEP {index + 1}
                </span>
                <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                  {step.title}
                </h3>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out pl-0 ${
                    isActive ? 'max-h-[150px] opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  <p className="text-[#8A8A93] text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: STICKY VISUALS */}
        <div className="w-full lg:col-span-7 lg:sticky top-[25vh] xl:top-[30vh] h-fit hidden lg:block">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_-12px_rgba(255,87,34,0.15)] relative">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <Image 
                  key={index}
                  src={step.image}
                  alt={step.title}
                  fill
                  unoptimized
                  className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
}
