"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

type RegistrationMode = "preview" | "preview_e2e" | "live" | "disabled";
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": () => void;
      }) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

export default function AffiliateRegistrationForm({ mode }: { mode: RegistrationMode }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<"preview" | "verification_sent" | null>(null);
  const [error, setError] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_AFFILIATE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (mode !== "live" || !siteKey || !widget.current) return;
    let active = true;
    let widgetId: string | undefined;
    const draw = () => {
      if (active && widget.current && window.turnstile && !widgetId) {
        widgetId = window.turnstile.render(widget.current, {
          sitekey: siteKey,
          callback: value => setCaptcha(value),
          "expired-callback": () => setCaptcha(""),
          "error-callback": () => setCaptcha(""),
        });
      }
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.addEventListener("load", draw);
    document.head.appendChild(script);
    draw();
    return () => {
      active = false;
      if (widgetId && window.turnstile?.remove) window.turnstile.remove(widgetId);
      script.remove();
    };
  }, [mode, siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || mode === "disabled") return;
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ firstName, lastName, email, agreed, website, turnstileToken: captcha }),
      });
      const payload: unknown = await response.json();
      const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok || data.ok !== true) {
        setError(data.code === "RATE_LIMITED"
          ? "Too many attempts. Please try again later."
          : data.code === "VERIFICATION_FAILED" || data.code === "VERIFICATION_REQUIRED"
            ? "Please complete the verification and try again."
            : data.code === "TEST_ACCESS_DENIED"
              ? "This protected test accepts only the approved test email address."
              : data.code === "NOT_LIVE"
              ? "Applications are not open yet."
              : "We could not process your application. Please try again later.");
        return;
      }
      if (data.mode === "preview" || data.mode === "verification_sent") {
        setResult(data.mode);
      } else {
        setError("The confirmation could not be verified.");
      }
    } catch {
      setError("Could not connect to the registration service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return <section className="flex min-h-[29rem] flex-col justify-center rounded-[1.5rem] border border-[#FF5A1F]/30 bg-[#242424] p-7 sm:p-10" role="status" aria-live="polite">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF5A1F]/40 bg-[#FF5A1F]/10 text-2xl text-[#FF5A1F]">✓</div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#FF875D]">{result === "preview" ? "Preview validation passed" : "Check your inbox"}</p>
      <h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl">
        {result === "preview" ? "Your form is working." : "Confirm your email."}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#BDBDBD]">
        {result === "preview"
          ? "This is an isolated demonstration. No affiliate was registered, no invitation email was sent, and no submitted details were stored."
          : "We queued a FrameLeads confirmation email to the address you provided. Confirm it to activate your affiliate rewards in Whop. Check spam if it doesn't arrive."}
      </p>
      <button type="button" className="mt-8 w-fit rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40" onClick={() => setResult(null)}>Back to form</button>
    </section>;
  }

  const fieldClass = "mt-2 h-12 w-full rounded-xl border border-white/[0.16] bg-[#151515] px-4 text-sm text-white outline-none transition focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/15 placeholder:text-[#777]";
  return <form onSubmit={submit} className="rounded-[1.5rem] border border-white/[0.14] bg-[#242424] p-6 shadow-[0_36px_90px_-35px_rgba(0,0,0,0.75)] sm:p-9" noValidate={false}>
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF875D]">Partner application</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white">Join FrameLeads</h2>
        <p className="mt-2 text-sm text-[#B7B7B7]">No calls. No complicated onboarding.</p>
      </div>
      <span className="rounded-full border border-[#FF5A1F]/30 bg-[#FF5A1F]/10 px-3 py-1 font-mono text-[10px] text-[#FFB18C]">30% · recurring</span>
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block text-xs font-semibold text-white" htmlFor="partner-first-name">First name
        <input id="partner-first-name" className={fieldClass} name="firstName" type="text" autoComplete="given-name" maxLength={70} required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John"/>
      </label>
      <label className="block text-xs font-semibold text-white" htmlFor="partner-last-name">Last name
        <input id="partner-last-name" className={fieldClass} name="lastName" type="text" autoComplete="family-name" maxLength={70} required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith"/>
      </label>
    </div>
    <label className="mt-5 block text-xs font-semibold text-white" htmlFor="partner-email">Email address
      <input id="partner-email" className={fieldClass} name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/>
    </label>
    <div className="absolute left-[-9999px]" aria-hidden="true">
      <label htmlFor="partner-website">Website (leave blank)</label>
      <input id="partner-website" name="website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e => setWebsite(e.target.value)}/>
    </div>

    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#191919] p-4 text-xs leading-5 text-[#BDBDBD]">
      <input className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF5A1F]" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
      <span>I agree to the <Link className="font-semibold text-white underline decoration-[#FF5A1F]/60 underline-offset-4" href="/terms">terms</Link> and <Link className="font-semibold text-white underline decoration-[#FF5A1F]/60 underline-offset-4" href="/privacy">privacy policy</Link>, and authorize FrameLeads to share my email with Whop to process this affiliate application. I understand commissions are recurring on eligible subscription payments, subject to Whop&apos;s affiliate terms.</span>
    </label>

    {mode === "live" && <div className="mt-5" ref={widget} aria-label="Spam protection challenge" />}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

    <button type="submit" disabled={pending || mode === "disabled" || (mode === "live" && !captcha)} className="fl-cta-pop mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E64B12] disabled:cursor-not-allowed disabled:opacity-50">
      {pending ? "Checking your application…" : mode === "disabled" ? "Applications opening soon" : "Apply to join"}
    </button>
    <p className="mt-4 text-center text-xs leading-5 text-[#999]">Whop manages affiliate links, attribution and commissions. We never ask for your payment details here.</p>
  </form>;
}
