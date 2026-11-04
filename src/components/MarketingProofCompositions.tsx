import type { ReactNode } from "react";
import Image from "next/image";

const eliseFeaturedReply = "This is timely. We're comparing outbound partners this week. Could you send your pricing structure, a relevant B2B SaaS example, and how you'd handle prospect replies after campaigns start? Our founder is reviewing options Thursday.";
const eliseDraftResponse = "Hi Elise, thanks for the detail. Since your founder is reviewing options Thursday, I'll keep this focused on what you need to assess fit. I'll put together our pricing structure, a relevant B2B SaaS example, and a short breakdown of how we'd handle prospect replies after launch. To tailor this properly, is your bigger priority increasing qualified meetings or reducing the time your team spends managing replies? Happy to keep everything in writing for your founder's review.";

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

function ClockIcon({ className = "size-3.5" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5v4.8l3 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function IntentIcon({ intent, className = "size-3.5" }: { intent: "HOT" | "WARM" | "COLD"; className?: string }) {
  if (intent === "HOT") return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M13.3 2.2c.5 3.2-.8 4.8-2.1 6.3-1.2 1.3-2.3 2.6-2.1 5.1.1 1.1.8 2 1.8 2.5-.1-2.1 1-3.4 2.2-4.6 1.1 1.4 2.8 2.7 2.8 5a4 4 0 0 1-4 4c-3.5 0-6-2.7-6-6.3 0-3.3 2-5.5 4-7.8 1.3-1.5 2.7-3 3.4-6.2Zm4.1 7.2c-.2 1.8.4 2.9 1.1 4 .7 1.1 1.4 2.3 1.4 4a5.9 5.9 0 0 1-6 5.9c3.5-1.5 4.1-4.2 3.2-6.4-.5-1.2-1.5-2.1-2.3-3.1.2-1.5 1.1-2.7 2.6-4.4Z" /></svg>;
  if (intent === "WARM") return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3.6" /><path d="M12 2.5v2m0 15v2M4.1 4.1l1.4 1.4m13 13 1.4 1.4M2.5 12h2m15 0h2M4.1 19.9l1.4-1.4m13-13 1.4-1.4" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 4.7l3 2 3-2M9 19.3l3-2 3 2M4.4 10.5l.4-3.6 3.5-.7m11 11-.4 3.6-3.5.7M4.4 13.5l.4 3.6 3.5.7m11-11-.4-3.6-3.5-.7" /></svg>;
}

function IntentBadge({ intent }: { intent: "HOT" | "WARM" | "COLD" }) {
  const styles = {
    HOT: "border-[#FF5A1F]/45 bg-[#FF5A1F]/[0.13] text-[#FF8054]",
    WARM: "border-amber-400/30 bg-amber-400/[0.09] text-amber-300",
    COLD: "border-sky-400/25 bg-sky-400/[0.07] text-sky-200",
  };
  return <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide " + styles[intent]}><IntentIcon intent={intent} className="size-3.5" />{intent}</span>;
}

function IntentScoreGaugeIcon({ className = "size-4" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.2 17.8a9.2 9.2 0 1 1 15.6 0" />
    <path d="m12 15.8 4.2-5.8" />
    <circle cx="12" cy="15.8" r="1.3" fill="currentColor" stroke="none" />
  </svg>;
}

function InboxSignalIcon({ className = "size-4" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5h16v13H4z" /><path d="M4 14h4l1.5 2h5L16 14h4" /><path d="M8 9h8" />
  </svg>;
}

function DraftResponseIcon({ className = "size-4" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4.5h9l5 5v10H5z" /><path d="M14 4.5v5h5M8 13h8M8 16.5h6" />
  </svg>;
}

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"relative isolate mx-auto mt-9 w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#131112] px-3 py-6 shadow-[0_32px_100px_-62px_rgba(0,0,0,0.9)] sm:px-6 sm:py-9 lg:px-9 " + className}>
    <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[#FF5A1F]/[0.075] blur-[88px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-[-7rem] h-72 w-96 rounded-full bg-[#FF5A1F]/[0.06] blur-[90px]" />
    <div className="relative z-10">{children}</div>
  </div>;
}

function ValueNote({ icon, text, className = "" }: { icon: string; text: string; className?: string }) {
  return <div className={"flex items-center gap-2 text-left text-xs font-medium text-white/80 sm:text-sm " + className}>
    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#FF5A1F]/20 bg-[#FF5A1F]/[0.075] text-base text-[#FF8A5A]" aria-hidden="true">{icon}</span>
    <span>{text}</span>
  </div>;
}

function CardActions({ primary = false }: { primary?: boolean }) {
  const iconClass = "size-4";
  return <div className="flex items-center gap-2.5" aria-hidden="true">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill={primary ? "currentColor" : "none"} className={iconClass + (primary ? " text-amber-300" : " text-white/45")}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={iconClass + " text-white/40"}><path d="M4 8h16v12H4V8Zm-1-4h18v4H3V4Zm5 8v4m4-4v4m4-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={iconClass + " text-white/40"}><path d="M4 7h16m-10 4v7m4-7v7M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>;
}

function LeadCard({ avatar, name, intent, message, date, primary = false, urgencyLabel }: {
  avatar: string; name: string; intent: "HOT" | "WARM" | "COLD"; message: string; date: string; primary?: boolean; urgencyLabel?: string;
}) {
  return <Surface className={"flex h-full flex-col p-4 text-left sm:p-5 " + (primary ? "border-[#FF5A1F]/40 bg-[linear-gradient(145deg,rgba(255,90,31,0.085),rgba(30,23,22,0.9)_52%)] shadow-[0_0_28px_-22px_rgba(255,90,31,0.24)]" : "")}>
    <div className="flex min-w-0 flex-wrap items-center gap-2.5 md:grid md:grid-cols-[2.25rem_minmax(0,1fr)] md:items-center md:gap-x-2.5 md:gap-y-2 lg:flex lg:flex-wrap">
      <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-white/[0.18] bg-[#292424]">
        <Image src={avatar} alt="" fill sizes="36px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-bold text-white sm:text-base">{name}</span>
      <span className="md:col-start-2 md:row-start-2 md:justify-self-start lg:contents"><IntentBadge intent={intent} /></span>
    </div>
    {urgencyLabel && <div className="mt-3"><Chip tone="red"><ClockIcon />{urgencyLabel}</Chip></div>}
    <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">{message}</p>
    <div className="mt-5 flex items-center justify-between border-t border-white/[0.1] pt-3">
      <span className="text-[11px] text-white/40">{date}</span>
      <CardActions primary={primary} />
    </div>
  </Surface>;
}

export function GapProof() {
  return <Frame className="py-5 sm:py-8 lg:py-8">
    <div className="mx-auto mb-5 flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-white/[0.11] bg-[#1C1919] px-3 py-3 sm:gap-4 sm:px-5">
      <SmallLabel>INBOX TRIAGE</SmallLabel>
      <span className="hidden h-5 w-px bg-white/[0.13] sm:block" />
      <Chip tone="orange">Received</Chip>
      <span className="text-xs text-white/60">Revenue priority</span>
      <span className="inline-flex items-center gap-1.5 text-xs text-white/55"><ClockIcon />Thursday review</span>
      <Chip tone="red">Needs review</Chip>
    </div>

    <div className="grid items-stretch gap-3 md:grid-cols-[1.55fr_1fr_1fr]">
      <LeadCard primary avatar="/images/proof-avatars/elise.webp" name="Elise Varner" intent="HOT" urgencyLabel="Founder review Thursday"
        message={eliseFeaturedReply} date="New reply" />
      <LeadCard avatar="/images/proof-avatars/marcus.webp" name="Marcus Solen" intent="WARM"
        message="Interesting. We're already running outbound, but our team still handles every reply manually. How is your approach different from what our SDRs already do?" date="New reply" />
      <LeadCard avatar="/images/proof-avatars/ryan.webp" name="Ryan Halden" intent="COLD"
        message="Thanks for reaching out. We're not evaluating any new outbound support this quarter. Please check back next quarter." date="New reply" />
    </div>

    <Surface className="mt-4 flex flex-col gap-3 border-[#FF5A1F]/[0.3] bg-[linear-gradient(100deg,rgba(255,90,31,0.10),rgba(34,25,24,0.7))] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F]/[0.13] text-[#FF8858]">⚡</span>
        <div className="min-w-0 text-left">
          <p className="font-heading text-base font-bold uppercase text-white sm:text-lg">Executive Override Queue</p>
          <p className="mt-1 text-xs text-white/55">3 replies received · 1 HOT reply surfaced for Thursday review</p>
        </div>
      </div>
      <div><Chip tone="warm">Needs review</Chip></div>
    </Surface>

    <div className="mt-5 grid gap-3 border-t border-white/[0.08] pt-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-5">
      <ValueNote icon="♨" text="Not every reply means the same thing." className="lg:justify-self-start" />
      <ValueNote icon="◷" text="Arrival time is not revenue priority." className="lg:justify-self-center" />
      <ValueNote icon="◆" text="High-priority exceptions stay visible." className="lg:justify-self-end" />
    </div>
  </Frame>;
}

function IntentCard() {
  return <Surface className="mx-auto max-w-[1060px] border-[#FF5A1F]/30 bg-[linear-gradient(140deg,rgba(255,90,31,0.09),rgba(26,24,24,0.96)_60%)] p-4 text-left shadow-[0_22px_65px_-35px_rgba(255,90,31,0.28)] sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <span className="inline-flex items-center gap-2"><IntentScoreGaugeIcon className="size-4 text-[#FF8858]" /><SmallLabel>Lead intent score</SmallLabel></span>
      <IntentBadge intent="WARM" />
    </div>
    <p className="mt-2 text-left font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl"><span className="tabular-nums">86</span><span className="ml-2 text-xl font-medium text-white/45 sm:text-2xl">/ 100</span></p>
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#302522]" role="img" aria-label="Intent score: 86 out of 100">
      <div className="h-full rounded-full bg-gradient-to-r from-[#FF5A1F] via-[#FF7848] to-[#FFC06A]" style={{ width: "86%" }} />
    </div>
    <p className="mt-2 text-left text-xs leading-relaxed text-white/55">The score reflects expressed intent, not closing probability.</p>
    <div className="mt-4 text-left">
      <SmallLabel>WHY NOW / SIGNALS</SmallLabel>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Chip tone="orange">Pricing requested</Chip>
        <Chip tone="green">Proof requested</Chip>
        <Chip tone="warm">Relevant workflow</Chip>
        <Chip tone="red"><ClockIcon />Founder review Thursday</Chip>
      </div>
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
  return <Frame className="max-w-[1200px] py-5 sm:py-6">
    <IntentCard />

    <div className="mx-auto mt-3 max-w-[1060px] space-y-2">
      <Surface className="p-4 text-left sm:p-5">
        <div className="flex items-center gap-2"><InboxSignalIcon className="size-4 text-[#FF8858]" /><SmallLabel>Inbound signal · Elise Varner</SmallLabel></div>
        <p className="mt-2 text-[11px] text-white/45">Founder reviewing options Thursday</p>
        <p className="mt-2 text-[13px] leading-[1.85] text-white/80 sm:text-sm sm:leading-6 lg:text-[13px] lg:leading-[1.75]">{eliseFeaturedReply}</p>
      </Surface>
      <Surface className="border-[#FF5A1F]/25 bg-[linear-gradient(145deg,rgba(255,90,31,0.045),rgba(16,16,16,0.96)_62%)] p-4 text-left sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><DraftResponseIcon className="size-4 text-[#FF8858]" /><SmallLabel>Draft response</SmallLabel></div>
          <Chip tone="warm">Draft ready for review</Chip>
        </div>
        <div className="mt-3 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_12.75rem] lg:items-end">
          <p className="min-w-0 text-[13px] leading-[1.85] text-white/80 sm:text-sm sm:leading-6 lg:text-[13px] lg:leading-[1.75]">{eliseDraftResponse}</p>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:max-w-[17rem] lg:max-w-none" role="img" aria-label="Preview of the FrameLeads reply controls: Reject and Archive, Regenerate Draft, and Approve and Send. These visual controls do not send messages.">
            <div aria-hidden="true" className="flex min-h-9 items-center justify-center rounded-lg px-3 text-center text-xs font-medium text-white/65">Reject &amp; Archive</div>
            <div aria-hidden="true" className="flex min-h-10 items-center justify-center rounded-xl border border-white/[0.10] bg-[#212121] px-3 text-center text-xs font-semibold text-white">Regenerate Draft</div>
            <div aria-hidden="true" className="flex min-h-11 items-center justify-center rounded-xl bg-[#FF5A1F] px-3 text-center text-sm font-bold text-white shadow-[0_8px_27px_-10px_rgba(255,90,31,0.8)]">Approve &amp; Send</div>
          </div>
        </div>
      </Surface>
    </div>

    <Surface className="mx-auto mt-3 max-w-[1060px] border-[#FF5A1F]/35 bg-[#191414] p-4 text-left sm:p-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.09] pb-3">
        <h3 className="mr-2 font-heading text-lg font-bold uppercase text-white sm:text-xl">Decision Packet</h3>
        <Chip tone="red"><ClockIcon />Founder review Thursday</Chip>
        <Chip tone="orange">Recommendation only</Chip>
      </div>
      <div className="mt-3">
        <PacketBlock label="✧ AI interpretation">
          Prospect is actively comparing outbound partners and requests pricing, relevant proof, and an explanation of post-reply handling. Founder review on Thursday creates a near-term evaluation window.
        </PacketBlock>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <PacketBlock label="♢ Why this matters">
          The prospect has moved beyond general curiosity. Their questions reveal commercial evaluation, clear information needs, and a defined internal review date.
        </PacketBlock>
        <PacketBlock label="▣ Decision context / governance">
          Prepare a tailored response using approved company information. Founder approval remains available before sending, subject to configured rules.
        </PacketBlock>
        <PacketBlock label="↗ Recommended action" emphasis>
          <strong className="block font-heading text-lg text-[#FF885A] sm:text-xl">Send tailored pricing + relevant proof</strong>
          <span className="mt-2 block text-xs text-white/65">Answer the buying questions, clarify the main operational priority, and maintain momentum ahead of Thursday.</span>
        </PacketBlock>
      </div>
    </Surface>

    <div className="mx-auto mt-4 grid w-full max-w-[1060px] gap-3 border-t border-white/[0.08] pt-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-5">
      <ValueNote icon="✦" text="High intent is visible." className="lg:justify-self-start" />
      <ValueNote icon="♢" text="The right reply is drafted." className="lg:justify-self-center" />
      <ValueNote icon="↗" text="Momentum is easier to keep." className="lg:justify-self-end" />
    </div>
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
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_27px_-10px_rgba(255,90,31,0.8)]" aria-label="Run Simulation preview; not interactive"><span aria-hidden="true">▶</span> Run Simulation</div>
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

    <div className="mt-6 grid gap-3 border-t border-white/[0.08] pt-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-5">
      <ValueNote icon="◎" text="Choose the decision to test." className="lg:justify-self-start" />
      <ValueNote icon="☷" text="Explore confidence, risk and holds." className="lg:justify-self-center" />
      <ValueNote icon="◇" text="Preview the governance route safely." className="lg:justify-self-end" />
    </div>
  </Frame>;
}
