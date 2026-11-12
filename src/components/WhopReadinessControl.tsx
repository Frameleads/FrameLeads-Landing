"use client";

import { useState } from "react";

type Check = { label: string; ok: boolean; code: string };
type Result = {
  ok?: boolean;
  code?: string;
  connected?: boolean;
  merchantVerified?: boolean;
  rewardsWriteTested?: false;
  checks?: Check[];
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
        {(result.checks ?? []).map((check, index) => <div key={check.label + index} className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-2 last:border-0">
          <span className="text-[#D1D1D1]">{check.label}</span>
          <span className={check.ok ? "text-emerald-400" : "text-orange-300"}>{check.code}</span>
        </div>)}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#999]">No write operations performed. No API keys, personal data, or affiliate links are displayed.</p>
    </div>}
  </section>;
}
