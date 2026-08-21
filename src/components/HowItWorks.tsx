"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const cardClassName =
  "h-[36rem] overflow-hidden rounded-2xl border border-[#242424] bg-[#1A1A1A] shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FF5A1F]/30 hover:shadow-[0_10px_40px_-10px_rgba(255,90,31,0.15)] sm:h-[38rem] lg:h-[35rem]";

function BentoCard({ visual, title, description, index }: { visual: ReactNode; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <article className={cardClassName}>
        <div className="h-[60%] overflow-hidden border-b border-[#242424] bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,31,0.08),transparent_58%)] p-5 sm:p-7">
          {visual}
        </div>
        <div className="flex h-[40%] flex-col justify-center p-5 sm:p-6">
          <h3 className="font-sans text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-[#888888]">{description}</p>
        </div>
      </article>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section id="solutions" className="relative w-full border-t border-white/5 px-4 py-16 sm:px-6 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto mb-10 flex max-w-7xl flex-col items-center text-center md:mb-16"
      >
        <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[#FF5A1F]">{"// FEATURES"}</div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Close more deals. Without typing more replies.</h2>
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#888888] sm:text-lg">
          FrameLeads plugs directly into your existing sending tools. It finds the intent, drafts the reply, and books the meeting—all from one autonomous intelligence layer.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BentoCard
          index={0}
          title="Zero-Code Ingestion."
          description="Drop raw CSVs directly into the engine. The system automatically maps columns, cleans the data, and preps your lead list instantly."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-black p-5 shadow-2xl">
                <div className="mx-auto flex h-20 w-16 flex-col items-center justify-center rounded-lg border border-[#242424] bg-[#090909] shadow-[0_0_30px_rgba(255,90,31,0.18)]">
                  <div className="mb-2 h-1 w-7 rounded-full bg-[#333333]" />
                  <span className="font-mono text-xs font-bold tracking-wider text-[#FF5A1F]">CSV</span>
                </div>
                <div className="mt-6 flex items-center justify-between font-mono text-[10px] text-[#888888]">
                  <span>Mapping Data...</span>
                  <span className="text-[#FF5A1F]">100%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#242424]">
                  <div className="h-full w-full rounded-full bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,0.8)]" />
                </div>
              </div>
            </div>
          }
        />

        <BentoCard
          index={1}
          title="The Omnichannel Sandbox."
          description="Generate tailored, multi-channel copy across Email and LinkedIn instantly. Review the AI's logic, regenerate with 1-click, and perfect the messaging before pushing it live."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="grid h-[78%] w-full max-w-sm grid-cols-[0.8fr_1.2fr] overflow-hidden rounded-xl border border-[#242424] bg-black shadow-2xl">
                <div className="border-r border-[#242424] p-3 sm:p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#333333] bg-[#161616] font-mono text-[10px] text-[#FF5A1F]">AW</div>
                  <div className="mt-4 h-2 w-3/4 rounded-full bg-[#888888]/40" />
                  <div className="mt-2 h-1.5 w-1/2 rounded-full bg-[#888888]/20" />
                  <div className="mt-5 space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-[#888888]/15" />
                    <div className="h-1.5 w-4/5 rounded-full bg-[#888888]/15" />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between border-b border-[#242424] pb-3 font-mono text-[9px] uppercase tracking-wider text-[#888888]">
                    <span>Email Draft</span>
                    <span className="text-[#FF5A1F]">AI</span>
                  </div>
                  <div className="mt-4 space-y-3 font-mono text-[9px] leading-relaxed text-[#888888] sm:text-[10px]">
                    <div className="h-1.5 w-11/12 rounded-full bg-[#888888]/30" />
                    <p>
                      Hi <span className="text-[#FF5A1F]">{"{{ first_name }}"}</span>, noticed your team is scaling
                      <span className="text-[#FF5A1F]"> outbound</span>.
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-[#888888]/20" />
                    <div className="h-1.5 w-4/5 rounded-full bg-[#888888]/20" />
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <BentoCard
          index={2}
          title="1-Click Stack Sync."
          description="Push your generated, highly-personalized campaigns directly to Smartlead, Instantly, or your existing sending stack with a single click."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="relative h-52 w-full max-w-xs">
                <div className="absolute left-1/2 top-1/2 h-px w-[58%] -translate-x-1/2 -translate-y-1/2 bg-[#FF5A1F] shadow-[0_0_9px_rgba(255,90,31,0.65)]" />
                <div className="absolute left-1/2 top-1/2 h-[62%] w-px -translate-x-1/2 -translate-y-1/2 bg-[#FF5A1F] shadow-[0_0_9px_rgba(255,90,31,0.65)]" />
                <div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[#FF5A1F]/40 bg-black font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_28px_rgba(255,90,31,0.22)]">FRAME</div>
                <div className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl border border-[#242424] bg-black font-mono text-[9px] text-[#888888]">SL</div>
                <div className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl border border-[#242424] bg-black font-mono text-[9px] text-[#888888]">IN</div>
                <div className="absolute left-1/2 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-[#242424] bg-black font-mono text-[9px] text-[#888888]">CRM</div>
              </div>
            </div>
          }
        />

        <BentoCard
          index={3}
          title="AI Inbox Triage."
          description="The AI actively monitors your inbox, identifies high-intent signals, and drafts a personalized reply for every objection — instantly, in your voice."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-sm rounded-xl border border-[#242424] bg-black p-4 shadow-2xl sm:p-5">
                <div className="w-[88%] rounded-2xl rounded-tl-sm bg-[#242424] px-4 py-3 font-sans text-xs leading-relaxed text-white/75 sm:text-sm">How does this compare to our setup?</div>
                <div className="mt-4 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[9px] text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.12)] sm:text-[10px]">[ Intent: Competitor Objection ]</div>
                <div className="mt-4 flex w-fit items-center gap-1 rounded-full border border-[#242424] bg-[#111111] px-3 py-2">
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#888888]" style={{ animationDelay: `${dot * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          }
        />

        <BentoCard
          index={4}
          title="Absolute brand protection."
          description="Pause automation on high-stakes replies. The system flags complex objections and routes them to your Executive Override Queue for manual review before sending."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-black p-5 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 shadow-[0_0_28px_rgba(255,90,31,0.2)]">
                  <div className="h-5 w-7 rounded-t-full border-2 border-b-0 border-[#FF5A1F]" />
                  <div className="h-6 w-9 rounded-md bg-[#FF5A1F]" />
                </div>
                <div className="mt-5 inline-flex rounded-full border border-[#FF5A1F]/20 bg-[#FF5A1F]/10 px-3 py-1.5 font-mono text-[9px] text-[#FF5A1F] sm:text-[10px]">High-Stakes Reply Paused</div>
                <button type="button" className="mt-5 w-full rounded-lg bg-[#FF5A1F] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_22px_rgba(255,90,31,0.25)]">Approve &amp; Send</button>
              </div>
            </div>
          }
        />

        <BentoCard
          index={5}
          title="Zero-touch calendar booking."
          description="When an interested prospect replies, the system reads your live calendar, proposes the next step, and drops the booked meeting directly into your schedule."
          visual={
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-xs rounded-xl border border-[#242424] bg-black p-4 shadow-2xl sm:p-5">
                <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-[#888888]">Next available</div>
                    <div className="mt-1 font-sans text-sm font-bold text-white">Thursday, Aug 20</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 font-mono text-sm font-bold text-emerald-400">✓</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">10:30 AM</button>
                  <button type="button" className="rounded-lg border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-3 font-mono text-xs font-bold text-[#FF5A1F] shadow-[0_0_16px_rgba(255,90,31,0.12)]">2:00 PM</button>
                </div>
                <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Live calendar connected
                </div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}
