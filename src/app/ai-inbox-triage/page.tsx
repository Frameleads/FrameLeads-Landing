import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const canonical = "https://frameleads.io/ai-inbox-triage";

export const metadata: Metadata = {
  title: "AI Inbox Triage for B2B Outbound Sales | FrameLeads",
  description: "A practical guide to cold email reply management: classify buyer intent, qualify prospects, handle objections, and keep human approval over sensitive outbound decisions.",
  alternates: { canonical },
  openGraph: {
    title: "AI Inbox Triage for B2B Outbound Sales | FrameLeads",
    description: "What should happen after a prospect replies? Learn how reply classification, lead qualification and human-controlled AI fit together.",
    url: canonical,
    siteName: "FrameLeads",
    type: "article",
    images: [
      { url: "/images/product-proof/04-decision-packet-20261102.png", alt: "FrameLeads AI Decision Packet with a contextual outbound reply recommendation" },
    ],
  },
};

const questions = [
  { id: "what-is-ai-inbox-triage", q: "What is AI inbox triage for B2B outbound?", label: "Definition" },
  { id: "lead-generation-vs-replies", q: "How is it different from AI lead generation and outbound automation?", label: "Where it fits" },
  { id: "classify-cold-email-replies", q: "How should cold email replies be classified and prioritized?", label: "Reply types" },
  { id: "qualify-buyer-intent", q: "Can AI tell a qualified sales opportunity from a polite reply?", label: "Lead qualification" },
  { id: "pricing-objections-proof", q: "How should AI handle pricing questions, objections, and proof requests?", label: "Commercial replies" },
  { id: "human-approval", q: "When should AI draft, send, or ask a human to approve?", label: "Human control" },
  { id: "existing-outbound-stack", q: "Does AI reply triage replace an SDR, Smartlead, or Instantly?", label: "Existing stack" },
  { id: "measure-roi", q: "How can an agency measure whether reply automation is worth it?", label: "Measurement" },
  { id: "choose-software", q: "What should I look for in AI reply-management software?", label: "Buying criteria" },
  { id: "frameleads-workflow", q: "Where does FrameLeads fit into this workflow?", label: "Product example" },
] as const;

