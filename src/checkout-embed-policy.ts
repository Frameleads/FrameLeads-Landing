/** Whop owns the amount, collection, subscription and cancellation. */
export type CheckoutTier = "micro-pilot" | "core" | "enterprise";
export const WHOP_EMBED_LOADER = "https://js.whop.com/static/checkout/loader.js";
export const WHOP_CHECKOUT_RETURN_URL = "https://app.frameleads.io/login?source=whop-checkout";
export const WHOP_SANDBOX_RETURN_URL_ENV = "FRAMELEADS_WHOP_SANDBOX_RETURN_URL";

/** Never silently strip a partner who received explicit affiliate consent.
 * Native affiliate payments require a server-issued, provider-confirmed
 * checkout configuration; neither raw ?a= nor advertising consent proves it.
 */
export type ReferralCheckoutDecision = "pending" | "hosted" | "await_verified" | "allowed";
export function referralCheckoutDecision(input: {
  rawReferralPresent: boolean;
  advertisingConsent: boolean | null;
  affiliateConsent?: boolean;
}): ReferralCheckoutDecision {
  if (!input.rawReferralPresent) return "allowed";
  if (input.advertisingConsent === null) return "pending";
  // An explicitly consenting, attributed visitor must never land on a
  // generic Whop plan checkout that cannot pay the partner.
  if (input.affiliateConsent === true) return "await_verified";
  // Nonconsenting buyers retain the ordinary purchase option and have no
  // promise of affiliate attribution.
  return "hosted";
}

const tiers = {
  "micro-pilot": {
    title: "FrameLeads Micro-Pilot",
    description: "A one-time offer capped at 25 total prospects, with existing Micro-Pilot access and feature limits.",
    displayedPrice: "$10",
    billingInterval: "one-time",
    recurring: false,
    // This legacy quota field mirrors SaaS membership data; buyer-facing copy
    // says total because SaaS tracks persistent account usage without a reset.
    monthlyQuota: 25,
    usageLabel: "25 total prospects",
    hostedCheckout: "https://whop.com/checkout/plan_8qLWfJZHQUYZf",
    productionPlanId: "plan_8qLWfJZHQUYZf",
    planEnvironmentVariable: "WHOP_MICRO_PLAN_ID",
    sandboxPlanEnvironmentVariable: "WHOP_MICRO_SANDBOX_PLAN_ID",
    sandboxCheckoutEnvironmentVariable: "WHOP_MICRO_SANDBOX_CHECKOUT_URL",
    benefits: ["25 total prospects", "One-time purchase", "Existing Micro-Pilot access and usage limits"],
  },
  core: {
    title: "FrameLeads Core",
    description: "For founder-led and smaller outbound teams.",
    displayedPrice: "$149",
    billingInterval: "month",
    recurring: true,
    monthlyQuota: 500,
    usageLabel: "500 prospects per month",
    hostedCheckout: "https://whop.com/checkout/plan_GQTDPXnvijugf",
    productionPlanId: "plan_GQTDPXnvijugf",
    planEnvironmentVariable: "WHOP_CORE_PLAN_ID",
    sandboxPlanEnvironmentVariable: "WHOP_CORE_SANDBOX_PLAN_ID",
    sandboxCheckoutEnvironmentVariable: "WHOP_CORE_SANDBOX_CHECKOUT_URL",
    benefits: ["Reply intelligence and routing", "Governed execution", "Escalation for consequential decisions"],
  },
  enterprise: {
    title: "FrameLeads Enterprise",
    description: "For higher-volume and more complex outbound operations.",
    displayedPrice: "$499",
    billingInterval: "month",
    recurring: true,
    monthlyQuota: 10_000,
    usageLabel: "10,000 prospects per month",
    hostedCheckout: "https://whop.com/checkout/plan_uGDGf5WKW7hlE",
    productionPlanId: "plan_uGDGf5WKW7hlE",
    planEnvironmentVariable: "WHOP_ENTERPRISE_PLAN_ID",
    sandboxPlanEnvironmentVariable: "WHOP_ENTERPRISE_SANDBOX_PLAN_ID",
    sandboxCheckoutEnvironmentVariable: "WHOP_ENTERPRISE_SANDBOX_CHECKOUT_URL",
    benefits: ["Higher-volume decision orchestration", "Advanced governance and routing", "Human approvals for important exceptions"],
  },
} as const;

// Historical Core/Enterprise plans remain valid for SaaS entitlement checks,
// but must never be selected for new Landing purchases or Sandbox previews.
const liveOrRetiredProductionPlanIds = new Set([
  "plan_8qLWfJZHQUYZf",
  "plan_GQTDPXnvijugf",
  "plan_uGDGf5WKW7hlE",
  "plan_sAEhr77rTrhX4",
  "plan_jdy5Z44fMKMAz",
]);

export function checkoutTier(value: string): value is CheckoutTier {
  return value === "micro-pilot" || value === "core" || value === "enterprise";
}

export function tierInformation(tier: CheckoutTier) {
  return tiers[tier];
}

