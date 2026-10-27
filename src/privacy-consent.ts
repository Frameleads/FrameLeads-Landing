export type PrivacyConsent = {
  analytics: boolean;
  advertising: boolean;
  savedAt: string;
  /** New consent notice decisions never inherit an older advertising choice. */
  affiliateNoticeAcceptedVersion?: string;
  affiliateNoticeDeclinedVersion?: string;
};

const storageKey = "frameleads:privacy-consent:v1";

/** Only an explicitly approved, versioned notice can qualify new affiliate consent. */
export function currentAffiliateNoticeVersion(): string | null {
  if (process.env.NEXT_PUBLIC_AFFILIATE_REFERRAL_PRIVACY_APPROVED !== "true") return null;
  const version = process.env.NEXT_PUBLIC_AFFILIATE_CONSENT_NOTICE_VERSION;
  return version && /^[A-Za-z0-9][A-Za-z0-9._-]{3,79}$/.test(version) ? version : null;
}

export function hasCurrentAffiliateNoticeConsent(value: PrivacyConsent | null): boolean {
  const version = currentAffiliateNoticeVersion();
  return Boolean(version && value?.advertising === true && value.affiliateNoticeAcceptedVersion === version);
}

/** Existing old advertising preferences may stay active but cannot transfer to the new purpose. */
export function requiresAffiliateNoticeChoice(value: PrivacyConsent | null): boolean {
  const version = currentAffiliateNoticeVersion();
  return Boolean(version && value?.advertising === true && value.affiliateNoticeAcceptedVersion !== version
    && value.affiliateNoticeDeclinedVersion !== version);
}

const eventName = "frameleads:privacy-consent-change";
const attributionStorageKey = "frameleads:marketing-attribution:v1";
let memoryConsent: PrivacyConsent | null = null;
let cachedStorageValue: string | null | undefined;
let cachedStorageConsent: PrivacyConsent | null = null;
let affiliateCaptureBlockedForCurrentPage = false;
const blockedAffiliateCodes = new Set<string>();

export function getPrivacyConsent(): PrivacyConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === cachedStorageValue) return cachedStorageConsent ?? memoryConsent;
    const previousStoredValue = cachedStorageValue;
    cachedStorageValue = stored;
    cachedStorageConsent = null;
    if (stored) {
      const value: unknown = JSON.parse(stored);
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record.analytics === "boolean" && typeof record.advertising === "boolean") {
          cachedStorageConsent = memoryConsent = {
            analytics: record.analytics,
            advertising: record.advertising,
            savedAt: typeof record.savedAt === "string" ? record.savedAt : "",
            affiliateNoticeAcceptedVersion: typeof record.affiliateNoticeAcceptedVersion === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{3,79}$/.test(record.affiliateNoticeAcceptedVersion) ? record.affiliateNoticeAcceptedVersion : undefined,
            affiliateNoticeDeclinedVersion: typeof record.affiliateNoticeDeclinedVersion === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{3,79}$/.test(record.affiliateNoticeDeclinedVersion) ? record.affiliateNoticeDeclinedVersion : undefined,
          };
          return cachedStorageConsent;
        }
      }
    }
    if (!stored && previousStoredValue) memoryConsent = null;
    return memoryConsent;
  } catch {
    // Memory state keeps the current choice effective when browser storage is unavailable.
  }
  return memoryConsent;
}

export function hasAnalyticsConsent(): boolean {
  return getPrivacyConsent()?.analytics === true;
}

export function hasAdvertisingConsent(): boolean {
  return getPrivacyConsent()?.advertising === true;
}

export function savePrivacyConsent(
  preferences: Pick<PrivacyConsent, "analytics" | "advertising">,
  affiliateChoice: "accept" | "decline" = "accept",
): PrivacyConsent {
  const previous = getPrivacyConsent();
  const version = currentAffiliateNoticeVersion();
  const next: PrivacyConsent = { ...preferences, savedAt: new Date().toISOString(),
    ...(version && preferences.advertising && affiliateChoice === "accept" ? { affiliateNoticeAcceptedVersion: version } : {}),
    ...(version && preferences.advertising && affiliateChoice === "decline" ? { affiliateNoticeDeclinedVersion: version } : {}),
  };
  memoryConsent = next;
  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(storageKey, serialized);
    cachedStorageValue = serialized;
    cachedStorageConsent = next;
  } catch {
    // The decision remains in memory for this page when persistent storage is blocked.
  }

  if (previous?.analytics && !next.analytics) {
    try {
      window.localStorage.removeItem("frameleads:b71:anonymous");
      window.sessionStorage.removeItem("frameleads:b71:session");
      window.sessionStorage.removeItem("frameleads:marketing-attribution:v1");
    } catch {
      // Clearing optional identifiers is best effort when storage is blocked.
    }
  }
  if (!next.advertising) {
    clearAdvertisingAttribution();
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: next }));
  return next;
}

