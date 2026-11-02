"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { replyScenarios, type ReplyScenario } from "../reply-decision-preview";

const mono = "font-mono text-[10px] font-semibold uppercase tracking-[.15em]";
const card = "min-w-0 rounded-2xl border border-white/[.09] bg-[#191919] shadow-[inset_0_1px_0_rgba(255,255,255,.025)]";
const titleClass = "text-xl font-semibold leading-snug tracking-[-.025em] sm:text-[23px]";
const progressSteps = ["Read the incoming reply", "Check conversation context", "Match the seller's rules", "Choose a controlled next step"] as const;
const revealSections = ["AI interpretation", "Relevant context", "Why human review / seller rule", "Intent", "Governance", "Recommended action", "Final safeguard"] as const;

function ProspectPortrait({ scenario, size = "md" }: { scenario: ReplyScenario; size?: "sm" | "md" }) {
  const portrait = "/images/reply-preview-prospects.jpg";
  const [failed, setFailed] = useState(false);
  const dimension = size === "sm" ? 40 : 56;
  if (failed) return <span aria-label={`Portrait unavailable for fictional prospect ${scenario.prospectName}`} className={`grid shrink-0 place-items-center rounded-full border border-[#FF5A1F]/30 bg-[#272321] font-semibold text-[#FFB28C] ${size === "sm" ? "h-10 w-10 text-xs" : "h-14 w-14 text-sm"}`}>{scenario.prospectName.split(" ").map((part) => part[0]).join("")}</span>;
  return <Image src={portrait} alt={`Fictional portrait of ${scenario.prospectName}`} width={dimension} height={dimension} sizes={`${dimension}px`} loading="lazy" decoding="async"
    onError={() => setFailed(true)} className={`inline-block shrink-0 rounded-full border border-[#FF5A1F]/30 bg-[#272321] object-cover object-center shadow-[0_0_0_3px_rgba(255,90,31,.035)] ${size === "sm" ? "h-10 w-10" : "h-14 w-14"}`} />;
}

function DecisionProcessing({ stage, onSkip }: { stage: number; onSkip: () => void }) {
  return <div className="flex min-h-[360px] flex-col justify-center px-5 py-7 sm:px-8" role="status" aria-label="Illustrative decision sequence">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className={mono + " text-[#FF956A]"}>Illustrating the decision path</p>
      <button type="button" onClick={onSkip} className="rounded-md border border-white/[.14] px-3 py-2 text-xs text-[#CBCBCD] transition-colors hover:border-[#FF5A1F]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Skip animation</button>
    </div>
    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[.08]">
      <motion.div className="h-full rounded-full bg-[#FF5A1F] shadow-[0_0_14px_rgba(255,90,31,.5)]" animate={{ width: `${(stage + 1) * 25}%` }} transition={{ duration: .3, ease: "easeOut" }} />
    </div>
    <div className="mt-7 space-y-2.5">
      {progressSteps.map((step, index) => <div key={step} className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-300 ${index <= stage ? "border-[#FF5A1F]/25 bg-[#FF5A1F]/[.06] text-white" : "border-white/[.06] bg-white/[.015] text-[#727277]"}`}>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${index <= stage ? "border-[#FF5A1F] bg-[#FF5A1F] text-white" : "border-white/[.12]"}`}>{index < stage ? "✓" : String(index + 1).padStart(2, "0")}</span>
        <span className="text-sm font-medium">{step}</span>
        {index === stage && <motion.span aria-hidden="true" className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]" animate={{ opacity: [.35, 1, .35] }} transition={{ duration: .9, repeat: Infinity }} />}
      </div>)}
    </div>
    <p className="mt-6 text-xs leading-relaxed text-[#919195]">A staged illustration using fictional data, not a live AI analysis or a message being sent.</p>
  </div>;
}

