"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState, type ReactNode } from "react";

/**
 * Four parts of the same prospect reply, displayed as isolated FrameLeads UI modules.
 * Marketing-only presentation: stage navigation is interactive; simulated product
 * controls neither send messages nor mutate any account.
 */
const stages = [
  {
    id: "understand",
    number: "01",
    label: "UNDERSTAND",
    kicker: "READ THE SIGNAL",
    heading: "Know which reply deserves attention.",
    description: "Surface the buying questions and timing hiding inside the reply.",
    result: "Pricing, proof and a near-term buying window are now visible.",
  },
  {
    id: "remember",
    number: "02",
    label: "REMEMBER",
    kicker: "CONNECT THE CONTEXT",
    heading: "Don't answer the reply in isolation.",
    description: "Bring the known prospect context together with approved offer information.",
    result: "The information needed for a credible answer is clear.",
  },
  {
    id: "decide",
    number: "03",
    label: "DECIDE",
    kicker: "PREPARE THE NEXT MOVE",
    heading: "Turn the signal into a useful next step.",
    description: "See the reasoned recommendation alongside a response prepared for review.",
    result: "A contextual next step and draft replace founder guesswork.",
  },
  {
    id: "control",
    number: "04",
    label: "CONTROL",
    kicker: "KEEP HUMAN AUTHORITY",
    heading: "Choose what can happen next.",
    description: "Keep review, company rules and sending authority visible before execution.",
    result: "The founder retains the final decision on what gets sent.",
  },
] as const;

type StageId = (typeof stages)[number]["id"];
type Tone = "orange" | "warm" | "red" | "green" | "neutral";

function Symbol({ name, className = "size-4" }: {
  name: "inbox" | "layers" | "spark" | "shield" | "clock" | "check" | "file" | "arrow" | "flame" | "refresh" | "archive" | "send";
  className?: string;
}) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true as const };
  if (name === "flame") return <svg {...common} fill="currentColor"><path d="M13.3 2.2c.5 3.2-.8 4.8-2.1 6.3-1.2 1.3-2.3 2.6-2.1 5.1.1 1.1.8 2 1.8 2.5-.1-2.1 1-3.4 2.2-4.6 1.1 1.4 2.8 2.7 2.8 5a4 4 0 0 1-4 4c-3.5 0-6-2.7-6-6.3 0-3.3 2-5.5 4-7.8 1.3-1.5 2.7-3 3.4-6.2Zm4.1 7.2c-.2 1.8.4 2.9 1.1 4 .7 1.1 1.4 2.3 1.4 4a5.9 5.9 0 0 1-6 5.9c3.5-1.5 4.1-4.2 3.2-6.4-.5-1.2-1.5-2.1-2.3-3.1.2-1.5 1.1-2.7 2.6-4.4Z"/></svg>;
  const stroke = { ...common, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "inbox": return <svg {...stroke}><path d="M4 5.5h16v13H4zM4 14h4l1.5 2h5l1.5-2h4M8 9h8"/></svg>;
    case "layers": return <svg {...stroke}><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg>;
    case "spark": return <svg {...stroke}><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></svg>;
    case "shield": return <svg {...stroke}><path d="m12 2 8 4v5.6c0 5-3.2 8.7-8 10.4-4.8-1.7-8-5.4-8-10.4V6l8-4Zm-4 10 3 3 5-5"/></svg>;
    case "clock": return <svg {...stroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "check": return <svg {...stroke}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>;
    case "file": return <svg {...stroke}><path d="M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h6"/></svg>;
    case "arrow": return <svg {...stroke}><path d="M4 12h15m-6-6 6 6-6 6"/></svg>;
    case "refresh": return <svg {...stroke}><path d="M20.2 11a8.2 8.2 0 0 0-14.9-4L3.5 9M3.5 5.5V9h3.6M3.8 13a8.2 8.2 0 0 0 14.9 4l1.8-2M20.5 18.5V15h-3.6"/></svg>;
    case "archive": return <svg {...stroke}><path d="M4 7h16v13H4V7ZM3 4h18v3H3Zm6 8h6"/></svg>;
    case "send": return <svg {...stroke}><path d="m3 11 18-8-8 18-2.5-7.5L3 11Zm7.5 2.5L21 3"/></svg>;
  }
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={"font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 " + className}>{children}</span>;
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const colors: Record<Tone, string> = {
    orange: "border-[#FF5A1F]/40 bg-[#FF5A1F]/[0.11] text-[#FF9972]",
    warm: "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
    red: "border-red-400/35 bg-red-500/[0.10] text-red-200",
    green: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
    neutral: "border-white/[0.13] bg-white/[0.04] text-white/65",
  };
  return <span className={"inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-tight " + colors[tone]}>{children}</span>;
}

function ProductCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"min-w-0 rounded-2xl border border-white/[0.11] bg-[#1A1717] p-4 shadow-[0_18px_50px_-38px_rgba(0,0,0,0.95)] sm:p-5 " + className}>{children}</div>;
}

function Outcome({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.045] px-3 py-3 sm:px-4">
    <span className="mt-0.5 shrink-0 text-[#FF875D]"><Symbol name="check" /></span>
    <p className="text-xs font-medium leading-relaxed text-white/75 sm:text-sm">{children}</p>
  </div>;
}

function ProspectIdentity() {
  return <div className="flex min-w-0 flex-wrap items-center gap-3">
    <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#FF5A1F]/25 bg-[#282222]">
      <Image src="/images/proof-avatars/elise.webp" alt="" fill sizes="40px" className="object-cover" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-white">Elise Varner</p>
      <p className="mt-0.5 text-xs text-white/50">Incoming outbound reply</p>
    </div>
    <Pill tone="orange"><Symbol name="flame" className="size-3.5" /> HOT</Pill>
  </div>;
}

function UnderstandView() {
  return <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
    <ProductCard className="border-[#FF5A1F]/25 bg-[linear-gradient(145deg,rgba(255,90,31,0.065),rgba(26,23,23,0.96)_60%)]">
      <div className="flex items-center justify-between gap-2"><Label>INBOX TRIAGE / SELECTED REPLY</Label><Symbol name="inbox" className="size-4 text-[#FF8B60]"/></div>
      <div className="mt-4"><ProspectIdentity /></div>
      <p className="mt-4 text-sm leading-relaxed text-white/75">“We&apos;re comparing outbound partners this week. Could you send pricing, a relevant B2B SaaS example, and how you&apos;d handle prospect replies? Our founder is reviewing options Thursday.”</p>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.09] pt-3">
        <Pill tone="red"><Symbol name="clock" className="size-3.5"/> Founder review Thursday</Pill>
        <Pill tone="orange">Prioritize this reply</Pill>
      </div>
    </ProductCard>
    <ProductCard>
      <div className="flex items-center justify-between gap-2"><Label>WHY NOW / SIGNALS</Label><Symbol name="spark" className="size-4 text-[#FF8B60]"/></div>
      <p className="mt-3 font-heading text-lg font-bold text-white sm:text-xl">A buying conversation, not a generic reply.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="orange">Pricing requested</Pill>
        <Pill tone="green">Proof requested</Pill>
        <Pill tone="warm">Workflow fit</Pill>
        <Pill tone="red">Thursday review</Pill>
      </div>
      <div className="mt-5 rounded-xl border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.07] px-4 py-3">
        <Label>INTERPRETATION</Label>
        <p className="mt-1 text-sm font-semibold text-white">Commercial evaluation with a stated review window</p>
      </div>
    </ProductCard>
  </div>;
}

function ContextRow({ title, detail, status }: { title: string; detail: string; status?: string }) {
  return <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
    <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#FF875D]">
      <Symbol name="check" className="size-3.5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-white/90">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/55">{detail}</p>
    </div>
    {status && <Pill>{status}</Pill>}
  </div>;
}

