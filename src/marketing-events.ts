import type { AuditLeadPayload, DiagnosisType } from "./audit";

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

type PixelFunction = ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean; version?: string };
type TikTokQueue = unknown[] & {
  page?: (...args: unknown[]) => void;
  track?: (...args: unknown[]) => void;
  load?: (id: string) => void;
  methods?: string[];
  _i?: Record<string, unknown[]>;
  _o?: Record<string, unknown>;
  _t?: Record<string, number>;
};
type MarketingWindow = Window & { fbq?: PixelFunction; _fbq?: PixelFunction; ttq?: TikTokQueue; TiktokAnalyticsObject?: string; __frameLeadsPixelIds?: Set<string> };

function browserWindow(): MarketingWindow | null {
  return typeof window === "undefined" ? null : window as MarketingWindow;
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

function ensureMetaPixel(pixelId: string, currentWindow: MarketingWindow) {
  const pixel = currentWindow.fbq ?? Object.assign((...args: unknown[]) => {
    const queue = currentWindow.fbq?.queue;
    queue?.push(args);
  }, { queue: [] as unknown[][], loaded: true, version: "2.0" }) as PixelFunction;
  currentWindow.fbq = pixel;
  currentWindow._fbq = pixel;
  if (!document.getElementById("frameleads-meta-pixel")) {
    const script = document.createElement("script");
    script.id = "frameleads-meta-pixel";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  pixel("init", pixelId);
}

function ensureTikTokPixel(pixelId: string, currentWindow: MarketingWindow) {
  const ttq = currentWindow.ttq ?? [] as unknown as TikTokQueue;
  currentWindow.ttq = ttq;
  currentWindow.TiktokAnalyticsObject = "ttq";
  ttq.methods ??= ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  for (const method of ttq.methods) {
    const queueMethod = ttq as unknown as Record<string, unknown>;
    if (!queueMethod[method]) queueMethod[method] = (...args: unknown[]) => ttq.push([method, ...args]);
  }
  ttq.page ??= (...args: unknown[]) => { ttq.push(["page", ...args]); };
  ttq.track ??= (...args: unknown[]) => { ttq.push(["track", ...args]); };
  ttq.load ??= (id: string) => {
    if (document.getElementById("frameleads-tiktok-pixel")) return;
    ttq._i ??= {};
    ttq._i[id] = [];
    ttq._o ??= {};
    ttq._o[id] = {};
    ttq._t ??= {};
    ttq._t[id] = Date.now();
    const script = document.createElement("script");
    script.id = "frameleads-tiktok-pixel";
    script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`;
    document.head.appendChild(script);
  };
  ttq.load(pixelId);
}

export function initializeMarketingPixels(): void {
  const currentWindow = browserWindow();
  if (!currentWindow) return;
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim();
  const configured = [metaId && `meta:${metaId}`, tiktokId && `tiktok:${tiktokId}`].filter((value): value is string => Boolean(value));
  if (!configured.length) return;
  currentWindow.__frameLeadsPixelIds ??= new Set();

  if (metaId && !currentWindow.__frameLeadsPixelIds.has(`meta:${metaId}`)) {
    ensureMetaPixel(metaId, currentWindow);
    currentWindow.__frameLeadsPixelIds.add(`meta:${metaId}`);
  }
  if (tiktokId && !currentWindow.__frameLeadsPixelIds.has(`tiktok:${tiktokId}`)) {
    ensureTikTokPixel(tiktokId, currentWindow);
    currentWindow.__frameLeadsPixelIds.add(`tiktok:${tiktokId}`);
  }
}

const metaEventMap: Record<MarketingEventName, { method: "track" | "trackCustom"; name: string }> = {
  LANDING_VIEW: { method: "track", name: "PageView" },
  AUDIT_STARTED: { method: "trackCustom", name: "AuditStarted" },
  AUDIT_COMPLETED: { method: "trackCustom", name: "AuditCompleted" },
  LEAD_CAPTURED: { method: "track", name: "Lead" },
  WORKFLOW_MAP_VIEWED: { method: "trackCustom", name: "WorkflowMapViewed" },
  PRODUCT_PROOF_VIEWED: { method: "track", name: "ViewContent" },
  PRICING_VIEWED: { method: "track", name: "ViewContent" },
  CORE_CHECKOUT_STARTED: { method: "track", name: "InitiateCheckout" },
  ENTERPRISE_CHECKOUT_STARTED: { method: "track", name: "InitiateCheckout" },
  PARTNER_LINK_CLICKED: { method: "trackCustom", name: "PartnerLinkClicked" },
};

export function trackMarketingEvent(name: MarketingEventName, input: MarketingEventProperties = {}): void {
  const currentWindow = browserWindow();
  if (!currentWindow) return;
  const properties = pixelProperties(input as Record<string, unknown>);
  const event: MarketingEvent = { event: name, properties };
  currentWindow.dispatchEvent(new CustomEvent<MarketingEvent>("frameleads:marketing-event", { detail: event }));

  const meta = currentWindow.fbq;
  if (meta) {
    const mapped = metaEventMap[name];
    meta(mapped.method, mapped.name, properties);
  }
  const tiktok = currentWindow.ttq;
  if (name === "LANDING_VIEW") tiktok?.page?.();
  else if (tiktok?.track) tiktok.track(name, properties);
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
