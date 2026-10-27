import type { AuditLeadPayload } from "./audit.ts";

export const advertisingAttributionKeys = ["fbp", "fbc", "fbclid", "ttp", "ttclid", "affiliateCode"] as const;

/** Consent is consumed at the public boundary, never forwarded as an unsupported upstream field. */
export function captureAttribution(payload: AuditLeadPayload, advertising: boolean, affiliateReferralApproved = false): AuditLeadPayload {
  const attribution = { ...payload.attribution };
  if (!advertising) for (const key of advertisingAttributionKeys) delete attribution[key];
  if (!affiliateReferralApproved) delete attribution.affiliateCode;
  return { ...payload, attribution };
}

/** Brand Brain's existing canonical Meta Lead projector requires original website context.
 * Omitting this context makes a capture ineligible for Meta Lead projection.
 */
export function metaCaptureHeaders(request: Request, advertising: boolean): Record<string, string> {
  if (!advertising) return {};
  const agent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  if (!agent?.trim() || agent.length > 1024 || /[\u0000-\u001f\u007f]/.test(agent) || !referer) return {};
  try {
    const page = new URL(referer);
    if (page.origin !== "https://frameleads.io" || page.origin !== new URL(request.url).origin || page.username || page.password
      || page.pathname.length > 512 || /@|%40|[\u0000-\u001f\u007f]/i.test(page.pathname)) return {};
    return { "user-agent": agent, referer: page.origin + page.pathname };
  } catch { return {}; }
}