export function privacyConsentEventName(): string {
  return eventName;
}

export function subscribePrivacyConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      let advertising = false;
      let currentAffiliateNotice = false;
      try {
        const value: unknown = event.newValue ? JSON.parse(event.newValue) : null;
        advertising = Boolean(value && typeof value === "object" && (value as Record<string, unknown>).advertising === true);
        currentAffiliateNotice = Boolean(advertising && currentAffiliateNoticeVersion()
          && value && typeof value === "object"
          && (value as Record<string, unknown>).affiliateNoticeAcceptedVersion === currentAffiliateNoticeVersion());
      } catch {
        // An unreadable changed preference fails closed for referral capture.
      }
      if (!advertising) clearAdvertisingAttribution();
      else if (!currentAffiliateNotice) clearAffiliateReferralForOutdatedNotice();
    }
    onChange();
  };
  window.addEventListener(eventName, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(eventName, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Used by attribution capture to fail closed if the current URL could not be scrubbed. */
export function isAffiliateCaptureBlockedForCurrentPage(code?: string): boolean {
  return affiliateCaptureBlockedForCurrentPage && (!code || blockedAffiliateCodes.has(code));
}

function clearAdvertisingAttribution(): void {
  affiliateCaptureBlockedForCurrentPage = true;
  clearAdvertisingCookies();
  try {
    const saved = window.sessionStorage.getItem("frameleads:b71:session");
    if (saved) {
      const session = JSON.parse(saved) as { attribution?: Record<string, unknown> };
      if (session.attribution) {
        delete session.attribution.fbp;
        delete session.attribution.fbc;
        delete session.attribution.ttp;
        window.sessionStorage.setItem("frameleads:b71:session", JSON.stringify(session));
      }
    }
  } catch {
    // Removing optional ad identifiers is best effort when storage is blocked.
  }
  discardAffiliateReferral();
}

/** Invalidate a referral under an obsolete notice, without treating it as a withdrawal. */
function clearAffiliateReferralForOutdatedNotice(): void {
  try {
    const saved = window.sessionStorage.getItem(attributionStorageKey);
    if (!saved) return;
    const attribution: unknown = JSON.parse(saved);
    if (!attribution || typeof attribution !== "object" || Array.isArray(attribution)) return;
    const next = { ...(attribution as Record<string, unknown>) };
    delete next.affiliateCode;
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(next));
  } catch { /* Unavailable storage does not create a referral. */ }
}

/** Remove prior referral evidence from this tab without touching permitted analytics fields. */
export function discardAffiliateReferral(): void {
  affiliateCaptureBlockedForCurrentPage = true;
  clearStoredAffiliateReferral();
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("a")) {
      const code = url.searchParams.get("a");
      if (code) blockedAffiliateCodes.add(code);
      url.searchParams.delete("a");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  } catch {
    // Keep affiliate recapture blocked for this page if the old URL cannot be removed.
  }
}

/** Clear stored referral data without blocking a still-undecided URL referral. */
export function clearStoredAffiliateReferral(): void {
  try {
    const saved = window.sessionStorage.getItem(attributionStorageKey);
    if (saved) {
      const attribution: unknown = JSON.parse(saved);
      if (attribution && typeof attribution === "object") {
        const code = (attribution as Record<string, unknown>).affiliateCode;
        if (typeof code === "string") blockedAffiliateCodes.add(code);
        delete (attribution as Record<string, unknown>).affiliateCode;
        window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
      }
    }
  } catch {
    // Unavailable storage never creates or returns affiliate attribution.
  }
}

function clearAdvertisingCookies(): void {
  if (typeof document === "undefined") return;
  for (const name of ["_fbp", "_fbc", "_ttp"]) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    const hostname = window.location.hostname;
    if (hostname === "frameleads.io" || hostname.endsWith(".frameleads.io")) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=frameleads.io; SameSite=Lax`;
    }
  }
}
