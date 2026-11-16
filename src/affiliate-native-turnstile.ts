/** Production-only affiliate signup anti-abuse checks.
 * These functions fail closed and do not log visitor addresses or challenge tokens.
 * Cloudflare Turnstile tokens are single-use and expire after five minutes.
 */
export const AFFILIATE_TURNSTILE_ACTION = "affiliate_signup";
export const AFFILIATE_PUBLIC_HOSTNAME = "frameleads.io";

export function validAffiliatePublicOrigin(request: Request): boolean {
  const target = new URL(request.url);
  // www.frameleads.io redirects to the apex host at the Vercel project level.
  // Always refuse noncanonical hostnames for a production write.
  return target.protocol === "https:" && target.hostname === AFFILIATE_PUBLIC_HOSTNAME &&
    !target.username && !target.password;
}

export async function verifyAffiliateTurnstile(
  token: string,
  secret: string,
  expectedHostname = AFFILIATE_PUBLIC_HOSTNAME,
  send: typeof fetch = fetch,
): Promise<boolean> {
  if (!secret || typeof token !== "string" || token.length < 10 || token.length > 2048 ||
      expectedHostname !== AFFILIATE_PUBLIC_HOSTNAME) return false;
  try {
    const response = await send("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(9000),
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!response.ok) return false;
    const json: unknown = await response.json();
    if (!json || typeof json !== "object" || Array.isArray(json)) return false;
    const validation = json as Record<string,unknown>;
    // A successful token solved on another domain or for another flow is
    // never sufficient to authorize affiliate registration.
    return validation.success === true &&
      validation.hostname === expectedHostname &&
      validation.action === AFFILIATE_TURNSTILE_ACTION;
  } catch {
    return false;
  }
}
