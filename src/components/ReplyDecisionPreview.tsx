"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { replyScenarios, type ReplyScenario } from "../reply-decision-preview";

const mono = "font-mono text-[10px] font-semibold uppercase tracking-[.15em]";
const card = "min-w-0 rounded-2xl border border-white/[.09] bg-[#191919]";
const titleClass = "text-xl font-semibold leading-snug tracking-[-.025em] sm:text-[23px]";
const muted = "text-[#A5A5A9]";

function NumberedSection({
  index, label, children,
}: { index: string; label: string; children: React.ReactNode }) {
  return <div className="min-w-0 border-t border-white/[.08] py-5 first:border-t-0 first:pt-0">
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <span className={mono + " text-[#FF8556]"}>{index}</span>
      <span className={mono + " text-[#9B9B9F]"}>{label}</span>
    </div>
    {children}
  </div>;
}

function DecisionDetails({ scenario }: { scenario: ReplyScenario }) {
  return <div className="mt-7 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]" data-testid="decision-details">
    <aside className="min-w-0 space-y-4">
      <div className={card + " overflow-hidden"}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] bg-[#212123] px-5 py-4">
          <span className={mono + " text-[#A9A9AB]"}>Incoming reply</span>
          <span className="rounded-full border border-white/[.12] px-2.5 py-1 font-mono text-[10px] text-[#A1A1A4]">Sample thread</span>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#37312D] text-lg font-semibold text-[#FF9467]">{scenario.company[0]}</div>
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-white">{scenario.company}</p>
              <p className="break-words text-xs text-[#8D8D92]">{scenario.role}</p>
            </div>
          </div>
          <p className="rounded-xl rounded-tl-sm border border-white/[.09] bg-[#252527] p-5 text-[17px] font-medium leading-relaxed text-white sm:text-[19px]">“{scenario.reply}”</p>
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
      <div className="px-5 py-5 sm:px-7 sm:py-7">
        <NumberedSection index="01" label="Understand the reply">
          <p className="break-words text-lg font-semibold text-white">{scenario.intent}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#AFAFB1]">{scenario.confidence}</p>
        </NumberedSection>
        <NumberedSection index="02" label="Read the context">
          <ul className="space-y-2.5">
            {scenario.context.map((item) => <li key={item} className="flex min-w-0 items-start gap-3 text-sm leading-relaxed text-[#CBCBCD]"><span aria-hidden="true" className="mt-1 text-[#FF7640]">◆</span><span className="min-w-0 break-words">{item}</span></li>)}
          </ul>
        </NumberedSection>
        <NumberedSection index="03" label="Apply the seller's rules">
          <div className="rounded-xl border border-[#FF5A1F]/20 bg-[#FF5A1F]/[.055] p-4">
            <p className="text-sm font-semibold leading-relaxed text-[#F5D1C1]">{scenario.rule}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#A5A0A0]">{scenario.ruleSource}</p>
          </div>
        </NumberedSection>
        <NumberedSection index="04" label="Decide with control">
          <div className="rounded-xl border border-[#67503C] bg-[#2B251F] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF5A1F]/20 text-[#FFA27A]">↗</span>
              <div className="min-w-0">
                <span className={mono + " text-[#FF9B73]"}>Recommended next action</span>
                <p className="mt-2 break-words text-base font-semibold leading-relaxed text-white">{scenario.nextAction}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#D2C8C3]">{scenario.why}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex min-w-0 items-start gap-3 rounded-lg border border-white/[.08] bg-[#232325] p-4">
            <span aria-hidden="true" className="mt-0.5 text-lg text-[#FF9061]">◎</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{scenario.authority}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#ADADB1]">{scenario.authorityDetail}</p>
            </div>
          </div>
        </NumberedSection>
        <div className="mt-1 flex min-w-0 items-start gap-3 border-t border-white/[.09] pt-5">
          <span aria-hidden="true" className="mt-0.5 text-[#FF9061]">✓</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{scenario.result}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9B9B9F]">{scenario.safeguard}</p>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

export default function ReplyDecisionPreview() {
  const [selectedId, setSelectedId] = useState<ReplyScenario["id"] | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const active = replyScenarios.find((scenario) => scenario.id === selectedId) ?? null;

  const selectScenario = (id: ReplyScenario["id"]) => {
    setSelectedId(id);
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
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={mono + " text-[#FF9167]"}>Step 01 / Pick a reply</p>
            <h2 id="choose-scenario" className="mt-2 font-heading text-[24px] font-semibold leading-tight sm:text-[30px]">Three replies. Three different decisions.</h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-[#99999C]">Choose the situation you recognize. The decision breakdown appears below.</p>
        </div>
        <div className="grid min-w-0 gap-4 md:grid-cols-3" aria-label="Choose a reply scenario">
          {replyScenarios.map((s) => {
            const selected = s.id === selectedId;
            return <button key={s.id} type="button" aria-pressed={selected} onClick={() => selectScenario(s.id)}
              className={"group relative flex min-w-0 flex-col items-start overflow-hidden rounded-2xl border p-5 text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:p-6 " +
                (selected ? "border-[#FF5A1F]/65 bg-[#261C17] shadow-[0_0_38px_rgba(255,90,31,.09)]" : "border-white/[.11] bg-[#1C1C1E] hover:border-[#FF5A1F]/45 hover:bg-[#222022]")}>
              <div className="flex w-full items-center justify-between gap-2">
                <span className={mono + (selected ? " text-[#FFA27C]" : " text-[#88888B]")}>SCENARIO {s.number}</span>
                <span className="text-lg text-[#FF8756]" aria-hidden="true">{selected ? "●" : "↗"}</span>
              </div>
              <p className="mt-5 text-[18px] font-semibold leading-tight text-white sm:text-[20px]">{s.title}</p>
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
          <DecisionDetails key={active.id} scenario={active} />
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
            <p className="mt-3 max-w-[630px] text-sm leading-relaxed text-[#C0B6B0]">Use the $10 Micro-Pilot to explore FrameLeads with up to 25 prospects. Or take the optional five-question Audit if you want to map your current workflow first.</p>
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
