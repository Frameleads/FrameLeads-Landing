import type { ReactNode } from "react";

/**
 * Marketing compositions assembled from isolated modules in actual FrameLeads UI.
 * These are illustrations using the owner's sample/test scenario, NOT screenshots,
 * live activity, real-customer outcomes, or functioning software controls.
 */
function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"relative min-w-0 rounded-2xl border border-white/[0.12] bg-[#191717] shadow-[0_18px_55px_-36px_rgba(0,0,0,0.95)] " + className}>{children}</div>;
}

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warm" | "cold" | "red" | "green" | "orange" }) {
  const colors = {
    neutral: "border-white/[0.15] bg-white/[0.04] text-white/65",
    warm: "border-amber-400/30 bg-amber-400/[0.09] text-amber-300",
    cold: "border-sky-400/25 bg-sky-400/[0.07] text-sky-200",
    red: "border-red-400/35 bg-red-500/[0.12] text-red-200",
    green: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
    orange: "border-[#FF5A1F]/45 bg-[#FF5A1F]/[0.11] text-[#FF956E]",
  };
  return <span className={"inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-tight " + colors[tone]}>{children}</span>;
}

function SmallLabel({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">{children}</span>;
}

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"relative isolate mx-auto mt-9 w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#131112] px-3 py-6 shadow-[0_32px_100px_-62px_rgba(0,0,0,0.9)] sm:px-6 sm:py-9 lg:px-9 " + className}>
    <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[#FF5A1F]/[0.075] blur-[88px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-[-7rem] h-72 w-96 rounded-full bg-[#FF5A1F]/[0.06] blur-[90px]" />
    <div className="relative z-10">{children}</div>
  </div>;
}

function EvidenceNote() {
  return <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">FrameLeads product UI composition · Illustrative scenario data · No customer-performance claim</p>;
}

function ValueNote({ icon, text }: { icon: string; text: string }) {
  return <div className="flex items-center gap-2 text-left text-xs font-medium text-white/80 sm:text-sm">
    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.075] text-base text-[#FF8A5A]" aria-hidden="true">{icon}</span>
    <span>{text}</span>
  </div>;
}

function LeadCard({ initials, name, mood, message, date, primary = false, urgency = false }: {
  initials: string; name: string; mood: "WARM" | "COLD"; message: string; date: string; primary?: boolean; urgency?: boolean;
}) {
  return <Surface className={"flex h-full flex-col p-4 text-left sm:p-5 " + (primary ? "border-[#FF5A1F]/65 bg-[linear-gradient(145deg,rgba(255,90,31,0.12),rgba(30,23,22,0.86)_52%)] shadow-[0_0_38px_-18px_rgba(255,90,31,0.38)]" : "")}>
    <div className="flex min-w-0 flex-wrap items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#FF5A1F]/25 bg-[#FF5A1F]/[0.11] text-xs font-semibold text-[#FF9364]">{initials}</span>
      <span className="min-w-0 flex-1 text-sm font-bold text-white sm:text-base">{name}</span>
      <Chip tone={mood === "WARM" ? "warm" : "cold"}>{mood === "WARM" ? "● WARM" : "○ COLD"}</Chip>
    </div>
    {urgency && <div className="mt-3"><Chip tone="red"><span aria-hidden="true">◷</span> Response SLA breached</Chip></div>}
    <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">{message}</p>
    <div className="mt-5 flex items-center justify-between border-t border-white/[0.1] pt-3">
      <span className="text-[11px] text-white/40">{date}</span>
      <span aria-hidden="true" className={primary ? "text-amber-300" : "text-white/30"}>{primary ? "★" : "☆"}</span>
    </div>
  </Surface>;
}

export function GapProof() {
  return <Frame>
    <div className="mx-auto mb-5 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-white/[0.11] bg-[#1C1919] px-3 py-3 sm:gap-4 sm:px-5">
      <SmallLabel>INBOX TRIAGE</SmallLabel>
      <span className="hidden h-5 w-px bg-white/[0.13] sm:block" />
      <Chip tone="orange">Received</Chip>
      <span className="text-xs text-white/60">Revenue priority</span>
      <span className="text-xs text-white/50">◷ SLA urgency</span>
      <Chip tone="red">Needs review</Chip>
    </div>

    <div className="grid items-stretch gap-3 md:grid-cols-[1.55fr_1fr_1fr]">
      <LeadCard primary initials="EV" name="Elise Varner" mood="WARM" urgency
        message="We've discussed this internally, and the team is interested. We'd be prepared to move forward this month if you could waive the onboarding fee…"
        date="Oct 28, 2026 · 8:11 PM" />
      <LeadCard initials="MS" name="Mira Solen" mood="COLD"
        message="Thanks for reaching out. This looks relevant to our agency. We're an 11-person team…"
        date="Oct 20, 2026 · 1:25 AM" />
      <LeadCard initials="RH" name="Riya Halden" mood="WARM"
        message="Thanks for the message. I'm not the person responsible for evaluating outbound…"
        date="Oct 28, 2026 · 8:11 PM" />
    </div>

    <Surface className="mt-4 flex flex-col gap-3 border-[#FF5A1F]/[0.3] bg-[linear-gradient(100deg,rgba(255,90,31,0.10),rgba(34,25,24,0.7))] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F]/[0.13] text-[#FF8858]">⚡</span>
        <div className="min-w-0 text-left">
          <p className="font-heading text-base font-bold uppercase text-white sm:text-lg">Executive Override Queue</p>
          <p className="mt-1 text-xs text-white/55">5 high-priority events require judgment</p>
        </div>
      </div>
      <div><Chip tone="warm">Needs review</Chip></div>
    </Surface>

    <div className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-3 sm:gap-5">
      <ValueNote icon="♨" text="Not every reply means the same thing." />
      <ValueNote icon="◷" text="Arrival time is not revenue priority." />
      <ValueNote icon="◆" text="High-priority exceptions stay visible." />
    </div>
    <EvidenceNote />
  </Frame>;
}

