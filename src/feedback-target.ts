const PRODUCTION_BRAND_BRAIN_REF = "campgoqhyvniokwvjvtb";
const EXCLUDED_AFFILIATE_SANDBOX_REF = "kutkuprsehzxmbwasirw";

/**
 * Fail closed: a preview can use only an explicitly configured isolated branch.
 * A production release needs an additional server-side approval switch.
 * No secrets or project IDs come from visitors.
 */
export function chooseFeedbackDatabase(
  projectRef: string | undefined,
  vercelEnv: string | undefined,
  productionReleaseApproved: string | undefined,
): string | null {
  if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef)) return null;
  if (projectRef === EXCLUDED_AFFILIATE_SANDBOX_REF) return null;
  if (vercelEnv === "production") {
    if (projectRef !== PRODUCTION_BRAND_BRAIN_REF || productionReleaseApproved !== "true") return null;
  } else if (projectRef === PRODUCTION_BRAND_BRAIN_REF) {
    // Never let a Preview or Development environment write to Brand Brain production.
    return null;
  }
  return `https://${projectRef}.supabase.co/rest/v1/rpc/accept_website_feedback`;
}
