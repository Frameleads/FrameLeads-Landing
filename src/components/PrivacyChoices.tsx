"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getPrivacyConsent, savePrivacyConsent, subscribePrivacyConsent } from "../privacy-consent";

declare global {
  interface Window {
    whop?: {
      q?: unknown[][];
      t?: number;
      s?: string[];
      o?: string;
      track?: (...args: unknown[]) => void;
      setScope?: (...args: unknown[]) => void;
      scope?: (...args: unknown[]) => { track: (...args: unknown[]) => void };
      __frameleadsDisabled?: boolean;
    };
  }
}

export default function PrivacyChoices() {
  const consent = useSyncExternalStore(subscribePrivacyConsent, getPrivacyConsent, () => null);
  const [isOpen, setIsOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const visible = consent === null || isOpen;

  useEffect(() => {
    const onOpen = () => {
      const latest = getPrivacyConsent();
      setAnalytics(latest?.analytics ?? false);
      setAdvertising(latest?.advertising ?? false);
      setIsOpen(true);
      setManaging(true);
    };
    window.addEventListener("frameleads:open-privacy-choices", onOpen);
    return () => window.removeEventListener("frameleads:open-privacy-choices", onOpen);
  }, []);

  const save = (next: { analytics: boolean; advertising: boolean }) => {
    savePrivacyConsent(next);
    setIsOpen(false);
    setManaging(false);
  };

  return <>
    <WhopAnalytics enabled={consent?.advertising === true} />
    {visible ? <section aria-labelledby="privacy-choices-title" aria-describedby="privacy-choices-description" className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#111111]/[0.97] p-5 shadow-[0_20px_70px_rgba(0,0,0,.75)] backdrop-blur-xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[min(92vw,38rem)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF5A1F]">Privacy choices</p>
          <h2 id="privacy-choices-title" className="mt-2 text-lg font-semibold text-white">Choose optional measurement</h2>
        </div>
        {consent && <button type="button" onClick={() => setIsOpen(false)} aria-label="Close privacy choices" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-lg text-white/65 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">×</button>}
      </div>
      <p id="privacy-choices-description" className="mt-2 text-sm leading-relaxed text-white/65">The Reply Workflow Audit works either way. Optional analytics and advertising tags stay off until you choose.</p>
      {managing && <div className="mt-4 space-y-3 border-y border-white/10 py-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/85">
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1 h-4 w-4 accent-[#FF5A1F]" />
          <span><span className="block font-semibold text-white">Analytics and attribution</span><span className="mt-1 block text-xs leading-relaxed text-white/55">First-party page, video, Audit, and checkout-start observations, plus session and campaign attribution.</span></span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/85">
          <input type="checkbox" checked={advertising} onChange={(event) => setAdvertising(event.target.checked)} className="mt-1 h-4 w-4 accent-[#FF5A1F]" />
          <span><span className="block font-semibold text-white">Advertising and conversion measurement</span><span className="mt-1 block text-xs leading-relaxed text-white/55">Configured Meta/TikTok browser tags, eligible server-side conversion matching, and the Whop analytics tag.</span></span>
        </label>
        <p className="text-xs leading-relaxed text-white/45">You can change these choices later with the Privacy settings control. Necessary site storage is limited to remembering your choice.</p>
      </div>}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        {!managing ? <>
          <button type="button" onClick={() => save({ analytics: false, advertising: false })} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">Reject optional</button>
          <button type="button" onClick={() => save({ analytics: true, advertising: true })} className="rounded-lg bg-[#FF5A1F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff6b35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Accept optional</button>
          <button type="button" onClick={() => setManaging(true)} className="rounded-lg px-3 py-2.5 text-sm text-white/65 underline decoration-white/20 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">Manage choices</button>
        </> : <>
          <button type="button" onClick={() => save({ analytics: false, advertising: false })} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">Reject optional</button>
          <button type="button" onClick={() => save({ analytics, advertising })} className="rounded-lg bg-[#FF5A1F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ff6b35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Save preferences</button>
        </>}
      </div>
    </section> : <button type="button" onClick={() => window.dispatchEvent(new Event("frameleads:open-privacy-choices"))} className="fixed bottom-3 left-3 z-[90] rounded-full border border-white/15 bg-[#111111]/90 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-white/60 shadow-lg backdrop-blur-md transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] sm:bottom-5 sm:left-5">Privacy settings</button>}
  </>;
}

function WhopAnalytics({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) {
      if (window.whop) {
        window.whop.__frameleadsDisabled = true;
        window.whop.q = [];
        window.whop.track = () => {};
        window.whop.setScope = () => {};
      }
      return;
    }
    if (window.whop) {
      window.whop.__frameleadsDisabled = false;
      window.whop.track?.("page");
      return;
    }
    const whop: NonNullable<Window["whop"]> = {
      q: [] as unknown[][], t: Date.now(), s: [] as string[], o: "https://t.whop.tw", __frameleadsDisabled: false,
      track(...args: unknown[]) { if (!whop.__frameleadsDisabled) whop.q?.push([Date.now(), ...args]); },
      setScope(...args: unknown[]) { whop.s = args.filter((value): value is string => typeof value === "string"); whop.q?.push([Date.now(), "setScope", ...whop.s]); },
      scope(...args: unknown[]) { const scope = args; return { track: (...trackArgs: unknown[]) => whop.track?.(...trackArgs, { __scope: scope }) }; },
    };
    window.whop = whop;
    whop.setScope?.("biz_RSQW7xARXYAQke");
    const script = document.createElement("script");
    script.id = "whop-pixel";
    script.async = true;
    script.src = "https://t.whop.tw/s.js";
    document.head.appendChild(script);
    whop.track?.("page");
  }, [enabled]);
  return null;
}
