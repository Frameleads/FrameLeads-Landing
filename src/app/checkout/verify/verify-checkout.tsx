"use client";

import { useState } from "react";

export default function VerifyCheckout() {
  const [state, setState] = useState<"READY" | "INVALID" | "EXPIRED" | "UNAVAILABLE" | "VERIFYING">("READY");
  async function verify() {
    if (state !== "READY") return;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) { setState("INVALID"); return; }
    setState("VERIFYING");
    try {
      const response = await fetch("/api/checkout/verify", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (response.ok) { window.location.assign("/checkout/continue"); return; }
      const data: unknown = await response.json().catch(() => null);
      setState(data && typeof data === "object" && "error" in data && data.error === "EXPIRED" ? "EXPIRED" : "UNAVAILABLE");
    } catch { setState("UNAVAILABLE"); }
  }
  const error = state === "INVALID" ? "The verification link is invalid." :
    state === "EXPIRED" ? "This secure link has expired or was already used. Request another link from your Audit." :
    state === "UNAVAILABLE" ? "We could not verify this link. You may request another link from your Audit." : null;
  return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 text-white">
    <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
      <h1 className="text-2xl font-bold">Secure checkout continuation</h1>
      {error ? <p role="status" className="mt-5 text-sm text-white/70">{error}</p> : <>
        <p className="mt-4 text-sm text-white/70">Confirm your Audit email before resuming checkout. This verification link can be used once.</p>
        <button type="button" disabled={state === "VERIFYING"} onClick={verify}
          className="mt-6 rounded-xl bg-[#FF5A1F] px-5 py-3 font-bold text-white disabled:opacity-50">
          {state === "VERIFYING" ? "Verifying…" : "Verify and continue"}
        </button>
      </>}
    </section>
  </main>;
}