function IntentCard() {
  return <Surface className="mx-auto max-w-[850px] border-[#FF5A1F]/30 bg-[linear-gradient(140deg,rgba(255,90,31,0.09),rgba(26,24,24,0.96)_60%)] p-5 text-left shadow-[0_22px_65px_-35px_rgba(255,90,31,0.28)] sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <SmallLabel>◉ Intent score</SmallLabel>
        <p className="mt-2 font-heading text-5xl font-bold tabular-nums text-white sm:text-6xl">78<span className="ml-2 text-xl text-white/45">/ 100</span></p>
      </div>
      <Chip tone="warm">✦ WARM</Chip>
    </div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.09]">
      <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-[#FF5A1F]" />
    </div>
    <p className="mt-3 text-xs leading-relaxed text-white/55">Verified expressed interest from the negotiation analysis, not a prediction of closing probability.</p>
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <SmallLabel>Why now / signals</SmallLabel>
      <Chip tone="orange">Negotiation</Chip>
      <Chip tone="green">Positive interest</Chip>
      <Chip tone="warm">Meeting request</Chip>
      <Chip tone="red">⚡ Immediate term confirmation</Chip>
    </div>
  </Surface>;
}

function PacketBlock({ label, children, emphasis = false }: { label: string; children: ReactNode; emphasis?: boolean }) {
  return <div className={"min-w-0 rounded-xl border p-4 text-left sm:p-5 " + (emphasis ? "border-[#FF5A1F]/55 bg-[#FF5A1F]/[0.12] shadow-[0_0_34px_-23px_rgba(255,90,31,0.55)]" : "border-[#FF5A1F]/[0.18] bg-[#FF5A1F]/[0.045]")}>
    <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF946A]">{label}</span>
    <div className="mt-2 text-sm leading-relaxed text-white/75">{children}</div>
  </div>;
}

export function DecisionLayerProof() {
  return <Frame className="max-w-[1200px]">
    <IntentCard />

    <div className="mx-auto mt-4 grid max-w-[1060px] gap-4 md:grid-cols-2">
      <Surface className="p-5 text-left sm:p-6">
        <SmallLabel>✉ Inbound signal</SmallLabel>
        <p className="mt-2 text-[11px] text-white/45">Received · Oct 28, 2026, 8:11 PM</p>
        <p className="mt-3 text-sm leading-7 text-white/80">“We've discussed this internally, and the team is interested. We'd be prepared to move forward this month if you could waive the onboarding fee and agree to a 30-day cancellation clause without penalties.”</p>
      </Surface>
      <Surface className="border-[#FF5A1F]/25 p-5 text-left sm:p-6">
        <SmallLabel>✎ Draft response</SmallLabel>
        <p className="mt-2 text-xs text-amber-300">Policy review required · No governed reply approved</p>
        <div className="mt-4 rounded-xl border border-white/[0.12] bg-[#101010] p-4 text-sm leading-relaxed text-white/75">Human review required. No governed response is approved for sending.</div>
        <p className="mt-3 text-[11px] text-white/45">The system does not invent approval for contract exceptions.</p>
      </Surface>
    </div>

    <Surface className="mx-auto mt-4 max-w-[1100px] border-[#FF5A1F]/35 bg-[#191414] p-4 text-left sm:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.09] pb-4">
        <h3 className="mr-2 font-heading text-lg font-bold uppercase text-white sm:text-xl">Decision Packet</h3>
        <Chip tone="warm">Needs review</Chip>
        <Chip>AI-assisted</Chip>
        <Chip>Governed execution</Chip>
      </div>
      <div className="mt-4">
        <PacketBlock label="✧ AI interpretation">
          Buying interest this month is conditional on two concessions: onboarding-fee waiver and 30-day penalty-free cancellation. Immediate confirmation requested.
        </PacketBlock>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_0.9fr_1.2fr]">
        <PacketBlock label="♢ Why human review">
          Commercial terms require founder or authorized approval. The workflow must not claim authority to offer discounts or contractual exceptions.
        </PacketBlock>
        <PacketBlock label="▣ Governance">
          <strong className="block text-[#FF9A6D]">Human review required</strong>
          <span className="mt-2 block text-xs text-white/50">1 allowed · 1 needs review · 1 unresolved rule</span>
        </PacketBlock>
        <PacketBlock label="↗ Recommended action" emphasis>
          <strong className="block font-heading text-lg text-[#FF885A] sm:text-xl">Escalate to human</strong>
          <span className="mt-2 block text-xs text-white/55">Commercial authority unverified · Policy unresolved</span>
        </PacketBlock>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-white/45">No automatic reply has been authorized for this illustrative negotiation.</p>
    </Surface>

    <div className="mx-auto mt-6 grid max-w-[1080px] gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-3">
      <ValueNote icon="✦" text="Buying intent is visible." />
      <ValueNote icon="♢" text="The conditions change the decision." />
      <ValueNote icon="↗" text="The next action is explicit." />
    </div>
    <EvidenceNote />
  </Frame>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 text-left">
    <p className="mb-2 text-xs font-medium text-white/70">{label}</p>
    <div className="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-white/[0.14] bg-[#101010] px-3 text-sm text-white/55">{value}<span aria-hidden="true">⌄</span></div>
  </div>;
}