function RememberView() {
  return <div className="grid gap-4 lg:grid-cols-2">
    <ProductCard className="border-[#FF5A1F]/25">
      <div className="flex items-center justify-between gap-2"><Label>PROSPECT CONTEXT</Label><Symbol name="layers" className="size-4 text-[#FF8B60]"/></div>
      <div className="mt-4 border-b border-white/[0.09] pb-4"><ProspectIdentity /></div>
      <div className="mt-4 divide-y divide-white/[0.08]">
        <ContextRow title="Buying questions" detail="Pricing structure, relevant proof, and post-reply handling" />
        <ContextRow title="Evaluation timing" detail="Founder is reviewing partners Thursday" />
        <ContextRow title="Workflow focus" detail="Prospect wants to know what happens once leads respond" />
      </div>
    </ProductCard>
    <ProductCard>
      <div className="flex items-center justify-between gap-2"><Label>COMPANY CONTEXT TO APPLY</Label><Symbol name="file" className="size-4 text-[#FF8B60]"/></div>
      <p className="mt-3 text-sm leading-relaxed text-white/65">The response should use accurate information from the agency&apos;s own offer and rules.</p>
      <div className="mt-4 divide-y divide-white/[0.08]">
        <ContextRow title="Approved pricing" detail="Check the current offer before quoting rates" status="VERIFY" />
        <ContextRow title="Relevant case example" detail="Use supported proof, not an invented result" status="VERIFY" />
        <ContextRow title="Reply-handling approach" detail="Explain the agreed process in the prospect&apos;s context" />
      </div>
    </ProductCard>
  </div>;
}

