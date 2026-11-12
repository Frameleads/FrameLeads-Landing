"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConfirmAffiliateEmail() {
  const [token, setToken] = useState("");
  const [state, setState] = useState<"checking" | "ready" | "submitting" | "complete" | "failed">("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const match = /^#token=([A-Za-z0-9_-]{32,1024})$/.exec(window.location.hash);
    // The fragment never reaches the server and must be cleared promptly
    // so browser history, referrals and analytics do not retain the token.
    window.history.replaceState(null, "", window.location.pathname);
    let active = true;
    // Defer the initial state transition until after the effect. React's
    // effect should synchronize external browser state, not synchronously
    // trigger cascading updates during effect execution.
    queueMicrotask(() => {
      if (!active) return;
      if (match) {
        setToken(match[1]);
        setState("ready");
      } else {
        setState("failed");
        setMessage("This link is missing or invalid. Return to the affiliate form to request a new one.");
      }
    });
    return () => { active = false; };
  }, []);

  async function confirm() {
    if (!token || state !== "ready") return;
    setState("submitting");
    try {
      const response = await fetch("/api/affiliates/confirm", {
        method: "POST", cache: "no-store", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setToken("");
      const data: unknown = await response.json();
      const payload = data && typeof data === "object" ? data as Record<string, unknown> : {};
      if (response.ok && payload.ok === true) {
        setState("complete");
      } else {
        setState("failed");
        setMessage(payload.code === "ENROLLED_EMAIL_DELIVERY_PENDING"
          ? "Whop registration may have succeeded, but we could not confirm email delivery. Contact akram@frameleads.io before trying again."
          : payload.code === "EXPIRED_OR_INVALID_TOKEN"
            ? "Your link is invalid or expired. Return to the application to request a new one."
            : "We could not safely complete the signup. Contact akram@frameleads.io.");
      }
    } catch {
      setToken("");
      setState("failed");
      setMessage("The signup could not be confirmed. Contact akram@frameleads.io.");
    }
  }

  return <section className="w-full max-w-lg rounded-[1.5rem] border border-white/[0.14] bg-[#242424] p-8 sm:p-10" aria-live="polite">
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF875D]">FrameLeads / Partners</p>
    <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white">
      {state === "complete" ? "You're registered." : "Confirm your email"}
    </h1>
    <p className="mt-4 text-sm leading-7 text-[#BDBDBD]">
      {state === "complete"
        ? "Your registration was confirmed. We sent your individual Core and Enterprise referral links to your verified address. Check your inbox and spam folder."
        : state === "checking" ? "Checking your link…" :
          state === "ready" || state === "submitting" ? "Confirming will securely register your Whop affiliate account and request your two first-payment-only referral links." : message}
    </p>
    {state === "ready" && <button type="button" onClick={confirm} className="mt-7 min-h-12 w-full rounded-xl bg-[#FF5A1F] px-6 font-semibold text-white hover:bg-[#E64B12]">Confirm and join</button>}
    {state === "submitting" && <p role="status" className="mt-6 text-sm text-[#FFB18C]">Completing your registration…</p>}
    <Link href="/affiliates" className="mt-7 inline-block text-sm text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white">Back to the affiliate program</Link>
  </section>;
}