function NumberedSection({
  index, label, children, prominent = false,
}: { index: string; label: string; children: React.ReactNode; prominent?: boolean }) {
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2, ease: "easeOut" }}
    className={`min-w-0 rounded-xl border p-4 transition-colors duration-500 sm:p-5 ${prominent ? "border-[#FF5A1F]/35 bg-[radial-gradient(ellipse_at_100%_0%,rgba(120,55,27,.2),transparent_65%),linear-gradient(145deg,#2b201b,#211c19)] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]" : "border-white/[.075] bg-[#1e1e20]"}`}>
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <span className={mono + " text-[#FF8556]"}>{index}</span>
      <span className={mono + " text-[#B4B4B6]"}>{label}</span>
    </div>
    {children}
  </motion.div>;
}

function DecisionDetails({ scenario, stage, revealCount, onSkip }: { scenario: ReplyScenario; stage: number; revealCount: number; onSkip: () => void }) {
  return <div className="mt-7 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]" data-testid="decision-details">
    <aside className="min-w-0 space-y-4">
      <div className={card + " overflow-hidden"}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] bg-[#212123] px-5 py-4">
          <span className={mono + " text-[#A9A9AB]"}>Incoming reply</span>
          <span className="rounded-full border border-white/[.12] px-2.5 py-1 font-mono text-[10px] text-[#A1A1A4]">Fictional prospect</span>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <ProspectPortrait scenario={scenario} />
            <div className="min-w-0">
              <p className="break-words text-base font-semibold text-white">{scenario.prospectName}</p>
              <p className="break-words text-xs text-[#ABABAF]">{scenario.role} · {scenario.company}</p>
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border border-white/[.1] bg-[#202023]">
            <div className="space-y-1 border-b border-white/[.07] px-4 py-3 text-[11px] leading-relaxed text-[#A2A2A6]">
              <p><span className="text-[#77777D]">From:</span> <span className="break-all text-[#C8C8CC]">{scenario.prospectEmail}</span></p>
              <p><span className="text-[#77777D]">Subject:</span> <span className="text-[#C8C8CC]">{scenario.subject}</span></p>
            </div>
            <p className="break-words px-4 py-5 text-[16px] font-medium leading-relaxed text-white sm:px-5 sm:text-[18px]">{scenario.reply}</p>
            <p className="border-t border-white/[.07] px-4 py-2 font-mono text-[9px] uppercase tracking-wider text-[#828287]">Illustrative inbound email · no live conversation</p>
          </div>
          <div className="border-l-2 border-[#FF5A1F] pl-4">
            <p className={mono + " text-[#FC9065]"}>The real challenge</p>
            <p className="mt-2 text-sm leading-relaxed text-[#D2D0D0]">{scenario.pain}</p>
          </div>
        </div>
      </div>
      <div className={card + " p-5 sm:p-6"}>
        <p className={mono + " text-[#8D8D92]"}>Without a clear decision process</p>
        <p className="mt-3 text-sm leading-relaxed text-[#CBCBCC]">{scenario.currentWorkaround}</p>
        <p className="mt-4 text-xs leading-relaxed text-[#8E8E91]">An illustrative workflow, not a measured claim about other software or teams.</p>
      </div>
    </aside>
    <div className={card + " min-w-0 overflow-hidden"}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] bg-gradient-to-r from-[#241C18] to-[#191919] px-5 py-4 sm:px-7">
        <div className="min-w-0">
          <p className={mono + " text-[#FF9061]"}>FrameLeads decision layer</p>
          <h3 className="mt-1 text-lg font-semibold">From reply to next action</h3>
        </div>
        <span className="rounded-full border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-1.5 font-mono text-[10px] font-semibold text-[#FFAC87]">Illustrative preview</span>
      </div>
      {stage < 4 ? <DecisionProcessing stage={stage} onSkip={onSkip} /> : <div className="space-y-3 px-5 py-5 sm:px-7 sm:py-7" aria-live="off" data-reveal-count={revealCount}>
        {revealCount > 0 && <NumberedSection index="01" label={revealSections[0]}>
          <p className="text-sm leading-relaxed text-white"><span className="sr-only">Understand the reply: </span>{scenario.intent}. {scenario.confidence}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#AFAFB1]">The reply alone cannot establish a confirmed purchase, budget, timing, or authority unless stated in the fixture.</p>
        </NumberedSection>}
        {revealCount > 1 && <NumberedSection index="02" label={revealSections[1]}>
          <p className="sr-only">Read the context</p><ul className="space-y-2">{scenario.context.map((item) => <li key={item} className="flex min-w-0 items-start gap-3 text-sm leading-relaxed text-[#CBCBCD]"><span aria-hidden="true" className="mt-1 text-[#FF7640]">◆</span><span className="min-w-0 break-words">{item}</span></li>)}</ul>
          <p className="mt-3 border-t border-white/[.08] pt-3 text-xs text-[#929296]">Unknown beyond the information shown in this fictional message and scenario.</p>
        </NumberedSection>}
        {revealCount > 2 && <NumberedSection index="03" label={revealSections[2]}>
          <p className="sr-only">Apply the seller&#39;s rules</p><p className="text-sm font-semibold leading-relaxed text-[#F5D1C1]">{scenario.rule}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#A5A0A0]">{scenario.ruleSource}</p>
        </NumberedSection>}
        {revealCount > 3 && <NumberedSection index="04" label={revealSections[3]}>
          <p className="text-lg font-semibold text-white">{scenario.intent}</p><p className="mt-2 text-sm leading-relaxed text-[#AFAFB1]">{scenario.confidence}</p>
        </NumberedSection>}
        {revealCount > 4 && <NumberedSection index="05" label={revealSections[4]}>
          <p className="text-sm font-semibold text-white">{scenario.authority}</p><p className="mt-1 text-xs leading-relaxed text-[#ADADB1]">{scenario.authorityDetail}</p>
        </NumberedSection>}
        {revealCount > 5 && <NumberedSection index="06" label="Recommended next action" prominent>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full border border-[#FF5A1F]/35 px-2.5 py-1 font-mono text-[9px] text-[#FFB28C]">Human-controlled</span></div>
          <h4 className="mt-3 text-lg font-bold leading-snug text-white sm:text-xl">{scenario.nextAction}</h4>
          <p className="mt-2 text-sm leading-relaxed text-[#D7C6BD]">{scenario.why}</p>
        </NumberedSection>}
        {revealCount > 6 && <NumberedSection index="07" label={revealSections[6]}>
          <p className="text-sm font-semibold text-white">{scenario.result}</p><p className="mt-1 text-xs leading-relaxed text-[#9B9B9F]">{scenario.safeguard}</p>
        </NumberedSection>}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[11px] leading-relaxed text-[#919195]">Illustrative decision preview · no live inference or action executed.</p>
          {revealCount < revealSections.length && <button type="button" onClick={onSkip} className="rounded-md border border-white/[.14] px-3 py-2 text-xs text-[#CBCBCD] transition-colors hover:border-[#FF5A1F]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Skip animation</button>}
        </div>
      </div>}
    </div>
  </div>;
}

export default function ReplyDecisionPreview() {
  const [selectedId, setSelectedId] = useState<ReplyScenario["id"] | null>(null);
  const [stage, setStage] = useState(0);
  const [revealCount, setRevealCount] = useState(0);
  const [sequence, setSequence] = useState(0);
  const reducedMotion = useReducedMotion();
  const detailsRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const active = replyScenarios.find((scenario) => scenario.id === selectedId) ?? null;

  useEffect(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    if (!selectedId || reducedMotion) return;
    const timers = [650, 1300, 1950, 2600].map((ms, index) => window.setTimeout(() => {
      setStage(index + 1);
      if (index === 3) {
        revealSections.forEach((_, revealIndex) => {
          const timer = window.setTimeout(() => setRevealCount(revealIndex + 1), (revealIndex + 1) * 220);
          timersRef.current = [...timersRef.current, timer];
        });
      }
    }, ms));
    timersRef.current = timers;
    return () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
    };
  }, [selectedId, sequence, reducedMotion]);

  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), []);

  const selectScenario = (id: ReplyScenario["id"]) => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    setStage(reducedMotion ? 4 : 0);
    setRevealCount(reducedMotion ? revealSections.length : 0);
    setSelectedId(id);
    setSequence((current) => current + 1);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      window.requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  return <main id="main-content" className="min-h-screen min-w-0 overflow-x-clip bg-[#131313] text-white">
    <div className="h-[3px] w-full bg-gradient-to-r from-[#FF5A1F] via-[#FF8A58] to-transparent" aria-hidden="true" />
    <div className="mx-auto w-full max-w-[1220px] min-w-0 px-4 pb-20 pt-6 sm:px-7 lg:px-10">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-white/[.09] pb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#FF6E36]" aria-label="FrameLeads homepage">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#FF5A1F]/35 bg-[#242424] font-heading text-2xl text-[#FF5A1F]" aria-hidden="true">ϟ</span>
          <span className="font-heading text-[19px] font-bold tracking-tight">FrameLeads</span>
        </Link>
        <Link href="/" className="rounded-md text-xs font-medium text-[#BDBDBF] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[#FF6E36]">Return to website ↗</Link>
      </header>

      <div className="mx-auto max-w-[890px] pb-10 pt-14 text-center sm:pt-20">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[.075] px-4 py-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#FFA581]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]" aria-hidden="true" /> For founder-led B2B agencies already running outbound
        </div>
        <h1 className="mx-auto mt-6 max-w-[800px] font-heading text-[36px] font-bold leading-[1.13] tracking-[-.035em] text-white sm:text-[50px] lg:text-[61px]">
          A prospect replied.<br /><span className="text-[#FF5A1F]">What happens next?</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[635px] text-base leading-[1.75] text-[#B8B8BC] sm:text-lg">
          See how reply intent, prospect context and your own sales rules shape the next action, while consequential decisions stay in human hands.
        </p>
        <p className="mx-auto mt-5 text-xs leading-relaxed text-[#85858B]">
          Explore three illustrated decisions. No signup, no form, no live email sent.
        </p>
      </div>

      <section aria-labelledby="choose-scenario">
        <div className="mb-5 flex flex-col items-start gap-2">
          <div>
            <p className={mono + " text-[#FF9167]"}>Step 01 / Pick a reply</p>
            <h2 id="choose-scenario" className="mt-2 font-heading text-[24px] font-semibold leading-tight sm:text-[30px]">Three replies. Three different decisions.</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#AFAFB2]">Choose the situation you recognize. Watch its decision unfold below.</p>
        </div>
        <div className="grid min-w-0 gap-4 md:grid-cols-3" aria-label="Choose a reply scenario">
          {replyScenarios.map((s) => {
            const selected = s.id === selectedId;
            return <button key={s.id} type="button" aria-pressed={selected} onClick={() => selectScenario(s.id)}
              className={"group relative flex min-w-0 flex-col items-start overflow-hidden rounded-2xl border p-5 text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:p-6 " +
                (selected ? "border-[#FF5A1F]/65 bg-[radial-gradient(ellipse_at_95%_0%,rgba(120,55,27,.22),transparent_55%),linear-gradient(145deg,#251e1a,#1b1a19_60%,#191919)] shadow-[0_0_34px_rgba(255,90,31,.09),inset_0_1px_0_rgba(255,255,255,.04)]" : "border-white/[.12] bg-[radial-gradient(ellipse_at_100%_0%,rgba(103,54,32,.12),transparent_50%),linear-gradient(145deg,#202020,#191919_72%)] shadow-[inset_0_1px_0_rgba(255,255,255,.035)] hover:-translate-y-0.5 hover:border-[#FF5A1F]/45 hover:bg-[#222022] hover:shadow-[0_0_24px_rgba(255,90,31,.055),inset_0_1px_0_rgba(255,255,255,.045)]")}>
              <div className="flex w-full items-center justify-between gap-2">
                <span className={mono + (selected ? " text-[#FFA27C]" : " text-[#88888B]")}>SCENARIO {s.number}</span>
                <span className="text-lg text-[#FF8756]" aria-hidden="true">{selected ? "●" : "↗"}</span>
              </div>
              <div className="mt-4 flex min-w-0 items-center gap-3">
                <ProspectPortrait scenario={s} size="sm" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-white">{s.prospectName}</p>
                  <p className="break-words text-[11px] text-[#97979B]">{s.company}</p>
                </div>
              </div>
              <p className="mt-4 text-[18px] font-semibold leading-tight text-white sm:text-[20px]">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#ABAAAD]">{s.teaser}</p>
              <p className="mt-5 break-words rounded-lg border border-white/[.07] bg-[#111113] px-4 py-3 text-[13px] leading-[1.6] text-[#D7D6D7]">“{s.reply}”</p>
              <span className="mt-auto pt-5 text-xs font-semibold text-[#FFA07A]">{selected ? "Viewing decision ↓" : "Explore this decision →"}</span>
            </button>;
          })}
        </div>
      </section>

      <div className="scroll-mt-6" ref={detailsRef} aria-live="polite">
        {active ? <>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={mono + " text-[#FF9167]"}>Step 02 / Reveal the decision</p>
              <h2 className={titleClass + " mt-2"}>What changes when a reply has a decision layer?</h2>
            </div>
            <span className="text-xs text-[#98989C]">Sample scenario {active.number} of 03</span>
          </div>
          <DecisionDetails key={`${active.id}-${sequence}`} scenario={active} stage={reducedMotion ? 4 : stage} revealCount={revealCount} onSkip={() => { timersRef.current.forEach(window.clearTimeout); timersRef.current = []; setStage(4); setRevealCount(revealSections.length); }} />
        </> : <section className="mt-8 flex min-h-[186px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#49413C] bg-gradient-to-br from-[#211B18] via-[#1B1A19] to-[#171717] p-7 text-center">
          <span aria-hidden="true" className="mb-3 text-3xl text-[#FF8558]">◇</span>
          <h2 className="text-lg font-semibold">The interesting part comes after the reply.</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#A5A2A1]">Choose a scenario above to see the context, rules, recommended action and human control behind the decision.</p>
        </section>}
      </div>

      <section className="mt-14 min-w-0 overflow-hidden rounded-2xl border border-[#FF5A1F]/20 bg-gradient-to-br from-[#30231D] via-[#201B19] to-[#171717] px-5 py-9 sm:px-9 sm:py-11" aria-labelledby="pilot-heading">
        <div className="grid min-w-0 items-center gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)]">
          <div className="min-w-0">
            <p className={mono + " text-[#FF9872]"}>From example to your own workflow</p>
            <h2 id="pilot-heading" className="mt-3 font-heading text-[26px] font-bold leading-tight sm:text-[32px]">Want to see what happens with your own prospect replies?</h2>
            <p className="mt-3 max-w-[630px] text-sm leading-relaxed text-[#C0B6B0]">Use the $10 Micro-Pilot with up to 25 total prospects, including up to three reply decision analyses. Or take the optional five-question Audit first.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Link href="/checkout/micro-pilot" className="inline-flex min-h-[52px] min-w-0 items-center justify-center rounded-xl bg-[#FF5A1F] px-5 py-3 text-center text-sm font-bold leading-snug text-white transition-colors hover:bg-[#FF713C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Try the $10 Micro-Pilot <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
            <Link href="/?audit=open" className="inline-flex min-h-[47px] items-center justify-center rounded-xl border border-white/[.2] px-4 py-3 text-center text-sm font-medium text-[#D0C5BF] hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Prefer a personalized Audit? →
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-8 flex min-w-0 flex-wrap items-start justify-between gap-3 border-t border-white/[.08] pt-6 text-xs leading-relaxed text-[#87878A]">
        <p className="max-w-[780px]">Examples use fictional companies, illustrative seller rules and source-informed workflow logic. They are not live AI evaluations, customer conversations, measured revenue outcomes or records of actual sends. Real results depend on your configured context, permissions and integrations.</p>
        <Link href="/" className="shrink-0 underline-offset-4 hover:text-white hover:underline">FrameLeads.io ↗</Link>
      </footer>
    </div>
  </main>;
}
