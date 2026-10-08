import type { AuditLeadPayload, DiagnosisType } from "./audit";
import {initializeMeasurementPixels} from './measurement.ts';

export const marketingEventNames = [
  "LANDING_VIEW",
  "AUDIT_STARTED",
  "AUDIT_COMPLETED",
  "LEAD_CAPTURED",
  "WORKFLOW_MAP_VIEWED",
  "PRODUCT_PROOF_VIEWED",
  "PRICING_VIEWED",
  "CORE_CHECKOUT_STARTED",
  "ENTERPRISE_CHECKOUT_STARTED",
  "PARTNER_LINK_CLICKED",
] as const;

export type MarketingEventName = (typeof marketingEventNames)[number];
export type MarketingSource = "HERO" | "NAVBAR" | "PROBLEM" | "FINAL_CTA" | "REPLY_WORKFLOW_AUDIT" | "PRICING" | "FOOTER" | "VSL" | "PRODUCT_PROOF";
export type MarketingPlan = "CORE" | "ENTERPRISE";
export type MarketingAttribution = NonNullable<AuditLeadPayload["attribution"]>;

export type MarketingEventProperties = {
  diagnosis?: DiagnosisType;
  source?: MarketingSource;
  attribution?: MarketingAttribution;
  landingPath?: string;
  plan?: MarketingPlan;
};

export type MarketingEvent = {
  event: MarketingEventName;
  properties: MarketingEventProperties;
};

const attributionStorageKey = "frameleads:marketing-attribution:v1";
const eventStoragePrefix = "frameleads:marketing-event:v1:";
const trackedInMemory = new Set<string>();
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const attributionKeys = ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm", "referrer", "landingPath"] as const;

function browserWindow(): Window | null {
  return typeof window === "undefined" ? null : window;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().slice(0, 1000);
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(cleaned)) return undefined;
  return cleaned || undefined;
}

function safeReferrer(referrer: string): string | undefined {
  try {
    const url = new URL(referrer);
    return url.origin.slice(0, 1000);
  } catch {
    return undefined;
  }
}

export function mergeMarketingAttribution(
  existing: MarketingAttribution,
  incoming: MarketingAttribution,
): MarketingAttribution {
  const merged: MarketingAttribution = { ...existing };
  for (const key of attributionKeys) {
    const value = cleanString(incoming[key]);
    if (!cleanString(merged[key]) && value) merged[key] = value;
  }
  return merged;
}

export function captureMarketingAttribution(): MarketingAttribution {
  const currentWindow = browserWindow();
  if (!currentWindow) return {};

  let existing: MarketingAttribution = {};
  try {
    const saved = currentWindow.sessionStorage.getItem(attributionStorageKey);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (parsed && typeof parsed === "object") existing = parsed as MarketingAttribution;
    }
  } catch {
    // Storage may be unavailable in private browsing; the current URL still works.
  }

  const params = new URLSearchParams(currentWindow.location.search);
  const incoming: MarketingAttribution = { landingPath: currentWindow.location.pathname };
  const mapping = {
    utm_source: "utmSource",
    utm_medium: "utmMedium",
    utm_campaign: "utmCampaign",
    utm_content: "utmContent",
    utm_term: "utmTerm",
  } as const;
  for (const key of utmKeys) incoming[mapping[key]] = cleanString(params.get(key));
  incoming.referrer = safeReferrer(currentWindow.document.referrer);

  const merged = mergeMarketingAttribution(existing, incoming);
  try {
    currentWindow.sessionStorage.setItem(attributionStorageKey, JSON.stringify(merged));
  } catch {
    // Attribution remains available for this page even if session storage is blocked.
  }
  return merged;
}

export function getMarketingAttribution(): MarketingAttribution {
  return captureMarketingAttribution();
}

export function sanitizeMarketingEventProperties(input: Record<string, unknown>): MarketingEventProperties {
  const properties: MarketingEventProperties = {};
  const sources: MarketingSource[] = ["HERO", "NAVBAR", "PROBLEM", "FINAL_CTA", "REPLY_WORKFLOW_AUDIT", "PRICING", "FOOTER", "VSL", "PRODUCT_PROOF"];
  if (typeof input.diagnosis === "string" && ["LOW_CURRENT_PRESSURE", "FOUNDER_DECISION_BOTTLENECK", "FRAGMENTED_REPLY_WORKFLOW", "UNCONTROLLED_AUTOMATION", "HIGH_CONSEQUENCE_DECISION_WORKFLOW"].includes(input.diagnosis)) {
    properties.diagnosis = input.diagnosis as DiagnosisType;
  }
  if (typeof input.source === "string" && sources.includes(input.source as MarketingSource)) properties.source = input.source as MarketingSource;
  if (input.plan === "CORE" || input.plan === "ENTERPRISE") properties.plan = input.plan;
  const landingPath = cleanString(input.landingPath);
  if (landingPath?.startsWith("/") && !landingPath.startsWith("//")) {
    const path = landingPath.split(/[?#]/, 1)[0];
    properties.landingPath = /[^\s/@]+@[^\s/]+\.[^\s/]+/.test(path) ? "/" : path;
  }

  if (input.attribution && typeof input.attribution === "object") {
    const raw = input.attribution as Record<string, unknown>;
    const attribution: MarketingAttribution = {};
    for (const key of attributionKeys) {
      const value = cleanString(raw[key]);
      if (!value) continue;
      attribution[key] = key === "landingPath" ? value.split(/[?#]/, 1)[0] : key === "referrer" ? safeReferrer(value) : value;
    }
    if (Object.keys(attribution).length) properties.attribution = attribution;
  }
  return properties;
}

function currentLandingPath(): string | undefined {
  const currentWindow = browserWindow();
  return currentWindow ? currentWindow.location.pathname : undefined;
}

function pixelProperties(properties: MarketingEventProperties) {
  return sanitizeMarketingEventProperties({ ...properties, landingPath: properties.landingPath ?? currentLandingPath(), attribution: properties.attribution ?? getMarketingAttribution() });
}

export function initializeMarketingPixels(): void {
  initializeMeasurementPixels();
}

export function trackMarketingEvent(name: MarketingEventName, input: MarketingEventProperties = {}): void {
  const currentWindow = browserWindow();
  if (!currentWindow) return;
  const properties = pixelProperties(input as Record<string, unknown>);
  const event: MarketingEvent = { event: name, properties };
  currentWindow.dispatchEvent(new CustomEvent<MarketingEvent>("frameleads:marketing-event", { detail: event }));

  // Legacy UI notifications are not provider lifecycle authority. B7.1 emits
  // explicitly mapped observations and canonical server conversions separately.
}

export function trackMarketingEventOncePerSession(name: MarketingEventName, properties: MarketingEventProperties = {}): boolean {
  const currentWindow = browserWindow();
  if (!currentWindow) return false;
  const key = `${eventStoragePrefix}${name}`;
  if (trackedInMemory.has(key)) return false;
  try {
    if (currentWindow.sessionStorage.getItem(key)) return false;
    currentWindow.sessionStorage.setItem(key, "true");
  } catch {
    // The in-memory guard below still avoids same-page duplicate events.
  }
  trackedInMemory.add(key);
  trackMarketingEvent(name, properties);
  return true;
}

export function trackLeadCaptureIfSuccessful(success: boolean, properties: MarketingEventProperties = {}): boolean {
  if (!success) return false;
  trackMarketingEvent("LEAD_CAPTURED", properties);
  return true;
}
