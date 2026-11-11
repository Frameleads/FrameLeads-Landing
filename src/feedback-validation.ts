import { FEEDBACK_REASONS, type FeedbackPlanContext, type FeedbackReason } from "./feedback";

export type ParsedFeedback = {
  reason: FeedbackReason | null;
  optional_message: string | null;
  plan_context: FeedbackPlanContext;
};

const reasonIds = new Set<string>(FEEDBACK_REASONS.map((reason) => reason.id));
const contexts = new Set<string>(["core", "enterprise", "micro_pilot", "general"]);

export function parseFeedbackPayload(value: unknown): ParsedFeedback | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some((key) => !["reason", "optional_message", "plan_context"].includes(key))) return null;
  if (data.reason !== undefined && data.reason !== null && (typeof data.reason !== "string" || !reasonIds.has(data.reason))) return null;
  if (data.optional_message !== undefined && data.optional_message !== null && typeof data.optional_message !== "string") return null;
  if (typeof data.plan_context !== "string" || !contexts.has(data.plan_context)) return null;

  const message = typeof data.optional_message === "string" ? data.optional_message.trim() : "";
  const reason = typeof data.reason === "string" ? data.reason as FeedbackReason : null;
  if (!reason && !message) return null;
  if (message.length > 1200 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) return null;
  return {
    reason,
    optional_message: message || null,
    plan_context: data.plan_context as FeedbackPlanContext,
  };
}

/**
 * The URL path is taken from the same-origin Referer, never from a JSON field.
 * The price-card context is a visitor-provided hint, not a verified identity.
 */
export function deriveFeedbackContext(requestUrl: string, referer: string | null, hinted: FeedbackPlanContext) {
  const origin = new URL(requestUrl).origin;
  let path = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.origin === origin && /^\/[a-zA-Z0-9/_-]*$/.test(url.pathname) && url.pathname.length <= 160) path = url.pathname;
    } catch { /* fall back to the homepage; never store full referrers */ }
  }
  const checkout = /^\/checkout\/(core|enterprise|micro-pilot)\/?$/.exec(path);
  const plan_context: FeedbackPlanContext = checkout
    ? checkout[1] === "micro-pilot" ? "micro_pilot" : checkout[1] as FeedbackPlanContext
    : path === "/" ? hinted : "general";
  return { source_page: path, plan_context };
}
