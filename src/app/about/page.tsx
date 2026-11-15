import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About FrameLeads | The Decision Layer for Outbound",
  description: "Learn what FrameLeads is, who it is for, how reply intelligence works, and how human control fits into outbound sales decisions.",
  alternates: { canonical: "https://frameleads.io/about" },
  openGraph: {
    title: "About FrameLeads | The Decision Layer for Outbound",
    description: "A clear, question-led introduction to FrameLeads, the reply-decision intelligence platform for founder-led B2B teams.",
    url: "https://frameleads.io/about",
    siteName: "FrameLeads",
    type: "website",
  },
};

const questions = [
  { id: "what-is-frameleads", question: "What exactly is FrameLeads?", topic: "The product" },
  { id: "who-is-it-for", question: "Who is it built for?", topic: "The audience" },
  { id: "why-it-exists", question: "Why was FrameLeads created?", topic: "The reason" },
  { id: "after-a-reply", question: "What happens when a prospect replies?", topic: "The workflow" },
  { id: "different-from-automation", question: "How is it different from more automation?", topic: "The difference" },
  { id: "existing-tools", question: "Does it replace my outbound tools or SDRs?", topic: "The stack" },
  { id: "human-control", question: "Who controls consequential decisions and sending?", topic: "Human control" },
  { id: "plans", question: "What do Core and Enterprise include?", topic: "Plans" },
  { id: "try-before-buying", question: "Can I evaluate it before committing?", topic: "Evaluation" },
  { id: "official-website", question: "Which FrameLeads website is official?", topic: "Company identity" },
] as const;

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function Answer({ id, number, question, eyebrow, children }: { id: string; number: string; question: string; eyebrow: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id + "-heading"} className="scroll-mt-28 border-b border-white/[0.1] py-10 last:border-b-0 sm:scroll-mt-40 sm:py-14">
      <div className="grid gap-5 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)] md:gap-12">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5A1F]">{number} / {eyebrow}</p>
          <h3 id={id + "-heading"} className="mt-3 max-w-md font-heading text-2xl font-bold leading-[1.2] tracking-tight text-white sm:text-[1.8rem]">{question}</h3>
        </div>
        <div className="space-y-4 text-[15px] leading-[1.8] text-[#B7B7B7] sm:text-base [&_strong]:font-semibold [&_strong]:text-white [&_a]:text-white [&_a]:underline [&_a]:decoration-[#FF5A1F]/60 [&_a]:underline-offset-4 [&_a:hover]:text-[#FF5A1F]">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://frameleads.io/about#webpage",
    url: "https://frameleads.io/about",
    name: "About FrameLeads",
    description: "The official product identity and buyer questions for FrameLeads, a B2B outbound reply-decision intelligence platform.",
    isPartOf: { "@id": "https://frameleads.io/#website" },
    about: { "@id": "https://frameleads.io/#organization" },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1A1A1A] font-sans text-white selection:bg-[#FF5A1F] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_65%_65%_at_50%_-10%,rgba(255,90,31,0.12),transparent_72%)]" />

      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-b border-white/[0.1] bg-[#1A1A1A]/95 px-5 py-4 backdrop-blur-xl sm:px-8 lg:sticky lg:top-5 lg:mt-5 lg:rounded-2xl lg:border lg:border-white/[0.12] lg:bg-[#242424]/90 lg:px-7">
        <Link href="/" className="inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F]" aria-label="FrameLeads home">
          <Image src="/logo.png" alt="" width={34} height={34} className="rounded-lg" priority />
          <span className="font-heading text-lg font-bold tracking-wide sm:text-xl">FrameLeads</span>
        </Link>
        <nav aria-label="About page main navigation" className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="text-sm text-white/75 transition-colors hover:text-white">Home</Link>
          <Link href="/#capabilities" className="text-sm text-white/75 transition-colors hover:text-white">How It Works</Link>
          <Link href="/#simulation" className="text-sm text-white/75 transition-colors hover:text-white">Product</Link>
          <Link href="/#pricing" className="text-sm text-white/75 transition-colors hover:text-white">Pricing</Link>
          <span aria-current="page" className="text-sm font-semibold text-[#FF5A1F]">About</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="https://app.frameleads.io/login" className="hidden text-sm font-semibold text-white transition-colors hover:text-[#FF5A1F] sm:inline-flex">Log In</Link>
          <Link href="/#reply-scenarios" className="fl-cta-pop inline-flex min-h-10 items-center justify-center rounded-lg bg-[#FF5A1F] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e8511b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:px-4 sm:text-sm">Explore Reply Scenarios</Link>
        </div>
      </header>

      <main id="main" className="relative z-10">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28" aria-labelledby="about-heading">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-[#FF5A1F]" />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">About FrameLeads</p>
            </div>
            <h1 id="about-heading" className="mt-6 max-w-[56rem] font-heading text-[clamp(2.7rem,6.2vw,5.3rem)] font-bold leading-[1.04] tracking-[-0.045em] text-white">
              Built for the decisions <span className="text-[#FF5A1F]">after the reply.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-[1.85] text-[#B7B7B7] sm:text-lg">
              FrameLeads is reply-decision intelligence for founder-led B2B agencies and outbound teams. It connects what a prospect says with the context, rules, and next action that conversation needs.
            </p>
          </div>

          <div className="mt-14 grid gap-4 border-t border-white/[0.12] pt-7 sm:grid-cols-3">
            {[
              ["WHO IT SERVES", "Founder-led B2B teams already running outbound"],
              ["WHERE IT FITS", "Between an incoming reply and the next decision"],
              ["WHAT STAYS YOURS", "Control over consequential sales actions"],
            ].map(([label, value]) => (
              <div key={label} className="border-l border-[#FF5A1F]/45 pl-4">
                <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#888888]">{label}</p>
                <p className="mt-2 max-w-[17rem] text-sm font-medium leading-6 text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-[#202020]/75" aria-labelledby="purpose-heading">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">The idea behind FrameLeads</p>
              <h2 id="purpose-heading" className="mt-4 max-w-sm font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Sending got automated. Judgment did not.</h2>
            </div>
            <div className="space-y-4 text-base leading-[1.85] text-[#B7B7B7]">
              <p>Outbound tools made it easier to launch campaigns. But the reply can still force a founder to interpret intent, check context, decide what to say, and determine whether a response needs approval.</p>
              <p><strong className="font-semibold text-white">FrameLeads exists to make that decision work more structured and visible.</strong> It is not a promise that every reply can, or should, be handled automatically.</p>
            </div>
          </div>
        </section>

        <section id="questions" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="question-index-heading">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">Find your answer</p>
            <h2 id="question-index-heading" className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Start with the question on your mind.</h2>
            <p className="mt-4 text-base leading-7 text-[#A9A9A9]">Choose a question below. It takes you directly to the full answer on this page. No searching through long paragraphs or opening multiple menus.</p>
          </div>

          <nav aria-label="Jump to a FrameLeads question" className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.14] bg-[#242424] p-4 shadow-[0_20px_75px_rgba(0,0,0,0.17)] sm:p-6 lg:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_120%,rgba(255,90,31,0.06),transparent_80%)]" />
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.1] pb-5">
              <div>
                <p className="font-heading text-lg font-bold">Choose a question</p>
                <p className="mt-1 text-sm text-[#A7A7A7]">10 direct answers · Each one has its own link</p>
              </div>
              <span className="rounded-full border border-white/[0.12] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#B7B7B7]">Quick navigation</span>
            </div>
            <ol className="relative grid gap-3 sm:grid-cols-2">
              {questions.map((item, i) => (
                <li key={item.id}>
                  <a href={"#" + item.id} className="group flex h-full min-h-[106px] items-start gap-3 rounded-xl border border-white/[0.1] bg-[#1A1A1A] px-4 py-4 transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#FF5A1F]/55 hover:bg-[#292321] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] motion-reduce:transform-none motion-reduce:transition-none sm:px-5">
                    <span className="min-w-7 pt-0.5 font-mono text-xs font-bold text-[#FF5A1F]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">
                      <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-[#888888]">{item.topic}</span>
                      <span className="mt-1.5 block text-sm font-semibold leading-6 text-white sm:text-[15px]">{item.question}</span>
                    </span>
                    <Arrow className="mt-1 h-4 w-4 shrink-0 text-[#888888] transition-colors group-hover:text-[#FF5A1F]" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-20" aria-labelledby="answers-heading">
          <div className="border-t border-white/[0.15] pt-9">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">The full picture</p>
            <h2 id="answers-heading" className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Clear answers, in context.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#A7A7A7]">All answers stay visible and linkable. Where decisions depend on your setup, we say so.</p>
          </div>

          <div className="mt-6">
            <Answer id="what-is-frameleads" number="01" eyebrow="The product" question="What exactly is FrameLeads?">
              <p><strong>FrameLeads is a revenue decision intelligence platform for outbound.</strong> It helps teams interpret prospect replies, retain relevant context, identify the next action, and apply the workflow rules surrounding that decision.</p>
              <p>It is designed for the moment after a prospect responds—not just for writing another cold email or generating another list of leads. Its core experience includes Inbox Triage and the AI Decision Packet, which presents the signal, supporting context, and a suggested next move.</p>
            </Answer>

            <Answer id="who-is-it-for" number="02" eyebrow="The audience" question="Who is it built for?">
              <p>FrameLeads is primarily for <strong>founder-led B2B agencies and consultancies already running outbound</strong>, especially when prospect replies create manual review, routing, and judgment work.</p>
              <p>It is a stronger fit when conversations have meaningful commercial value and the team wants assistance without surrendering control. It may be excessive if outbound has not started, replies are rare, or the only requirement is basic email writing.</p>
            </Answer>

            <Answer id="why-it-exists" number="03" eyebrow="The reason" question="Why was FrameLeads created?">
              <p>Campaign tools can send at scale, but they cannot automatically settle every question that follows a reply: Is this person qualified? Are they asking for proof or objecting to price? Does a promise, discount, or exception require someone with authority?</p>
              <p>FrameLeads was built around that handoff. Its purpose is to move from a busy inbox to a <strong>clearer, reviewable decision</strong>, with the conversation context attached.</p>
            </Answer>

            <Answer id="after-a-reply" number="04" eyebrow="The workflow" question="What happens when a prospect replies?">
              <p>The workflow is designed around four connected steps:</p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {[
                  ["01 / UNDERSTAND", "Identify the reply's intent, questions, and urgency."],
                  ["02 / REMEMBER", "Bring the prospect and campaign context into view."],
                  ["03 / DECIDE", "Recommend the appropriate next action and draft."],
                  ["04 / CONTROL", "Apply configured routing, review, and execution rules."],
                ].map(([title, copy]) => (
                  <li key={title} className="rounded-xl border border-white/[0.1] bg-[#242424] p-4">
                    <p className="font-mono text-[10px] font-bold tracking-[0.13em] text-[#FF5A1F]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#C0C0C0]">{copy}</p>
                  </li>
                ))}
              </ol>
              <p>The recommended action depends on the message, available context, and how the team configures its workflow. The system does not make every commercial judgment infallible.</p>
            </Answer>

            <Answer id="different-from-automation" number="05" eyebrow="The difference" question="How is it different from more automation?">
              <p>Adding more outbound automation usually helps a team send, sequence, or trigger more messages. FrameLeads focuses on a different bottleneck: <strong>understanding the incoming reply and deciding what should happen next.</strong></p>
              <p>An LLM can draft text. FrameLeads adds a workflow around that draft: prospect context, decision rules, priority, a suggested action, and the controls needed to review or execute it. These are complementary functions, not interchangeable promises.</p>
              <p>For a practical breakdown of cold email reply classification, buyer qualification and human review, read our <Link href="/ai-inbox-triage">AI Inbox Triage guide for B2B outbound teams</Link>.</p>
            </Answer>

            <Answer id="existing-tools" number="06" eyebrow="The stack" question="Does it replace my outbound tools or SDRs?">
              <p>Not necessarily. FrameLeads provides native outbound capabilities, and supported sending infrastructure can remain part of the operation. The exact connection options depend on the integration and your configuration.</p>
              <p>It also does not replace the judgment of a founder or sales representative. Its role is to reduce repetitive interpretation and handoff work so people can concentrate on conversations that actually need them.</p>
            </Answer>

            <Answer id="human-control" number="07" eyebrow="Human control" question="Who controls consequential decisions and sending?">
              <p><strong>The team&apos;s configured rules and authorized users govern execution.</strong> FrameLeads can recommend a response and identify situations that require review. Routine actions may follow configured automation, while sensitive situations can be routed for human intervention.</p>
              <p>Human controls, manual overrides, and outbound permissions are different things. The availability of a send control does not mean every user can bypass permissions or that a particular message has already been approved. Teams should review their configuration before using automated sending in production.</p>
            </Answer>

            <Answer id="plans" number="08" eyebrow="Plans" question="What do Core and Enterprise include?">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.14] bg-[#242424] p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-[#888888]">FrameLeads Core</p>
                  <p className="mt-3 font-heading text-2xl font-bold text-white">$149<span className="ml-1 font-sans text-sm font-medium text-[#888888]">/ month</span></p>
                  <p className="mt-3 text-sm leading-6 text-[#C0C0C0]">Up to 500 prospects per month. Inbox Triage, Decision Engine, prospect intelligence, native outbound, and human-reviewed workflows.</p>
                  <Link href="/#pricing" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">See plan details <Arrow className="h-4 w-4" /></Link>
                </div>
                <div className="rounded-xl border border-[#FF5A1F]/35 bg-[#242424] p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-[#FF5A1F]">FrameLeads Enterprise</p>
                  <p className="mt-3 font-heading text-2xl font-bold text-white">$499<span className="ml-1 font-sans text-sm font-medium text-[#888888]">/ month</span></p>
                  <p className="mt-3 text-sm leading-6 text-[#C0C0C0]">Up to 10,000 prospects per month. Adds advanced governance, governed automation, risk and SLA controls, and outcome learning.</p>
                  <Link href="/#pricing" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">See plan details <Arrow className="h-4 w-4" /></Link>
                </div>
              </div>
              <p>Check the current checkout and product terms for the complete included features and purchase conditions.</p>
            </Answer>

            <Answer id="try-before-buying" number="09" eyebrow="Evaluation" question="Can I evaluate it before committing?">
              <p>Start with the <Link href="/#reply-scenarios">Reply Scenarios</Link> on the homepage, which illustrate how different prospect replies can lead to different decisions. You can also examine the actual product-interface screenshots in <Link href="/#capabilities">How It Works</Link>.</p>
              <p>The one-time <strong>$10 Micro-Pilot</strong> is designed as a smaller starting point: 25 prospects, three reply analyses, and three qualified Scout opportunities, with no autonomous sends included. Confirm availability and the current offer terms before checkout.</p>
              <p>Illustrative scenarios and synthetic tests are demonstrations, not independent customer performance results.</p>
            </Answer>

            <Answer id="official-website" number="10" eyebrow="Company identity" question="Which FrameLeads website is official?">
              <p><strong>frameleads.io is the official website for the FrameLeads reply-decision intelligence SaaS described here.</strong> It is offered under the BrandFlow Studio name. The application is accessed through <a href="https://app.frameleads.io">app.frameleads.io</a>.</p>
              <p>Websites with similar names—including frameleads.net and frameleads.com—should not be treated as sources for this product&apos;s features, pricing, or company identity. For the authoritative description of this software, use <Link href="/">frameleads.io</Link>.</p>
            </Answer>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 pt-4 sm:px-8 sm:pb-28" aria-labelledby="next-step-heading">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[#FF5A1F]/30 bg-[#242424] p-7 sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_100%_110%,rgba(255,90,31,0.12),transparent_80%)]" />
            <div className="relative">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">Explore the workflow</p>
              <h2 id="next-step-heading" className="mt-3 max-w-xl font-heading text-2xl font-bold tracking-tight sm:text-3xl">See how the next decision unfolds.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B7B7B7]">Choose a recognizable prospect reply, then inspect the signals, decision packet, and suggested next step. No outreach is sent by the scenario preview.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/#reply-scenarios" className="fl-cta-pop inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e8511b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Explore Reply Scenarios <Arrow className="h-4 w-4" /></Link>
                <Link href="/#pricing" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/[0.22] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.05]">See plans</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#1A1A1A] px-5 pb-8 pt-14 text-white sm:px-8 sm:pt-16" aria-label="Footer navigation">
        <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="FrameLeads home">
              <Image src="/logo.png" alt="" width={42} height={42} className="rounded-lg" />
              <span className="font-heading text-xl font-bold tracking-wide text-white">FrameLeads</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#888888]">Decision intelligence for founder-led outbound teams.</p>
          </div>
          <nav aria-label="Footer product navigation" className="flex flex-col items-start gap-3">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#888888]">Product</p>
            <Link href="/#capabilities" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">How It Works</Link>
            <Link href="/#simulation" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Product</Link>
            <Link href="/#pricing" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Pricing</Link>
            <Link href="/#faq" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">FAQ</Link>
          </nav>
          <nav aria-label="Footer company navigation" className="flex flex-col items-start gap-3">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#888888]">Company</p>
            <span aria-current="page" className="text-sm font-semibold text-[#FF5A1F]">About FrameLeads</span>
            <a href="https://app.frameleads.io/login" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Log In</a>
            <a href="mailto:akram@frameleads.io" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Contact / Support</a>
            <Link href="/terms" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Privacy Policy</Link>
          </nav>
        </div>
        <div className="mx-auto mt-14 flex w-full max-w-6xl flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#888888] sm:flex-row sm:items-center">
          <p>© 2026 FrameLeads. A BrandFlow Studio Company.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-[#FF5A1F]">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-[#FF5A1F]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
