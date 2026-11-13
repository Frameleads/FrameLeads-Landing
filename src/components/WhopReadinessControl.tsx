"use client";

import { useState } from "react";

type Check = { label: string; ok: boolean; code: string; reasons?: string[] };
type Catalog = {
  status: "MATCH_FOUND" | "NO_MATCH" | "AMBIGUOUS" | "READ_UNAVAILABLE";
  candidates: { core: string | null; enterprise: string | null };
};
type Result = {
  ok?: boolean;
  code?: string;
  connected?: boolean;
  merchantVerified?: boolean;
  rewardsWriteTested?: false;
  checks?: Check[];
  catalog?: Catalog;
  identity?: {
    status: "MATCHED" | "CONFIGURED_ID_DIFFERS" | "BRANDFLOW_STUDIO_NOT_FOUND" |
      "MULTIPLE_BRANDFLOW_STUDIO_COMPANIES" | "COMPANY_READ_PERMISSION_MISSING" |
      "COMPANY_LOOKUP_BAD_REQUEST" | "COMPANY_LOOKUP_UNAVAILABLE";
    verifiedBusinessId?: string;
  };
};

const reasonLabels: Record<string, string> = {
  PLAN_ID_MISMATCH: "Whop returned a different plan ID",
  COMPANY_MISMATCH: "This plan belongs to a different Whop merchant",
  NOT_RECURRING: "The plan is not a recurring subscription",
  CURRENCY_MISMATCH: "The plan is not priced in USD",
  RENEWAL_PRICE_MISMATCH: "The recurring price differs from the approved offer",
  UPFRONT_FEE_MISMATCH: "An upfront charge is configured in addition to the subscription",
  PLAN_VISIBILITY_INVALID: "The plan visibility is invalid or archived",
  NOT_DIRECT_PURCHASE: "The plan is not set to immediate checkout",
};

export default function WhopReadinessControl() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function inspect() {
    if (pending) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/affiliates/readiness", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const object: unknown = await response.json();
      setResult(object && typeof object === "object" && !Array.isArray(object)
        ? object as Result : { ok: false, code: "INVALID_RESPONSE" });
    } catch {
      setResult({ ok: false, code: "CONNECTIVITY_ERROR" });
    } finally {
      setPending(false);
    }
  }

  return <section className="rounded-2xl border border-white/15 bg-[#242424] p-6 sm:p-8">
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF875D]">Preview validation only</p>
    <h1 className="mt-4 text-2xl font-bold text-white">Whop merchant readiness</h1>
    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#BDBDBD]">
      This check reads the two approved plans and verifies affiliate API read access
      for the real merchant. It does not create affiliates, send invitations, update
      rewards, or execute payments. A passing check does not establish that signup
      or email delivery works end-to-end.
    </p>
    <button
      type="button"
      disabled={pending}
      onClick={inspect}
      className="mt-6 rounded-xl bg-[#FF5A1F] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
    >
      {pending ? "Checking Whop…" : "Run read-only Whop check"}
    </button>
    {result && <div role="status" aria-live="polite" className="mt-6 rounded-xl border border-white/15 bg-[#191919] p-5 text-sm">
      <p className="font-semibold text-white">
        {result.merchantVerified ? "Merchant and plans verified" :
          result.code === "PROVIDER_CREDENTIALS_OR_PLAN_IDS_NOT_CONFIGURED"
            ? "Secure Preview credentials are not configured"
            : "Merchant connection is not verified"}
      </p>
      {result.code && <p className="mt-2 font-mono text-xs text-[#BDBDBD]">Status: {result.code}</p>}
      <div className="mt-4 space-y-3">
        {(result.checks ?? []).map((check, index) => <div key={check.label + index} className="border-b border-white/[0.08] pb-3 last:border-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#D1D1D1]">{check.label}</span>
            <span className={check.ok ? "text-emerald-400" : "text-orange-300"}>{check.code}</span>
          </div>
          {check.reasons && check.reasons.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[#FFB18C]">
            {check.reasons.map(reason => <li key={reason}>{reasonLabels[reason] ?? "Plan verification failed"} <span className="font-mono text-[10px] text-[#B3A39E]">({reason})</span></li>)}
          </ul>}
        </div>)}
      </div>
      {result.identity && <div className="mt-5 rounded-xl border border-white/15 bg-[#242424] p-4">
        <p className="text-sm font-bold text-white">Real Whop merchant identity</p>
        <p className="mt-2 text-xs leading-6 text-[#BDBDBD]">
          {result.identity.status === "MATCHED"
            ? "Verified: the configured business ID matches BrandFlow Studio."
            : result.identity.status === "CONFIGURED_ID_DIFFERS"
              ? "The configured business ID differs from the verified BrandFlow Studio merchant. Check the Whop dashboard before correcting the Preview configuration."
              : result.identity.status === "COMPANY_READ_PERMISSION_MISSING"
                ? "The key lacks Whop company:basic:read permission. That read-only scope is required for an identity check."
                : result.identity.status === "BRANDFLOW_STUDIO_NOT_FOUND"
                  ? "BrandFlow Studio is not among the companies accessible using this API key."
                  : result.identity.status === "MULTIPLE_BRANDFLOW_STUDIO_COMPANIES"
                    ? "More than one accessible business matches BrandFlow Studio. Manually confirm the correct business before continuing."
                    : "Whop did not allow the business identity to be verified."}
        </p>
        {result.identity.status === "CONFIGURED_ID_DIFFERS" && result.identity.verifiedBusinessId && <code className="mt-3 block break-all rounded-lg border border-[#FF5A1F]/30 bg-[#191919] p-3 text-xs text-[#FFB18C]">
          {result.identity.verifiedBusinessId}
        </code>}
      </div>}
      {result.catalog && <div className="mt-5 rounded-xl border border-white/15 bg-[#242424] p-4">
        <p className="text-sm font-bold text-white">Real merchant plan discovery</p>
        <p className="mt-2 text-xs leading-6 text-[#BDBDBD]">
          {result.catalog.status === "MATCH_FOUND"
            ? "Whop returned eligible plan candidates belonging to the connected merchant. These are suggestions only. Nothing has been changed."
            : result.catalog.status === "NO_MATCH"
              ? "No qualifying Core or Enterprise subscription was found at the expected price. Check the real merchant's plans before making changes."
              : result.catalog.status === "AMBIGUOUS"
                ? "Multiple plans have the same qualifying details. A merchant-side selection is needed before choosing any plan ID."
                : "The merchant plan catalog could not be inspected. The read-only status above distinguishes a request error, invalid merchant context, permission failure, or Whop service error. Existing IDs remain unverified."}
        </p>
        {(["core", "enterprise"] as const).map(name => <div key={name} className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <span className="text-xs font-semibold capitalize text-white">{name}</span>
          <code className="break-all text-xs text-[#FFB18C]">
            {result.catalog?.candidates[name] ?? "No unique matching plan"}
          </code>
        </div>)}
      </div>}
      {result.connected && !result.merchantVerified && <p className="mt-4 text-xs leading-6 text-[#BDBDBD]">Your API credential can reach Whop. The reasons above show which required plan details differ. Do not alter product prices or affiliate rewards based on this diagnostic alone.</p>}
      <p className="mt-4 text-xs leading-5 text-[#999]">No write operations performed. No API keys, personal data, unrelated merchants, or affiliate links are displayed.</p>
    </div>}
  </section>;
}