function DecideView() {
  return <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
    <ProductCard className="border-[#FF5A1F]/30 bg-[linear-gradient(140deg,rgba(255,90,31,0.085),rgba(25,22,22,0.95)_66%)]">
      <div className="flex items-center justify-between gap-2"><Label>RECOMMENDED ACTION</Label><Symbol name="arrow" className="size-4 text-[#FF8B60]"/></div>
      <p className="mt-5 font-heading text-xl font-bold leading-snug text-[#FF946B] sm:text-2xl">Prepare tailored pricing + relevant proof</p>
      <p className="mt-3 text-sm leading-relaxed text-white/65">Address the actual buying questions, then ask which operational result matters most.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Pill tone="red"><Symbol name="clock" className="size-3.5"/> Review Thursday</Pill>
        <Pill tone="warm">Founder approval</Pill>
      </div>
    </ProductCard>
    <ProductCard>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2"><Symbol name="file" className="size-4 text-[#FF8B60]"/><Label>DRAFT RESPONSE</Label></span>
        <Pill tone="warm">Ready for review</Pill>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/75">“Hi Elise, thanks for the detail. Since your founder is reviewing options Thursday, I&apos;ll keep this focused on what you need to assess fit. I&apos;ll put together our pricing, a relevant B2B SaaS example, and how we handle replies after launch. Which matters more to your team: more qualified meetings, or less time managing replies?”</p>
      <div className="mt-4 border-t border-white/[0.08] pt-3 text-xs text-white/50">Draft prepared · No message sent</div>
    </ProductCard>
  </div>;
}

function MiniAction({ name, highlight = false }: { name: "archive" | "refresh" | "send"; highlight?: boolean }) {
  return <span className={"grid size-10 place-items-center rounded-xl border " + (highlight ? "border-[#FF5A1F]/65 bg-[#FF5A1F] text-white shadow-[0_8px_27px_-10px_rgba(255,90,31,0.8)]" : "border-white/[0.12] bg-[#151313] text-white/65")} aria-hidden="true">
    <Symbol name={name === "refresh" ? "refresh" : name} className="size-[18px]"/>
  </span>;
}

function ControlView() {
  return <div className="grid gap-4 lg:grid-cols-2">
    <ProductCard className="border-[#FF5A1F]/25">
      <div className="flex items-center justify-between gap-2"><Label>REVIEW / PERMISSIONS</Label><Symbol name="shield" className="size-4 text-[#FF8B60]"/></div>
      <p className="mt-4 font-heading text-xl font-bold text-white sm:text-2xl">Founder approval before sending.</p>
      <p className="mt-3 text-sm leading-relaxed text-white/65">The system prepares a recommended response without assuming authority over the agency&apos;s commercial promises.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Pill tone="warm">Draft ready to review</Pill>
        <Pill tone="red">Terms require verification</Pill>
      </div>
    </ProductCard>
    <ProductCard>
      <div className="flex flex-wrap items-center justify-between gap-2"><Label>RESPONSE REVIEW</Label><Pill tone="orange">Human-controlled</Pill></div>
      <div className="mt-4 rounded-xl border border-white/[0.09] bg-[#121010] p-4">
        <p className="text-sm font-semibold text-white">Elise Varner · Pricing + proof</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Review the draft and confirm that the promised pricing and examples are accurate before any send.</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        <p className="text-xs text-white/45">Review actions</p>
        <div className="flex items-center gap-2" aria-label="Preview of archive, regenerate and send controls. No live sending action.">
          <MiniAction name="archive" />
          <MiniAction name="refresh" />
          <MiniAction name="send" highlight />
        </div>
      </div>
    </ProductCard>
  </div>;
}

export default function DecisionIntelligenceWalkthrough() {
  const [active, setActive] = useState<StageId>("understand");
  const reduceMotion = useReducedMotion();
  const stage = stages.find((item) => item.id === active) ?? stages[0];
  const activeIndex = stages.findIndex((item) => item.id === active);
  const View = active === "understand" ? UnderstandView : active === "remember" ? RememberView : active === "decide" ? DecideView : ControlView;

  return <div className="relative isolate mx-auto mt-9 w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#131112] p-3 text-left shadow-[0_28px_75px_-52px_rgba(0,0,0,0.95)] sm:p-6 lg:p-8">
    <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-28 size-72 rounded-full bg-[#FF5A1F]/[0.075] blur-[85px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-[-6rem] h-72 w-80 rounded-full bg-[#FF5A1F]/[0.055] blur-[85px]" />
    <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-4 sm:px-0">
        <span className="flex items-center gap-2"><Symbol name="inbox" className="size-4 text-[#FF8B60]"/><Label>ONE REPLY · FOUR DECISION CHECKS</Label></span>
        <Pill tone="red"><Symbol name="clock" className="size-3.5"/> Founder review Thursday</Pill>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Explore FrameLeads decision stages">
        {stages.map((item) => {
          const selected = item.id === active;
          return <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            aria-controls="frameleads-walkthrough-panel"
            onClick={() => setActive(item.id)}
            className={"group relative min-w-0 rounded-xl border px-3 py-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF875D] sm:px-4 " + (selected ? "border-[#FF5A1F]/40 bg-[#FF5A1F]/[0.10]" : "border-white/[0.10] bg-[#1C1919] hover:border-[#FF5A1F]/[0.25] hover:bg-white/[0.035]")}
          >
            <span className={"block font-mono text-[10px] " + (selected ? "text-[#FF9166]" : "text-white/35")}>{item.number}</span>
            <span className={"mt-1 block font-heading text-xs font-bold uppercase tracking-[0.07em] sm:text-sm " + (selected ? "text-white" : "text-white/65")}>{item.label}</span>
            <span className={"absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-opacity sm:left-4 sm:right-4 " + (selected ? "bg-[#FF5A1F] opacity-100" : "bg-transparent opacity-0")} />
          </button>;
        })}
      </div>

      <div id="frameleads-walkthrough-panel" className="mt-4" aria-live="polite" aria-atomic="false">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            <div className="mb-4 flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-end sm:px-0">
              <div className="max-w-2xl">
                <Label className="text-[#FF946A]">{stage.kicker}</Label>
                <h3 className="mt-2 font-heading text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{stage.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{stage.description}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">STEP {stage.number} / 04</span>
            </div>
            <View />
            <Outcome>{stage.result}</Outcome>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[11px] text-white/40">
        <span>Elise&apos;s reply · One connected example</span>
        <span>{String(activeIndex + 1).padStart(2, "0")} / 04</span>
      </div>
    </div>
  </div>;
}