const simulationSteps = [
  { number: "01", name: "Reply", symbol: "◎" },
  { number: "02", name: "Decision", symbol: "◉" },
  { number: "03", name: "Constitution", symbol: "⚖" },
  { number: "04", name: "Automation", symbol: "▣" },
  { number: "05", name: "Risk / SLA", symbol: "◇" },
];

export function SandboxProof() {
  return <Frame className="max-w-[1200px]">
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
      <Chip tone="green">◇ Simulation only · Nothing sent or persisted</Chip>
      <Chip tone="warm">Test commercial exceptions before execution</Chip>
    </div>

    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1.13fr]">
      <Surface className="border-[#FF5A1F]/25 bg-[linear-gradient(140deg,rgba(255,90,31,0.07),rgba(27,23,23,0.94)_53%)] p-5 text-left sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#FF5A1F]/[0.12] font-mono font-bold text-[#FF5A1F]">01</span>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Scenario Builder</h3>
            <p className="mt-1 text-xs text-white/50">Choose a decision and try hypothetical inputs.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="Find decision" value="Search prospect, company or intent" />
          <Field label="Decision" value="Select an existing decision" />
          <div>
            <p className="mb-2 text-xs font-medium text-white/70">Hypothetical reply (optional)</p>
            <div className="min-h-24 rounded-lg border border-white/[0.14] bg-[#101010] p-3 text-sm text-white/45">Enter an inbound reply to test explicitly</div>
          </div>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_27px_-10px_rgba(255,90,31,0.8)]" aria-label="Illustration of the Run Simulation control; not an interactive button"><span aria-hidden="true">▶</span> Run Simulation</div>
      </Surface>

      <div className="flex min-w-0 flex-col gap-4">
        <Surface className="p-4 text-left sm:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <Field label="Confidence override" value="No override" />
            <Field label="Risk band override" value="No override" />
            <Field label="Requested mode" value="No override" />
            <Field label="Prospect hold" value="No override" />
          </div>
        </Surface>
        <Surface className="flex-1 border-[#FF5A1F]/20 p-5 text-left sm:p-6">
          <SmallLabel>Decision preview</SmallLabel>
          <h3 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">Governance Simulation</h3>
          <p className="mt-2 text-sm text-white/55">Preview how a decision passes through the governance checks.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {simulationSteps.map((step) => <div key={step.number} className="flex min-h-28 min-w-0 flex-col items-center justify-center rounded-xl border border-[#FF5A1F]/[0.17] bg-[#FF5A1F]/[0.03] px-1 py-3 text-center">
              <span aria-hidden="true" className="text-xl text-[#FF8756]">{step.symbol}</span>
              <span className="mt-2 text-[11px] font-medium text-white/80">{step.name}</span>
              <span className="mt-1 font-mono text-[10px] text-white/35">{step.number}</span>
            </div>)}
          </div>
          <p className="mt-5 text-xs text-white/45">A dry run previews possible behavior; it does not send a message or change operational records.</p>
        </Surface>
      </div>
    </div>

    <div className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-3">
      <ValueNote icon="◎" text="Choose the decision to test." />
      <ValueNote icon="☷" text="Explore confidence, risk and holds." />
      <ValueNote icon="◇" text="Preview the governance route safely." />
    </div>
    <EvidenceNote />
  </Frame>;
}
