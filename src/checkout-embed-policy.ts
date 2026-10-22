/**
 * Nonproduction embedded-checkout policy. No browser-supplied plan, affiliate or
 * checkout configuration is trusted. Whop remains the payment authority.
 *
 * IMPORTANT: The production release gate is intentionally not implemented.
 * Immediate and delayed affiliate attribution require the separately reviewed
 * server-side consent/attribution contract before launch.
 */
export type CheckoutTier = "core" | "enterprise";

export const WHOP_EMBED_LOADER = "https://js.whop.com/static/checkout/loader.js";

const tiers = {
  core: {
    title: "FrameLeads Core",
    description: "For founder-led and smaller outbound teams.",
    displayedPrice: "$147",
    hostedCheckout: "https://whop.com/checkout/plan_sAEhr77rTrhX4",
    productionPlanId: "plan_sAEhr77rTrhX4",
    benefits: ["Reply intelligence and routing", "Governed execution", "Escalation for consequential decisions"],
  },
  enterprise: {
    title: "FrameLeads Enterprise",
    description: "For higher-volume and more complex outbound operations.",
    displayedPrice: "$697",
    hostedCheckout: "https://whop.com/checkout/plan_jdy5Z44fMKMAz",
    productionPlanId: "plan_jdy5Z44fMKMAz",
    benefits: ["Higher-volume decision orchestration", "Advanced governance and routing", "Human approvals for important exceptions"],
  },
} as const;

export function checkoutTier(value: string): value is CheckoutTier {
  return value === "core" || value === "enterprise";
}

export function tierInformation(tier: CheckoutTier) {
  return tiers[tier];
}

export type EmbedPolicy =
  | { available: false; reason: "disabled" | "production_not_approved" | "wrong_environment" | "sandbox_plan_missing" | "sandbox_unconfigured" }
  | { available: true; environment: "sandbox"; planId: string; returnUrl: string; hostedFallback: null };

const SANDBOX_CORE_PLAN = "plan_kgrX8LpuAH2Ba";

/**
 * Only the confirmed disposable Sandbox Core identity may become a payable
 * embed in this change. This deliberately cannot create production payments.
 * The existing main-site hosted checkout links stay unchanged.
 */
export function embeddedCheckoutPolicy(tier: CheckoutTier, values: Record<string, string | undefined>): EmbedPolicy {
  if (values.FRAMELEADS_EMBEDDED_CHECKOUT_ENABLED !== "true") return { available: false, reason: "disabled" };
  if (values.VERCEL_ENV === "production") return { available: false, reason: "production_not_approved" };
  if (values.WHOP_ENVIRONMENT !== "sandbox") return { available: false, reason: "wrong_environment" };
  if (tier !== "core") return { available: false, reason: "sandbox_plan_missing" };
  if (values.WHOP_SANDBOX_CORE_PLAN_ID !== SANDBOX_CORE_PLAN
    || values.WHOP_SANDBOX_ACCOUNT_ID !== "biz_6YudF3G7nc8Wdw"
    || values.WHOP_SANDBOX_PRODUCT_ID !== "prod_2RDEl6d8jhM9W") {
    return { available: false, reason: "sandbox_unconfigured" };
  }
  let returnUrl: URL;
  try { returnUrl = new URL(values.WHOP_SANDBOX_RETURN_URL ?? ""); }
  catch { return { available: false, reason: "sandbox_unconfigured" }; }
  if (returnUrl.protocol !== "https:" || returnUrl.username || returnUrl.password || returnUrl.search || returnUrl.hash
    || returnUrl.pathname !== "/checkout/complete"
    || returnUrl.hostname === "frameleads.io" || returnUrl.hostname.endsWith(".frameleads.io")) {
    return { available: false, reason: "sandbox_unconfigured" };
  }
  return { available: true, environment: "sandbox", planId: SANDBOX_CORE_PLAN, returnUrl: returnUrl.toString(), hostedFallback: null };
}
