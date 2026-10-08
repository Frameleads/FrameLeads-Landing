import {attributionFields,normalizeAttribution,type Attribution} from './measurement.ts';
export const diagnosisTypes = ["LOW_CURRENT_PRESSURE", "FOUNDER_DECISION_BOTTLENECK", "FRAGMENTED_REPLY_WORKFLOW", "UNCONTROLLED_AUTOMATION", "HIGH_CONSEQUENCE_DECISION_WORKFLOW"] as const;
export type DiagnosisType = (typeof diagnosisTypes)[number];
export const auditOptions = {
  monthlyQualifiedConversations: ["0–5", "6–15", "16–30", "31–60", "60+"],
  dealValue: ["Under $2k", "$2k–$10k", "$10k–$25k", "$25k–$50k", "$50k+"],
  weeklyManualBurden: ["Under 1 hour", "1–3 hours", "4–7 hours", "8–12 hours", "12+ hours"],
  decisionOwner: ["I do — founder / owner", "SDR / salesperson", "VA / assistant", "AI / automation", "Whoever sees it first", "It depends on the reply"],
  nonRoutineHandling: ["It comes back to me", "A salesperson decides", "AI keeps handling it", "The workflow pauses", "We don't have a consistent process"],
} as const;
export type AuditAnswers = { [Key in keyof typeof auditOptions]: (typeof auditOptions)[Key][number] };
export type AuditSignal = "HIGH_VALUE" | "HIGH_VOLUME" | "HIGH_MANUAL_BURDEN" | "FOUNDER_OWNED" | "AUTOMATION_RISK" | "INCONSISTENT_OWNERSHIP";
export type AuditResult = { diagnosis: DiagnosisType; signals: AuditSignal[]; answers: AuditAnswers };
export const diagnosisCopy: Record<DiagnosisType, { title: string; body: string; emphasis: string; gap: string }> = {
  LOW_CURRENT_PRESSURE: { title: "Low Current Pressure", body: "Your current reply volume and decision burden are light enough that a dedicated decision layer may be unnecessary today.", emphasis: "FrameLeads may be more infrastructure than this workflow needs right now.", gap: "Your current workflow has limited pressure and may not yet require a dedicated decision layer." },
  FOUNDER_DECISION_BOTTLENECK: { title: "Founder Decision Bottleneck", body: "Your outbound is running, but meaningful replies still route through you before the workflow can move.", emphasis: "Your problem isn't response generation. It's decision ownership.", gap: "Meaningful replies still depend on founder judgment before the next action can happen." },
  FRAGMENTED_REPLY_WORKFLOW: { title: "Fragmented Reply Workflow", body: "Reply decisions depend on whoever is handling the conversation rather than one consistent operating layer.", emphasis: "Context and decision logic should not change with the person watching the inbox.", gap: "Reply ownership and decision logic vary across the people handling the inbox." },
  UNCONTROLLED_AUTOMATION: { title: "Uncontrolled Automation", body: "Automation can continue into situations where the next action may require context or human judgment.", emphasis: "More automation isn't the answer. Better boundaries are.", gap: "Automation lacks a reliable boundary for replies that require context or human judgment." },
  HIGH_CONSEQUENCE_DECISION_WORKFLOW: { title: "High-Consequence Decision Workflow", body: "Your conversations are valuable enough that routine automation and consequential decisions should not operate under the same authority.", emphasis: "High-value conversations need a decision layer, not another autoresponder.", gap: "Routine replies and consequential conversations currently share the same decision authority." },
};
const highValue = new Set<AuditAnswers["dealValue"]>(["$10k–$25k", "$25k–$50k", "$50k+"]);
const highVolume = new Set<AuditAnswers["monthlyQualifiedConversations"]>(["31–60", "60+"]);
const highBurden = new Set<AuditAnswers["weeklyManualBurden"]>(["8–12 hours", "12+ hours"]);
export function diagnoseReplyWorkflow(answers: AuditAnswers): AuditResult {
  const uncontrolled = answers.decisionOwner === "AI / automation" || answers.nonRoutineHandling === "AI keeps handling it";
  const founderOwned = answers.decisionOwner === "I do — founder / owner" || answers.nonRoutineHandling === "It comes back to me";
  const inconsistent = answers.decisionOwner === "Whoever sees it first" || answers.nonRoutineHandling === "We don't have a consistent process";
  const manualOperator = answers.decisionOwner === "SDR / salesperson" || answers.decisionOwner === "VA / assistant" || answers.nonRoutineHandling === "A salesperson decides";
  const low = answers.monthlyQualifiedConversations === "0–5" && (answers.weeklyManualBurden === "Under 1 hour" || answers.weeklyManualBurden === "1–3 hours") && (answers.dealValue === "Under $2k" || answers.dealValue === "$2k–$10k") && !uncontrolled && !inconsistent;
  let diagnosis: DiagnosisType = "FRAGMENTED_REPLY_WORKFLOW";
  if (uncontrolled) diagnosis = "UNCONTROLLED_AUTOMATION";
  else if (low) diagnosis = "LOW_CURRENT_PRESSURE";
  else if (founderOwned) diagnosis = "FOUNDER_DECISION_BOTTLENECK";
  else if (inconsistent || manualOperator) diagnosis = "FRAGMENTED_REPLY_WORKFLOW";
  else if (highValue.has(answers.dealValue)) diagnosis = "HIGH_CONSEQUENCE_DECISION_WORKFLOW";
  const signals: AuditSignal[] = [];
  if (highValue.has(answers.dealValue)) signals.push("HIGH_VALUE");
  if (highVolume.has(answers.monthlyQualifiedConversations)) signals.push("HIGH_VOLUME");
  if (highBurden.has(answers.weeklyManualBurden)) signals.push("HIGH_MANUAL_BURDEN");
  if (founderOwned) signals.push("FOUNDER_OWNED");
  if (uncontrolled) signals.push("AUTOMATION_RISK");
  if (inconsistent) signals.push("INCONSISTENT_OWNERSHIP");
  return { diagnosis, signals, answers };
}
export function isValidAuditAnswers(value: unknown): value is AuditAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const object = value as Record<string, unknown>;
  return Object.keys(object).length === Object.keys(auditOptions).length
    && (Object.keys(auditOptions) as (keyof typeof auditOptions)[]).every((key) => typeof object[key] === "string" && (auditOptions[key] as readonly string[]).includes(object[key] as string));
}
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizeCompanyWebsite(value: string) {
  try {
    const trimmed = value.trim();
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const domain = url.hostname.replace(/^www\./i, "").replace(/\.$/, "").toLowerCase();
    return domain.includes(".") && domain.length <= 253 && /^[a-z0-9.-]+$/.test(domain)
      && (url.protocol === "http:" || url.protocol === "https:") ? domain : null;
  } catch { return null; }
}