function Arrow({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" className={className}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function Section({ id, index, topic, title, children }: { id: string; index: string; topic: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id + "-title"} className="scroll-mt-28 border-t border-white/[0.12] py-12 first:border-t-0 sm:scroll-mt-40 sm:py-16">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-12">
        <div className="lg:pr-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF5A1F]">{index} / {topic}</p>
          <h2 id={id + "-title"} className="mt-4 max-w-md font-heading text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.25] tracking-tight text-white">{title}</h2>
          <a href="#questions" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#888888] underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">Back to questions <span aria-hidden="true">↑</span></a>
        </div>
        <div className="space-y-5 text-[15px] leading-[1.8] text-[#B7B7B7] sm:text-base [&_strong]:font-semibold [&_strong]:text-white [&_a]:text-white [&_a]:underline [&_a]:decoration-[#FF5A1F]/65 [&_a]:underline-offset-4 [&_a:hover]:text-[#FF5A1F]">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function AiInboxTriageGuide() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": canonical + "#article",
      headline: "AI Inbox Triage for B2B Outbound Sales: Reply Management, Qualification and Human Control",
      description: "Practical guidance for classifying outbound sales replies, qualifying intent, managing objections and deciding when human review is needed.",
      mainEntityOfPage: canonical,
      author: { "@id": "https://frameleads.io/#organization" },
      publisher: { "@id": "https://frameleads.io/#organization" },
      image: "https://frameleads.io/images/product-proof/04-decision-packet-20261102.png",
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://frameleads.io/" },
        { "@type": "ListItem", position: 2, name: "AI Inbox Triage", item: canonical },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#1A1A1A] font-sans text-white selection:bg-[#FF5A1F] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_-6%,rgba(255,90,31,0.10),transparent_72%)]" />

      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-b border-white/[0.1] bg-[#1A1A1A]/95 px-5 py-4 backdrop-blur-xl sm:px-8 lg:sticky lg:top-5 lg:mt-5 lg:rounded-2xl lg:border lg:border-white/[0.12] lg:bg-[#242424]/90 lg:px-7">
        <Link href="/" aria-label="FrameLeads home" className="inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5A1F]">
          <Image src="/logo.png" width={34} height={34} alt="" className="rounded-lg" priority />
          <span className="font-heading text-lg font-bold tracking-wide sm:text-xl">FrameLeads</span>
        </Link>
        <nav aria-label="Guide navigation" className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="text-sm text-white/75 transition-colors hover:text-white">Home</Link>
          <Link href="/about" className="text-sm text-white/75 transition-colors hover:text-white">About</Link>
          <Link href="/#capabilities" className="text-sm text-white/75 transition-colors hover:text-white">Product</Link>
          <span aria-current="page" className="text-sm font-semibold text-[#FF5A1F]">Insights</span>
        </nav>
        <Link href="/#reply-scenarios" className="fl-cta-pop inline-flex min-h-10 items-center justify-center rounded-lg bg-[#FF5A1F] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e8511b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:px-4 sm:text-sm">Explore Reply Scenarios</Link>
      </header>

      <main className="relative z-10">
        <article>
          <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28" aria-labelledby="guide-heading">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#888888]">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#FF5A1F]">Outbound Intelligence Guide</span>
            </nav>
            <p className="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.20em] text-[#FF5A1F]">COLD EMAIL REPLY MANAGEMENT · PRACTICAL GUIDE</p>
            <h1 id="guide-heading" className="mt-5 max-w-5xl font-heading text-[clamp(2.45rem,5.8vw,4.8rem)] font-bold leading-[1.07] tracking-[-0.035em]">
              AI inbox triage for <span className="text-[#FF5A1F]">B2B outbound sales.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-[1.85] text-[#B7B7B7] sm:text-lg">How to classify cold email replies, identify genuine buying intent, handle pricing and objections, and use AI automation without giving up control of consequential sales decisions.</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#888888]">
              <span>By FrameLeads · BrandFlow Studio</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#FF5A1F] sm:inline-block" aria-hidden="true" />
              <span>For founder-led B2B agencies already running outbound</span>
            </div>
            <div className="mt-12 grid gap-3 border-t border-white/[0.12] pt-7 sm:grid-cols-4">
              {[
                ["01", "Capture the reply"],
                ["02", "Interpret the intent"],
                ["03", "Choose the next action"],
                ["04", "Apply human control"],
              ].map(([index, name]) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-[#242424]/80 px-4 py-4">
                  <span className="font-mono text-sm font-bold text-[#FF5A1F]">{index}</span>
                  <span className="text-sm font-medium text-white">{name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border-y border-white/[0.08] bg-[#222222]/70">
            <div className="mx-auto grid max-w-6xl gap-7 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-[0.8fr_1.3fr] md:gap-14">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.17em] text-[#FF5A1F]">The short answer</p>
                <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">What happens after someone replies?</h2>
              </div>
              <div className="space-y-4 text-base leading-[1.85] text-[#C3C3C3]">
                <p><strong className="text-white">AI inbox triage</strong> is the process of analyzing incoming prospect replies, grouping them by intent and urgency, and suggesting what the sales team should do next.</p>
                <p>For B2B outbound, the useful output is not just an “interested” label. It is a decision: answer a pricing question, send verified proof, involve a founder, schedule a later follow-up, or honor a request to stop contacting someone. AI can help prepare those decisions; human authority still matters.</p>
              </div>
            </div>
          </section>

          <section id="questions" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="questions-heading">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.17em] text-[#FF5A1F]">Find your answer</p>
              <h2 id="questions-heading" className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Choose the question you need answered.</h2>
              <p className="mt-4 text-base leading-7 text-[#B0B0B0]">These questions reflect recurring topics in outbound reply-management guidance and the FrameLeads AI-visibility tests. Select any one to jump to its full explanation below.</p>
            </div>
            <nav aria-label="Jump to an outbound reply management question" className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-white/[0.14] bg-[#242424] p-4 shadow-[0_28px_85px_rgba(0,0,0,0.20)] sm:p-6 lg:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_55%_110%,rgba(255,90,31,.065),transparent_80%)]" />
              <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.1] pb-5">
                <p className="font-heading text-lg font-bold">Explore 10 practical questions</p>
                <span className="rounded-full border border-white/[0.14] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#B0B0B0]">Jump to answer</span>
              </div>
              <ol className="relative grid gap-3 sm:grid-cols-2">
                {questions.map((item, i) => (
                  <li key={item.id}>
                    <a href={"#" + item.id} className="group flex h-full min-h-[112px] items-start gap-3 rounded-xl border border-white/[0.10] bg-[#1A1A1A] p-4 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#FF5A1F]/55 hover:bg-[#292321] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] motion-reduce:transform-none motion-reduce:transition-none sm:p-5">
                      <span className="min-w-7 font-mono text-xs font-bold text-[#FF5A1F]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-[#888888]">{item.label}</span>
                        <span className="mt-1.5 block text-sm font-semibold leading-6 text-white sm:text-[15px]">{item.q}</span>
                      </span>
                      <Arrow className="mt-1 h-4 w-4 shrink-0 text-[#888888] transition-colors group-hover:text-[#FF5A1F]" />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </section>

          <div className="mx-auto max-w-6xl px-5 pb-6 sm:px-8 sm:pb-12">
            <Section id="what-is-ai-inbox-triage" index="01" topic="Definition" title="What is AI inbox triage for B2B outbound?">
              <p>AI inbox triage is a structured way to review replies arriving from cold email or other outbound campaigns. It extracts the prospect’s question, intent, urgency, and relevant context, then helps a person or a governed workflow prioritize the next step.</p>
              <p><strong>Reply classification is only one part of triage.</strong> “Interested,” “not now,” “question,” or “unsubscribe” describes the response. Useful triage goes further: who owns the next decision, what information is missing, and which action is appropriate?</p>
              <p>For agencies managing outbound for clients, the decision also needs the right account and campaign context. A reply that requests pricing may be important, but its urgency and recommended response depend on the deal, the sender, and what can actually be promised.</p>
            </Section>

            <Section id="lead-generation-vs-replies" index="02" topic="Where it fits" title="How is it different from AI lead generation and outbound automation?">
              <p><strong>AI lead generation</strong> identifies or researches potential buyers. <strong>Outbound automation</strong> sends and sequences outreach. <strong>AI reply management</strong> starts after the prospect responds. They support different stages of the same sales workflow.</p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.12]">
                <table className="w-full min-w-[460px] border-collapse text-left text-sm">
                  <thead className="bg-[#292929] text-white">
                    <tr><th scope="col" className="p-4 font-semibold">Stage</th><th scope="col" className="p-4 font-semibold">Primary question</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.09] bg-[#212121] text-[#C0C0C0]">
                    <tr><th scope="row" className="p-4 font-medium text-white">AI lead generation</th><td className="p-4">Who should we contact?</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Outbound sales automation</th><td className="p-4">How do we deliver and follow up on outreach?</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Reply classification</th><td className="p-4">What is the prospect saying?</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Reply-decision intelligence</th><td className="p-4">What should happen next, and who is allowed to do it?</td></tr>
                  </tbody>
                </table>
              </div>
              <p>If a team is already generating qualified outbound conversations, buying more prospecting automation may not solve the work building up <em>after</em> those conversations begin.</p>
            </Section>

            <Section id="classify-cold-email-replies" index="03" topic="Reply types" title="How should cold email replies be classified and prioritized?">
              <p>Start with categories that lead to a clear operational action—not sentiment alone. These examples are a suggested workflow, not an assertion that every product automatically performs every action.</p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.12]">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                  <thead className="bg-[#292929] text-white">
                    <tr><th scope="col" className="p-4 font-semibold">Reply signal</th><th scope="col" className="p-4 font-semibold">Possible meaning</th><th scope="col" className="p-4 font-semibold">Next action to consider</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.09] bg-[#212121] text-[#C0C0C0]">
                    <tr><th scope="row" className="p-4 font-medium text-white">Meeting request</th><td className="p-4">Explicit next step</td><td className="p-4">Prioritize scheduling or human follow-through</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Pricing or proof request</th><td className="p-4">Possible evaluation</td><td className="p-4">Answer accurately; review commercial claims</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Objection</th><td className="p-4">Constraint or uncertainty</td><td className="p-4">Clarify the concern; avoid unapproved promises</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Referral / wrong contact</th><td className="p-4">Another owner identified</td><td className="p-4">Update contact context; request an appropriate introduction</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Not now</th><td className="p-4">Timing constraint, not necessarily interest</td><td className="p-4">Record the stated timing and respect the reply</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Out of office</th><td className="p-4">Automated reply</td><td className="p-4">Avoid treating as buying intent</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Unsubscribe / stop</th><td className="p-4">Clear contact preference</td><td className="p-4">Suppress future outreach promptly</td></tr>
                  </tbody>
                </table>
              </div>
              <p>A good queue surfaces commercial opportunities while making exclusions and opt-out requests hard to miss. Do not infer “HOT” from a single keyword; check the actual message and context.</p>
            </Section>

            <Section id="qualify-buyer-intent" index="04" topic="Lead qualification" title="Can AI tell a qualified sales opportunity from a polite reply?">
              <p>AI can help identify <strong>expressed buying signals</strong> such as requests for a proposal, integration details, pricing, implementation timing, or a meeting. But reply intent is not the same as <strong>lead qualification</strong>.</p>
              <p>A company can ask for pricing and still be outside your ideal customer profile (ICP). Conversely, a strong-fit buyer can sound cautious or raise an objection. Qualification therefore needs both what the prospect <em>says</em> and what your team <em>knows</em> about the account.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.12] bg-[#242424] p-5">
                  <p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#FF5A1F]">REPLY INTENT</p>
                  <p className="mt-2 text-sm leading-6">Are they asking to evaluate, objecting, referring, declining, or requesting a later conversation?</p>
                </div>
                <div className="rounded-xl border border-white/[0.12] bg-[#242424] p-5">
                  <p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#FF5A1F]">ACCOUNT FIT</p>
                  <p className="mt-2 text-sm leading-6">Is this the right company, buyer, use case, scale, and commercial opportunity?</p>
                </div>
              </div>
              <p>When the evidence is ambiguous, the right outcome may be a clarification question or human review—not an invented confidence score. An intent score should not be presented as a verified likelihood of closing a deal.</p>
            </Section>

            <Section id="pricing-objections-proof" index="05" topic="Commercial replies" title="How should AI handle pricing questions, objections, and proof requests?">
              <p>These are consequential sales conversations. The reply should be assessed against approved pricing, real evidence, and the team's authority to make commitments. A polished draft is not useful if it invents a discount or promises results that have not been demonstrated.</p>
              <div className="rounded-xl border border-white/[0.14] bg-[#242424] p-5 sm:p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#FF5A1F]">Illustrative outbound reply</p>
                <blockquote className="mt-3 border-l-2 border-[#FF5A1F]/55 pl-4 text-base font-medium leading-7 text-white">“We are comparing agencies this week. Can you send pricing, a relevant case study, and how your team handles prospect replies? Our founder reviews options Thursday.”</blockquote>
                <div className="mt-5 grid gap-4 border-t border-white/[0.10] pt-5 sm:grid-cols-2">
                  <div><p className="font-mono text-[10px] font-bold text-[#888888]">SIGNALS</p><p className="mt-2 text-sm leading-6">Commercial evaluation · Pricing · Proof required · Stated review date</p></div>
                  <div><p className="font-mono text-[10px] font-bold text-[#888888]">SAFER NEXT ACTION</p><p className="mt-2 text-sm leading-6">Prepare accurate pricing and verified evidence; route unapproved commitments for review</p></div>
                </div>
              </div>
              <p>Answer the prospect's actual question first. If the case study or authority to offer a discount is missing, mark that gap clearly rather than making it up. An <strong>AI-generated draft</strong> should remain reviewable when it touches scope, commercial terms, or consequential promises.</p>
            </Section>

            <Section id="human-approval" index="06" topic="Human control" title="When should AI draft, send, or ask a human to approve?">
              <p>Use different controls for different levels of risk. Routine classification can be automated with appropriate checks; commercial exceptions often deserve human judgment. Whether a message can be sent depends on authorized permissions, configured rules, and the connected outbound path.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["CLASSIFY", "Low-consequence sorting: label a response and present its context."],
                  ["PREPARE", "Suggest a response using approved information, with the reason visible."],
                  ["REVIEW / EXECUTE", "Route sensitive actions to authorized people or permitted workflows."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-xl border border-white/[0.12] bg-[#242424] p-4">
                    <p className="font-mono text-[10px] font-bold tracking-wider text-[#FF5A1F]">{title}</p>
                    <p className="mt-3 text-sm leading-6 text-[#C7C7C7]">{copy}</p>
                  </div>
                ))}
              </div>
              <p>Human-in-the-loop AI is not the same as “every message requires one click,” nor does a visible manual-send button imply permission to override all controls. Teams should test approvals, overrides, stop conditions, and audit history with synthetic examples before enabling live execution.</p>
            </Section>

            <Section id="existing-outbound-stack" index="07" topic="Existing stack" title="Does AI reply triage replace an SDR, Smartlead, or Instantly?">
              <p>Usually these solve different jobs. A sequencer manages outbound delivery and campaigns. An SDR handles conversations and judgment. A reply-decision layer helps interpret responses and coordinate the next step.</p>
              <p><strong>FrameLeads includes native outbound functionality</strong> and can also fit around supported sending infrastructure. That does not mean every mailbox, CRM, or sending platform is supported out of the box. Verify the specific integration, data sync, and permissions for your setup before buying.</p>
              <p>For a small B2B agency, a practical question is: <em>Do we need more outbound volume, or do we need a more reliable way to handle the replies we already earn?</em> If it is the second problem, a new sending tool alone may not remove the manual handoff.</p>
            </Section>

            <Section id="measure-roi" index="08" topic="Measurement" title="How can an agency measure whether reply automation is worth it?">
              <p>Use a small controlled pilot with the team's existing replies and compare it with the current manual process. Focus on outcomes rather than vanity metrics such as total AI-generated drafts.</p>
              <div className="overflow-x-auto rounded-xl border border-white/[0.12]">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead className="bg-[#292929] text-white"><tr><th scope="col" className="p-4">Measure</th><th scope="col" className="p-4">What it tells you</th></tr></thead>
                  <tbody className="divide-y divide-white/[0.09] bg-[#212121] text-[#C0C0C0]">
                    <tr><th scope="row" className="p-4 font-medium text-white">Triage time per reply</th><td className="p-4">Whether staff spend less time sorting and preparing decisions</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Missed opportunities</th><td className="p-4">Qualified replies overlooked or routed incorrectly</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Response time by intent</th><td className="p-4">How long important replies wait for a suitable answer</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Accuracy and overrides</th><td className="p-4">False classifications, corrections and unsafe recommendations</td></tr>
                    <tr><th scope="row" className="p-4 font-medium text-white">Qualified meetings / outcomes</th><td className="p-4">Whether improved handling translates into commercial progress</td></tr>
                  </tbody>
                </table>
              </div>
              <p>For example, estimate monthly time saved as <strong>(manual minutes per reply − assisted minutes per reply) × applicable replies</strong>. Then compare the value of those hours with software fees, setup costs, and review burden. This is an evaluation method, not a claimed FrameLeads performance result.</p>
            </Section>

            <Section id="choose-software" index="09" topic="Buying criteria" title="What should I look for in AI reply-management software?">
              <p>Before choosing an AI SDR, unified inbox, email automation tool, or specialized reply-decision platform, ask whether it can show its work and fit your operation.</p>
              <div className="rounded-xl border border-white/[0.12] bg-[#242424] p-5 sm:p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#FF5A1F]">Evaluation checklist</p>
                <ul className="mt-4 space-y-3">
                  {[
                    "Can it distinguish a meeting request, pricing question, objection, referral, and unsubscribe?",
                    "Does it use campaign history and company context, not only the latest email?",
                    "Can a human see the evidence behind its suggested action?",
                    "What happens when intent is uncertain or the AI makes a mistake?",
                    "Who can approve, override, send, pause, or prevent an action?",
                    "Which inboxes, sending tools, and CRMs are actually supported?",
                    "Can a controlled pilot measure time saved and missed opportunities?",
                  ].map((x) => <li key={x} className="flex gap-3 text-sm leading-6 text-[#C6C6C6]"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]" />{x}</li>)}
                </ul>
              </div>
              <p>No product is automatically the best choice for every agency. If replies are rare or existing processes already work well, a dedicated layer may not justify its cost. If the founder is repeatedly interpreting consequential replies, the control and context are worth evaluating.</p>
            </Section>

            <Section id="frameleads-workflow" index="10" topic="Product example" title="Where does FrameLeads fit into this workflow?">
              <p><Link href="/about">FrameLeads</Link> is a B2B outbound reply-decision intelligence platform for founder-led agencies and consultancies. It helps connect <strong>Inbox Triage → prospect context → AI Decision Packet → reviewed next action</strong>.</p>
              <p>Instead of treating every positive-looking response the same way, the workflow is designed to surface the relevant signal, interpret it against available context, and present an action the team can inspect or govern.</p>
              <figure className="overflow-hidden rounded-xl border border-white/[0.14] bg-[#242424]">
                <Image src="/images/product-proof/02-incoming-reply-20261102.png" width={1300} height={850} alt="FrameLeads Inbox Triage product interface showing an incoming outbound reply and its status" className="h-auto w-full object-contain" sizes="(max-width: 768px) 100vw, 720px" />
                <figcaption className="border-t border-white/[0.1] px-4 py-3 text-xs leading-5 text-[#A7A7A7]">FrameLeads product interface. Screenshot content is from a test/demo account, not independently verified customer results.</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-xl border border-white/[0.14] bg-[#242424]">
                <Image src="/images/product-proof/04-decision-packet-20261102.png" width={1300} height={850} alt="FrameLeads AI Decision Packet presenting context, recommended next action, and human-review guidance" className="h-auto w-full object-contain" sizes="(max-width: 768px) 100vw, 720px" />
                <figcaption className="border-t border-white/[0.1] px-4 py-3 text-xs leading-5 text-[#A7A7A7]">AI Decision Packet in the actual product UI, shown with test/demo data. No accuracy or conversion rate is implied.</figcaption>
              </figure>
              <p>The public homepage includes a no-send <Link href="/#reply-scenarios">Reply Decision Preview</Link> so you can inspect how different situations are interpreted. For paid operation, <Link href="/#pricing">FrameLeads Core and Enterprise</Link> have different prospect limits and control capabilities; review the current plan details before choosing.</p>
            </Section>
          </div>

          <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24" aria-labelledby="sources-heading">
            <div className="rounded-xl border border-white/[0.1] bg-[#222222] p-5 sm:p-7">
              <h2 id="sources-heading" className="font-heading text-lg font-bold text-white">Sources and scope</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-[#B4B4B4]">This guide combines first-party FrameLeads product information with external material on outbound reply classification and search discoverability. Its questions are based on recurring industry themes and monitored AI queries, not a verified ranking of Google search volume. Example replies and screenshots are demonstrations, not real-customer outcome studies.</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <a href="https://instantly.ai/blog/automate-email-triage-classification-ai/" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]">AI reply classification · Instantly</a>
                <a href="https://masterinbox.com/blog/cold-email-reply-management-guide" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]">Cold email reply management · Master Inbox</a>
                <a href="https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/25 underline-offset-4 hover:text-[#FF5A1F]">Search / AI visibility guidance · Google</a>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-28" aria-labelledby="guide-cta-heading">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#FF5A1F]/30 bg-[#242424] p-7 sm:p-10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_80%_at_100%_100%,rgba(255,90,31,0.12),transparent_82%)]" />
              <div className="relative max-w-3xl">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.17em] text-[#FF5A1F]">See the decision layer</p>
                <h2 id="guide-cta-heading" className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Your prospect replied. Now what?</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#B7B7B7]">Choose a common outbound reply and see how the signals, context, and next decision unfold. The scenario preview is illustrative and does not send messages.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/#reply-scenarios" className="fl-cta-pop inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e8511b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Explore Reply Scenarios <Arrow className="h-4 w-4" /></Link>
                  <Link href="/about" className="inline-flex min-h-12 items-center rounded-xl border border-white/[0.22] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/[0.05]">About FrameLeads</Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>

      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#1A1A1A] px-5 pb-8 pt-14 text-white sm:px-8 sm:pt-16" aria-label="Footer navigation">
        <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="FrameLeads home"><Image src="/logo.png" width={42} height={42} alt="" className="rounded-lg" /><span className="font-heading text-xl font-bold tracking-wide text-white">FrameLeads</span></Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#888888]">Decision intelligence for founder-led outbound teams.</p>
          </div>
          <nav aria-label="Footer product navigation" className="flex flex-col items-start gap-3">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#888888]">Product</p>
            <Link href="/#capabilities" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">How It Works</Link>
            <Link href="/#simulation" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Product</Link>
            <Link href="/#pricing" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Pricing</Link>
            <Link href="/#faq" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">FAQ</Link>
            <span aria-current="page" className="text-sm font-semibold text-[#FF5A1F]">AI Inbox Triage Guide</span>
          </nav>
          <nav aria-label="Footer company navigation" className="flex flex-col items-start gap-3">
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#888888]">Company</p>
            <Link href="/about" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">About FrameLeads</Link>
            <a href="https://app.frameleads.io/login" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Log In</a>
            <a href="mailto:akram@frameleads.io" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Contact / Support</a>
            <Link href="/terms" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-white/80 transition-colors hover:text-[#FF5A1F]">Privacy Policy</Link>
          </nav>
        </div>
        <div className="mx-auto mt-14 flex w-full max-w-6xl flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#888888] sm:flex-row sm:items-center">
          <p>© 2026 FrameLeads. A BrandFlow Studio Company.</p>
          <div className="flex items-center gap-6"><Link href="/privacy" className="transition-colors hover:text-[#FF5A1F]">Privacy</Link><Link href="/terms" className="transition-colors hover:text-[#FF5A1F]">Terms</Link></div>
        </div>
      </footer>
    </div>
  );
}
