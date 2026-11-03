"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { replyScenarios, type ReplyScenario } from "../reply-decision-preview";

type SignalIcon = "intent" | "context" | "rules" | "approval" | "bolt";

function SignalIconMark({ kind, size = 18 }: { kind: SignalIcon; size?: number }) {
  const paths: Record<SignalIcon, string[]> = {
    intent: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M12 12h.01"],
    context: ["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M7 8h10", "M7 12h10", "M7 16h6"],
    rules: ["M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z", "m8.5 12 2.3 2.3 4.7-4.7"],
    approval: ["M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "m16 11 2 2 4-4"],
    bolt: ["m13 2-9 12h7l-1 8 10-13h-7l0-7Z"],
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    {paths[kind].map((path) => <path key={path} d={path} />)}
  </svg>;
}

const decisionSignals: { label: string; icon: SignalIcon }[] = [
  { label: "Intent", icon: "intent" },
  { label: "Context", icon: "context" },
  { label: "Rules", icon: "rules" },
  { label: "Approval", icon: "approval" },
];


const journeyDescriptions = [
  "Identifies the prospect's stated intent.",
  "Checks available conversation context.",
  "Applies the configured seller rules.",
  "Determines the required human control.",
] as const;

function DecisionJourney({ reducedMotion }: { reducedMotion: boolean }) {
  return <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#FF5A1F]/20 bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,90,31,.075),transparent_65%),linear-gradient(135deg,#242424,#1A1A1A_72%)] px-3.5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_16px_30px_rgba(26,26,26,.18)] sm:px-5" data-testid="connected-decision-journey" aria-label="Illustrative connected decision path: Intent, Context, Rules, Approval, then recommended action">
    <div aria-hidden="true" className="pointer-events-none absolute left-[13%] right-[13%] top-[39px] h-[2px] bg-gradient-to-r from-[#FF5A1F]/20 via-[#FF5A1F]/55 to-[#FF5A1F]/20" />
    {!reducedMotion && <motion.span aria-hidden="true" className="pointer-events-none absolute top-[35px] z-10 h-[10px] w-[10px] rounded-full bg-[#FF5A1F] shadow-[0_0_13px_5px_rgba(255,90,31,.45)]"
      animate={{ left: ["12%", "87%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 4.8, ease: "linear", repeat: Infinity, repeatDelay: .7 }} />}
    <div className="relative z-20 grid grid-cols-4 gap-1.5 sm:gap-3">
      {decisionSignals.map((signal, index) => <div key={signal.label} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
        <motion.div className="grid h-11 w-11 place-items-center rounded-xl border border-[#FF5A1F]/30 bg-[#1A1A1A] text-[#FF5A1F] sm:h-12 sm:w-12"
          animate={reducedMotion ? {} : { boxShadow: ["0 0 0px rgba(255,90,31,0)", "0 0 16px rgba(255,90,31,.55)", "0 0 0px rgba(255,90,31,0)"], borderColor: ["rgba(255,90,31,.25)", "rgba(255,90,31,.85)", "rgba(255,90,31,.25)"] }}
          transition={{ duration: 1.15, delay: index * 1.06, repeat: Infinity, repeatDelay: 4.1, ease: "easeInOut" }}>
          <SignalIconMark kind={signal.icon} size={21} />
        </motion.div>
        <span className="text-[11px] font-semibold text-white">{signal.label}</span>
        <span className="hidden max-w-[150px] text-[10px] leading-snug text-[#888888] sm:block">{journeyDescriptions[index]}</span>
      </div>)}
    </div>
    <div className="mt-4 flex items-center justify-center gap-2 border-t border-[#FF5A1F]/10 pt-3">
      <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-transparent to-[#FF5A1F]" />
      <motion.span className="grid h-6 w-6 place-items-center rounded-full bg-[#1A1A1A] text-[#FF5A1F]"
        animate={reducedMotion ? {} : { boxShadow: ["0 0 0px rgba(255,90,31,0)", "0 0 14px rgba(255,90,31,.48)", "0 0 0px rgba(255,90,31,0)"] }}
        transition={{ duration: 1.15, delay: 4.25, repeat: Infinity, repeatDelay: 4.1 }}>
        <SignalIconMark kind="bolt" size={14} />
      </motion.span>
      <span className="text-[11px] font-semibold text-[#FF5A1F]">Decision formed</span>
      <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-[#FF5A1F] to-transparent" />
    </div>
  </div>;
}

function ProspectAvatar({ scenario }: { scenario: ReplyScenario }) {
  const portraits: Record<ReplyScenario["id"], string> = {
    ambiguous: "/images/reply-preview-prospects/maya-chen.jpg",
    pricing: "/images/reply-preview-prospects/daniel-brooks.jpg",
    handoff: "/images/reply-preview-prospects/nadia-hassan.jpg",
  };
  return <Image src={portraits[scenario.id]} alt={"Fictional prospect " + scenario.prospectName} width={48} height={48}
    className="h-12 w-12 shrink-0 rounded-full border border-[#FF5A1F]/50 object-cover object-center shadow-[0_0_0_3px_rgba(255,90,31,.08),0_5px_15px_rgba(26,26,26,.35)]" />;
}

function ProcessingBolt({ reducedMotion }: { reducedMotion: boolean }) {
  return <div role="status" aria-label="Illustrative reply processing" className="flex min-h-[235px] flex-col items-center justify-center gap-3 rounded-2xl bg-[#242424] px-4 py-5 text-center">
    <motion.svg aria-hidden="true" viewBox="0 0 40 40" width="42" height="42" fill="none"
      className="overflow-visible text-[#FF5A1F]"
      animate={reducedMotion ? {} : { opacity: [.48, 1, .48], filter: ["drop-shadow(0 0 0px rgba(255,90,31,0))", "drop-shadow(0 0 17px rgba(255,90,31,.95))", "drop-shadow(0 0 0px rgba(255,90,31,0))"] }}
      transition={{ duration: 1.15, ease: "easeInOut", repeat: reducedMotion ? 0 : Infinity }}>
      <path d="M23 3 8 21h11l-2 16L33 16H22L23 3Z" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round" />
    </motion.svg>
    <p className="text-sm font-semibold text-white">Processing the sample reply…</p>
    <p className="max-w-[260px] text-[11px] leading-relaxed text-[#888888]">Reading context and checking illustrative seller rules.</p>
    <span className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
      <motion.span className="block h-full w-1/3 rounded-full bg-[#FF5A1F]" animate={reducedMotion ? {} : { x: [0, 115, 0] }} transition={{ duration: 1.2, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }} />
    </span>
    <p className="text-[10px] text-[#888888]">Illustration only. Not a live AI analysis or message send.</p>
  </div>;
}

function DecisionPacket({ scenario, phase, reducedMotion }: { scenario: ReplyScenario; phase: number; reducedMotion: boolean }) {
  const ready = phase > 0;
  return <article className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-white/[.095] bg-[#1A1A1A] shadow-[0_20px_48px_-32px_rgba(26,26,26,.85)]" aria-label="FrameLeads reply decision packet" data-testid="compact-decision-packet">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.075] px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[.08em] text-[#FF5A1F]">FRAMELEADS / REPLY INTELLIGENCE</span>
      </div>
          <span className="rounded-full border border-[#FF5A1F]/20 bg-[#FF5A1F]/[.085] px-2.5 py-1 text-[10px] font-semibold text-white">{ready ? scenario.authority : "Illustrative processing"}</span>
    </header>

    <div className="mb-4 grid min-w-0 gap-3 p-3 sm:p-4 md:grid-cols-2">
      <section className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#FF5A1F]/20 bg-[radial-gradient(ellipse_at_5%_0%,rgba(255,90,31,.1),transparent_60%),linear-gradient(135deg,#242424,#1A1A1A_72%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.065),0_16px_34px_rgba(26,26,26,.22)] sm:p-5" aria-label="Incoming reply">
        <div className="flex min-w-0 items-center gap-3 border-b border-white/[.09] pb-4">
          <ProspectAvatar scenario={scenario} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{scenario.prospectName}</p>
            <p className="truncate text-[11px] text-[#888888]">{scenario.role} · {scenario.company}</p>
          </div>
        </div>
        <p className="mt-4 break-words rounded-xl border border-white/[.055] bg-[#1A1A1A]/[.65] px-3.5 py-3 text-[14px] font-medium leading-[1.6] text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] sm:mt-5 sm:px-4 sm:py-3.5 sm:text-[15px]">“{scenario.reply}”</p>
        <div className="mt-auto pt-4">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[.11em] text-[#888888]">Sample incoming reply</p>
        </div>
      </section>

      <section className="flex min-w-0 flex-col" aria-label="Recommended decision" aria-live="polite">
        {!ready ? <ProcessingBolt reducedMotion={reducedMotion} /> : <motion.div
          key={scenario.id + "-ready"}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .5 }}
          className="relative flex h-full min-h-[235px] flex-col overflow-hidden rounded-2xl border border-[#FF5A1F]/25 bg-[radial-gradient(ellipse_at_92%_0%,rgba(255,90,31,.12),transparent_60%),linear-gradient(135deg,#242424,#1A1A1A_72%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.065),0_16px_34px_rgba(26,26,26,.22)] sm:p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.08em] text-[#FF5A1F]"><SignalIconMark kind="bolt" size={15} /> Decision ready</p>
          <h2 className="mt-2 text-[17px] font-bold leading-snug text-white sm:text-[19px]">{scenario.nextAction}</h2>
          <p className="mb-5 mt-2 text-[12px] leading-[1.45] text-white/75">{scenario.why}</p>
          {phase >= 2 && <motion.div initial={reducedMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-auto flex items-start gap-2.5 rounded-xl border border-[#FF5A1F]/25 bg-[linear-gradient(110deg,rgba(255,90,31,.12),rgba(36,36,36,.72))] px-3.5 py-3 text-[12px] font-medium leading-snug text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_8px_20px_rgba(26,26,26,.16)]">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F]"><SignalIconMark kind="approval" size={14} /></span><span><strong className="block text-[10px] uppercase tracking-[.08em] text-[#FF5A1F]">Human checkpoint</strong><span className="mt-1 block">{scenario.authority} · {scenario.rule}</span></span>
          </motion.div>}
          {phase < 2 && <span className="mt-auto h-9" aria-hidden="true" />}
        </motion.div>}
      </section>
    </div>

    {ready && <motion.details initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }}
      className="group mx-3 mb-3 rounded-2xl border border-[#FF5A1F]/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,90,31,.075),transparent_60%),linear-gradient(135deg,#242424,#1A1A1A_72%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_16px_34px_rgba(26,26,26,.2)] sm:mx-4 sm:mb-4 sm:p-5" data-testid="decision-explanation">
      <summary className="cursor-pointer list-none outline-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[.055em] text-white">How the decision was reached</p>
          <span className="text-sm text-[#888888] transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
        </div>
        <DecisionJourney reducedMotion={reducedMotion} />
      </summary>
      <div className="mt-4 grid gap-4 border-t border-white/[.075] pt-4 text-xs leading-relaxed text-white/75 sm:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold text-[#FF5A1F]">Intent</p>
          <p>{scenario.intent}</p>
          <p className="mt-1 text-[#888888]">{scenario.confidence}</p>
        </div>
        <div>
          <p className="mb-1 font-semibold text-[#FF5A1F]">Prospect context</p>
          <ul className="space-y-1.5">{scenario.context.map((point) => <li key={point}>• {point}</li>)}</ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-[#FF5A1F]">Seller rule</p>
          <p>{scenario.rule}</p>
          <p className="mt-1 text-[#888888]">{scenario.ruleSource}</p>
        </div>
        <div>
          <p className="mb-1 font-semibold text-[#FF5A1F]">Approval and safeguards</p>
          <p>{scenario.authorityDetail}</p>
          <p className="mt-2 text-[#888888]">{scenario.safeguard}</p>
        </div>
      </div>
    </motion.details>}
    <p className="px-4 pb-3 text-[10px] leading-relaxed text-[#888888] sm:px-5">
      Interactive preview using sample replies and rules. No messages are sent.
    </p>
  </article>;
}

export default function ReplyDecisionPreview({ embedded = false }: { embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState<ReplyScenario["id"]>("pricing");
  const [phase, setPhase] = useState(4);
  const [cycle, setCycle] = useState(0);
  const reducedMotion = useReducedMotion();
  const decisionRef = useRef<HTMLDivElement>(null);
  const active = replyScenarios.find((scenario) => scenario.id === selectedId) ?? replyScenarios[1];

  useEffect(() => {
    if (cycle === 0) return; // Preselected example is readable immediately.
    const delays = [2600, 3240, 3880, 4520];
    const timers = delays.map((ms, index) => window.setTimeout(() => setPhase(index + 1), reducedMotion ? 0 : ms));
    return () => timers.forEach(window.clearTimeout);
  }, [cycle, reducedMotion]);

  function selectScenario(id: ReplyScenario["id"]) {
    setSelectedId(id);
    setPhase(reducedMotion ? 4 : 0);
    setCycle((value) => value + 1);
    window.requestAnimationFrame(() => decisionRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" }));
  }

  const content = <>
      <section id="scenarios" className="scroll-mt-5 pb-1 pt-10 sm:pt-14" aria-labelledby="scenario-title">
        <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#FF5A1F]">Illustrative product preview · no signup required</p>
        <h1 id="scenario-title" className="mx-auto mt-3 max-w-3xl text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl">Three replies. Three different decisions.</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/70 sm:text-base">Choose a reply to see how FrameLeads would recommend the next action. Human approval remains in control where needed.</p>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-3" aria-label="Choose an illustrative reply scenario">
          {replyScenarios.map((scenario) => {
            const selected = selectedId === scenario.id;
            return <button key={scenario.id} type="button" aria-pressed={selected} onClick={() => selectScenario(scenario.id)}
              className={"min-w-0 rounded-2xl border px-4 py-3 text-left transition-[background,box-shadow,border-color,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] " +
                (selected ? "border-[#FF5A1F]/65 bg-[radial-gradient(ellipse_at_75%_0%,rgba(255,90,31,.12),transparent_70%),linear-gradient(145deg,#242424,#1A1A1A_70%)] shadow-[0_9px_25px_rgba(255,90,31,.085),inset_0_1px_0_rgba(255,90,31,.16)]" : "border-white/[.12] bg-[radial-gradient(ellipse_at_90%_0%,rgba(255,90,31,.06),transparent_67%),linear-gradient(145deg,#242424,#1A1A1A)] shadow-[inset_0_1px_0_rgba(255,255,255,.045)] hover:border-[#FF5A1F]/40 hover:shadow-[0_10px_27px_rgba(255,90,31,.065)] hover:-translate-y-0.5")}>
              <span className="font-mono text-[9px] uppercase tracking-[.11em] text-[#FF5A1F]">Scenario {scenario.number}</span>
              <span className="mt-1 block text-[14px] font-semibold text-white">{scenario.title}</span>
              <span className="mt-1 block text-[11px] leading-snug text-[#888888]">{scenario.teaser}</span>
            </button>;
          })}
        </div>
      </section>

      <div ref={decisionRef} className="scroll-mt-4">
        <DecisionPacket scenario={active} phase={phase} reducedMotion={Boolean(reducedMotion)} />
      </div>
      <div className="relative mt-6 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#FF5A1F]/25 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,90,31,.1),transparent_60%),linear-gradient(135deg,#242424,#1A1A1A_72%)] px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.065),0_16px_34px_rgba(26,26,26,.22)] sm:px-8 sm:py-7">
        <p className="max-w-2xl text-[13px] leading-relaxed text-white/75 sm:text-sm"><span className="mb-1.5 block text-base font-bold text-white sm:text-lg">Want to stop being the bottleneck every time someone replies?</span>Try the $10 Micro-Pilot to see what clearer next moves and faster follow-up decisions could look like in your own outbound workflow—with fewer replies waiting on you and less second-guessing for your team.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/checkout/micro-pilot" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FF5A1F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#FF5A1F]/90">Try the $10 Micro-Pilot</Link>
          <Link href="/?audit=open" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm text-white/85 hover:border-white/40 hover:text-white">Find My Reply Bottleneck</Link>
        </div>
      </div>
  </>;

  if (embedded) return <div data-testid="inline-reply-scenarios" className="min-w-0 text-left text-white">{content}</div>;

  return <main id="main-content" className="min-h-screen min-w-0 overflow-x-clip bg-[#1A1A1A] text-white">
    <div className="h-[3px] bg-gradient-to-r from-[#FF5A1F] via-[#FF5A1F]/60 to-transparent" />
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-7 lg:px-9">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] pb-5">
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-[#FF5A1F]" aria-label="FrameLeads homepage">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg object-contain" />
          <span className="font-heading text-lg font-bold">FrameLeads</span>
        </Link>
        <Link href="/" className="text-xs font-medium text-[#888888] underline-offset-4 hover:text-white hover:underline">Back to website ↗</Link>
      </header>

      {content}

    </div>
  </main>;
}