export type AuditLeadPayload = {
  firstName?: string;
  workEmail: string;
  companyWebsite: string;
  diagnosis: DiagnosisType;
  signals: AuditSignal[];
  answers: AuditAnswers;
  attribution: Partial<Record<"utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "utmTerm" | "referrer" | "landingPath", string>> & Attribution;
};
const signalSet = new Set<AuditSignal>(["HIGH_VALUE", "HIGH_VOLUME", "HIGH_MANUAL_BURDEN", "FOUNDER_OWNED", "AUTOMATION_RISK", "INCONSISTENT_OWNERSHIP"]);
export function validateAuditLeadPayload(value: unknown): AuditLeadPayload | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.workEmail !== "string" || !emailPattern.test(body.workEmail.trim()) || body.workEmail.length > 254) return null;
  if (typeof body.companyWebsite !== "string") return null;
  const companyWebsite = normalizeCompanyWebsite(body.companyWebsite);
  if (!companyWebsite || !diagnosisTypes.includes(body.diagnosis as DiagnosisType)) return null;
  if (!Array.isArray(body.signals) || body.signals.length > 20 || !body.signals.every((signal) => typeof signal === "string" && signalSet.has(signal as AuditSignal))) return null;
  if (!isValidAuditAnswers(body.answers)) return null;
  if (body.firstName !== undefined && (typeof body.firstName !== "string" || body.firstName.length > 100)) return null;
  const rawAttribution = body.attribution && typeof body.attribution === "object" ? body.attribution as Record<string, unknown> : {};
  const attribution: AuditLeadPayload["attribution"] = {};
  for (const key of ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm", "referrer", "landingPath"] as const) {
    const item = rawAttribution[key];
    if (typeof item === "string" && item.length <= 1000) attribution[key] = item;
  }
  Object.assign(attribution,normalizeAttribution(Object.fromEntries(attributionFields.map(key=>[key,rawAttribution[key]]))));
  return { firstName: typeof body.firstName === "string" && body.firstName.trim() ? body.firstName.trim() : undefined, workEmail: body.workEmail.trim().toLowerCase(), companyWebsite, diagnosis: body.diagnosis as DiagnosisType, signals: body.signals as AuditSignal[], answers: body.answers, attribution };
}
export function hasAuditProxyConfiguration(url?: string, secret?: string) {
  if (!url || !secret || secret.length < 32 || secret.length > 256 || /\s/.test(secret)) return false;
  try {
    const destination = new URL(url);
    return destination.protocol === "https:"
      && Boolean(destination.hostname.includes("."))
      && !destination.username && !destination.password && !destination.port
      && destination.pathname === "/api/marketing/audit-lead/ingest"
      && !destination.search && !destination.hash;
  } catch { return false; }
}
