/**
 * Read-only educational examples, NOT results from a live decision engine.
 * Terms and possible boundaries checked against SaaS main code (2026-11-02):
 * src/lib/decision/triage.ts, simulation.ts, intent-signals.ts,
 * src/lib/sales-constitution.ts and src/lib/decision/replay.ts.
 * Seller rules / context in these fixtures are illustrative. Do not label as
 * customer records, processed decisions, measured impact or competitor proof.
 */
export type ReplyScenario = {
  id: "ambiguous" | "pricing" | "handoff";
  number: string;
  eyebrow: string;
  title: string;
  teaser: string;
  reply: string;
  company: string;
  role: string;
  prospectName: string;
  prospectEmail: string;
  subject: string;
  pain: string;
  currentWorkaround: string;
  intent: string;
  confidence: string;
  context: string[];
  rule: string;
  ruleSource: string;
  nextAction: string;
  why: string;
  authority: string;
  authorityDetail: string;
  result: string;
  safeguard: string;
};

export const replyScenarios: readonly ReplyScenario[] = [
  {
    id: "ambiguous", number: "01", eyebrow: "READ BETWEEN THE LINES",
    title: "The polite maybe",
    teaser: "Is this genuine interest, or a brush-off?",
    reply: "Sounds interesting. Send me more information and I'll take a look.",
    company: "Northstar Studio", role: "Founder",
    prospectName: "Maya Chen", prospectEmail: "maya@northstar-studio.example", subject: "Re: Working together",
    pain: "A positive-sounding reply is easy to mistake for a sales-ready opportunity.",
    currentWorkaround: "The founder rereads the thread, checks the prospect and decides whether to qualify or push for a meeting.",
    intent: "Possible interest / requesting resources",
    confidence: "Qualified buying intent is not yet established.",
    context: [
      "The prospect asked for information, not a meeting.",
      "No budget, timing or purchasing authority is established in this example.",
      "Conversation history would inform what information is relevant."
    ],
    rule: "Do not invent intent or promise a meeting when interest is unclear.",
    ruleSource: "Example response guideline; actual decisions depend on configured rules and recorded context.",
    nextAction: "Prepare a relevant, low-pressure information follow-up for review.",
    why: "Keep the conversation moving without treating politeness as proof of purchase intent.",
    authority: "Human-review path",
    authorityDetail: "The person responsible for the conversation can inspect and approve or change the proposed follow-up.",
    result: "Uncertain interest stays visible and receives an appropriate next step.",
    safeguard: "No invented lead score, no auto-booking and no autonomous send in this preview."
  },
  {
    id: "pricing", number: "02", eyebrow: "PROTECT THE DEAL",
    title: "The pricing question",
    teaser: "A serious question that needs context and authority.",
    reply: "Before we book, can you clarify the pricing and what is included?",
    company: "Acme Advisory", role: "Managing partner",
    prospectName: "Daniel Brooks", prospectEmail: "daniel@acme-advisory.example", subject: "Re: Your proposal",
    pain: "Someone must understand the commercial context before making a promise.",
    currentWorkaround: "The founder checks the offer, prior discussion and discount rules before responding.",
    intent: "Pricing inquiry",
    confidence: "A commercial question, not an agreed deal or a confirmed meeting.",
    context: [
      "The prospect is asking about scope and price before scheduling.",
      "Prior conversation and approved offer details are relevant.",
      "Price concessions or custom terms may need explicit authority."
    ],
    rule: "Commercial exceptions require the designated person's approval.",
    ruleSource: "Illustrative Sales Constitution rule; your real policies control the outcome.",
    nextAction: "Prepare the pricing clarification and route any exception for approval.",
    why: "Give a useful answer without promising unapproved terms.",
    authority: "Approval required for exceptions",
    authorityDetail: "The assigned human can review the reply, edit it and authorize permitted actions. No exception is approved in this example.",
    result: "The pricing question becomes a reviewable decision, not an unsafe guess.",
    safeguard: "No discount is granted, no deal is marked won and no message is sent."
  },
  {
    id: "handoff", number: "03", eyebrow: "KEEP OWNERSHIP CLEAR",
    title: "The security handoff",
    teaser: "Interest is real, but who owns the next move?",
    reply: "We're interested, but our security team needs to review your setup before we can proceed.",
    company: "Vertex Partners", role: "Operations lead",
    prospectName: "Nadia Hassan", prospectEmail: "nadia@vertex-partners.example", subject: "Re: Next steps",
    pain: "The prospect is waiting for specialist information, not another generic sales follow-up.",
    currentWorkaround: "The SDR forwards the message and hopes the right internal owner responds.",
    intent: "Security review / stakeholder handoff",
    confidence: "Expressed interest with an unresolved approval dependency.",
    context: [
      "A second stakeholder needs information before the buying process progresses.",
      "Security information must come from an authorized source.",
      "An owner and next action must be established before the thread continues."
    ],
    rule: "Security or compliance claims require an authorized reviewer.",
    ruleSource: "Illustrative policy boundary; routing and assignments depend on real configuration.",
    nextAction: "Prepare a handoff for the designated human reviewer.",
    why: "Avoid guessing about security while making the next responsibility explicit.",
    authority: "Human escalation",
    authorityDetail: "A qualified person supplies or approves the security response. The preview never generates unsupported commitments.",
    result: "The blocker is recognized and a next owner is made explicit.",
    safeguard: "No security assurance is fabricated and no customer-facing message is sent."
  }
] as const;
