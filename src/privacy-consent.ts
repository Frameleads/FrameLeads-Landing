export type PrivacyConsent = {
  analytics: boolean;
  advertising: boolean;
  savedAt: string;
};

const storageKey = "frameleads:privacy-consent:v1";
const eventName = "frameleads:privacy-consent-change";
let memoryConsent: PrivacyConsent | null = null;
let cachedStorageValue: string | null | undefined;
let cachedStorageConsent: PrivacyConsent | null = null;

export function getPrivacyConsent(): PrivacyConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === cachedStorageValue) return cachedStorageConsent ?? memoryConsent;
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
          };
          return cachedStorageConsent;
        }
      }
    }
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

export function savePrivacyConsent(preferences: Pick<PrivacyConsent, "analytics" | "advertising">): PrivacyConsent {
  const previous = getPrivacyConsent();
  const next: PrivacyConsent = { ...preferences, savedAt: new Date().toISOString() };
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
  if (previous?.advertising && !next.advertising) {
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
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: next }));
  return next;
}

export function privacyConsentEventName(): string {
  return eventName;
}

export function subscribePrivacyConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(eventName, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(eventName, onChange);
    window.removeEventListener("storage", onChange);
  };
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