export type EmbedPolicy = {
  available: boolean;
  reason?: "disabled" | "preview_only" | "wrong_environment" | "plan_unverified" | "terms_unverified" | "sandbox_unconfigured" | "sandbox_terms_unverified";
  environment?: "production" | "sandbox";
  planId?: string;
  returnUrl?: string;
  hostedFallback?: string;
};

function safeSandboxReturnUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".vercel.app") || url.pathname !== "/login" ||
      url.searchParams.size !== 1 || url.searchParams.get("source") !== "whop-checkout" || url.hash || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function safeSandboxCheckoutUrl(value: string | undefined, planId: string | undefined): string | undefined {
  if (!value || !planId || !/^plan_[A-Za-z0-9]+$/.test(planId)) return undefined;
  try {
    const url = new URL(value);
    const whopHost = url.hostname === "whop.com" || url.hostname.endsWith(".whop.com");
    if (url.protocol !== "https:" || !whopHost || url.pathname !== `/checkout/${planId}` || url.search || url.hash || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Production embed stays dark unless the production switch, live Whop
 * environment, and exact tier plan ID are all explicitly configured. Preview
 * deployments never render production payment forms.
 */
export function embeddedCheckoutPolicy(tier: CheckoutTier, values: Record<string, string | undefined>): EmbedPolicy {
  const information = tierInformation(tier);

  if (values.VERCEL_ENV === "preview") {
    const returnUrl = safeSandboxReturnUrl(values[WHOP_SANDBOX_RETURN_URL_ENV]);
    const planId = values[information.sandboxPlanEnvironmentVariable];
    const sandboxTiers = Object.values(tiers).map(item => {
      const sandboxPlanId = values[item.sandboxPlanEnvironmentVariable];
      return {
        planId: sandboxPlanId,
        hostedFallback: safeSandboxCheckoutUrl(values[item.sandboxCheckoutEnvironmentVariable], sandboxPlanId),
      };
    });
    const companyId = values.WHOP_SANDBOX_COMPANY_ID;
    const sandboxPlanIds = sandboxTiers.map(item => item.planId);
    const allSandboxPlansReady = sandboxTiers.every(item => Boolean(item.planId && item.hostedFallback)) &&
      sandboxPlanIds.every(id => Boolean(id && /^plan_[A-Za-z0-9]+$/.test(id) && !liveOrRetiredProductionPlanIds.has(id))) &&
      new Set(sandboxPlanIds).size === sandboxPlanIds.length;
    const sandboxConfigured = values.WHOP_ENVIRONMENT === "sandbox" &&
      Boolean(companyId && /^biz_[A-Za-z0-9]+$/.test(companyId)) &&
      allSandboxPlansReady && Boolean(returnUrl);
    if (!sandboxConfigured) {
      return {
        available: false,
        reason: "sandbox_unconfigured",
        environment: "sandbox",
        ...(returnUrl ? { returnUrl } : {}),
      };
    }
    if (values.FRAMELEADS_WHOP_SANDBOX_PLAN_TERMS_VERIFIED !== "true") {
      return { available: false, reason: "sandbox_terms_unverified", environment: "sandbox", returnUrl };
    }
    // The official Whop Sandbox embed can reject a valid hosted plan. Keep
    // the verified, provider-owned hosted flow available when iframe testing
    // is paused; never substitute production plans for Sandbox checkouts.
    const hostedFallback = sandboxTiers.find(item => item.planId === planId)!.hostedFallback!;
    if (values.FRAMELEADS_WHOP_SANDBOX_CHECKOUT_ENABLED !== "true") {
      return { available: false, reason: "disabled", environment: "sandbox", returnUrl, hostedFallback };
    }
    return {
      available: true,
      environment: "sandbox",
      planId: planId!,
      returnUrl,
      hostedFallback,
    };
  }

  // A requested Sandbox mode must never fall back to production plan URLs.
  if (values.WHOP_ENVIRONMENT === "sandbox") {
    return values.VERCEL_ENV === "production"
      ? { available: false, reason: "wrong_environment" }
      : { available: false, reason: "preview_only" };
  }

  // Local and other nonproduction contexts never get live hosted checkout URLs.
  if (values.VERCEL_ENV !== "production") return { available: false, reason: "preview_only" };

  // Keep the existing production hosted fallback while the native form is gated.
  const productionFallback = {
    environment: "production" as const,
    hostedFallback: information.hostedCheckout,
    returnUrl: WHOP_CHECKOUT_RETURN_URL,
  };
  if (values.FRAMELEADS_WHOP_NATIVE_CHECKOUT_ENABLED !== "true") return { available: false, reason: "disabled", ...productionFallback };
  if (values.WHOP_ENVIRONMENT !== "production") return { available: false, reason: "wrong_environment", ...productionFallback };
  if (values.FRAMELEADS_WHOP_PLAN_TERMS_VERIFIED !== "true") return { available: false, reason: "terms_unverified", ...productionFallback };
  if (values[information.planEnvironmentVariable] !== information.productionPlanId) {
    return { available: false, reason: "plan_unverified", ...productionFallback };
  }
  return {
    available: true,
    planId: information.productionPlanId,
    returnUrl: WHOP_CHECKOUT_RETURN_URL,
    hostedFallback: information.hostedCheckout,
    environment: "production",
  };
}
