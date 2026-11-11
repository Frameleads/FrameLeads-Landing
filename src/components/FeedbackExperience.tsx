"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FEEDBACK_REASONS, submitFeedback, type FeedbackPlanContext, type FeedbackReason } from "../feedback";

const collectionEnabled = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED === "true";
const enabled = process.env.NEXT_PUBLIC_FEEDBACK_PREVIEW === "true" || collectionEnabled;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export default function FeedbackExperience() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<FeedbackReason | "">("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [planContext, setPlanContext] = useState<FeedbackPlanContext>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab") {
        const focusable = document.querySelectorAll<HTMLElement>("[data-feedback-dialog] button:not(:disabled), [data-feedback-dialog] textarea");
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function closePanel() { setOpen(false); (openerRef.current ?? triggerRef.current)?.focus(); }
  function show(context: FeedbackPlanContext = "general", opener?: HTMLElement) {
    openerRef.current = opener ?? triggerRef.current;
    const path = window.location.pathname;
    setPlanContext(context);
    setSubmitted(false);
    setIsSubmitting(false);
    setNotice(collectionEnabled ? "" : context === "general" ? "" : `Preview context: ${context.replace("_", "-")} · ${path}`);
    setReason(""); setMessage(""); setOpen(true);
  }

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ context?: FeedbackPlanContext; opener?: HTMLElement }>).detail;
      show(detail?.context || "general", detail?.opener);
    };
    window.addEventListener("frameleads:open-feedback", onOpen);
    return () => window.removeEventListener("frameleads:open-feedback", onOpen);
  }, []);

  async function handleSubmit() {
    if (isSubmitting || submitted || (!reason && !message.trim())) return;
    if (!collectionEnabled) { setNotice("Preview only — feedback is not connected or saved."); return; }
    setIsSubmitting(true);
    setNotice("");
    try {
      await submitFeedback({ reason: reason || undefined, optional_message: message.trim() || undefined, plan_context: planContext });
      setSubmitted(true);
      setNotice("Thank you — your feedback was saved privately.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Feedback could not be saved. Please try again.");
    } finally { setIsSubmitting(false); }
  }

  if (!enabled) return null;
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };

  return <>
    {!pathname.startsWith("/checkout") && <button ref={triggerRef} type="button" onClick={() => show()} aria-haspopup="dialog" aria-expanded={open} className="fixed bottom-4 right-4 z-[80] inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-[#242424]/95 px-4 text-sm font-medium text-white/80 shadow-lg backdrop-blur transition hover:border-[#FF5A1F]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] sm:bottom-6 sm:right-6">
      <MessageIcon /> Feedback
    </button>}
    <AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} onMouseDown={e => { if (e.target === e.currentTarget) closePanel(); }}>
        <motion.section ref={dialogRef} tabIndex={-1} data-feedback-dialog role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-description" className="relative max-h-[94dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl border border-white/10 bg-[#1A1A1A] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-xl sm:rounded-2xl sm:p-7 lg:w-[86vw] lg:max-w-[1440px] lg:p-8" initial={{ opacity: 0, y: 16, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={transition}>
          <div className="lg:grid lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.44fr)] lg:items-start lg:gap-8">
            <div className="lg:border-r lg:border-white/[0.08] lg:pr-8">
          <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#FF5A1F]">FrameLeads · Private feedback</p><h2 id="feedback-title" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">What would help you decide?</h2><p id="feedback-description" className="mt-2 text-sm leading-relaxed text-white/60">We&apos;re improving FrameLeads and would value your perspective.</p></div><button type="button" onClick={closePanel} aria-label="Close feedback" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-xl text-white/60 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] lg:absolute lg:right-7 lg:top-4">×</button></div>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[.08] bg-white/[.025] px-3 py-1.5 text-xs text-white/60"><LockIcon /> Private feedback. Not publicly posted.</p>
          <p className="mt-2 min-h-4 break-words text-xs text-white/50" aria-live="polite">{collectionEnabled ? (notice || "Private feedback. No signup needed.") : `Preview mode · No feedback is sent or saved.${notice ? ` ${notice}` : ""}`}</p>
          {collectionEnabled && <a href="/privacy" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-white/50 underline-offset-4 hover:text-white hover:underline">Read our Privacy Policy before submitting.</a>}
            </div>
            <div className="min-w-0 lg:pt-3">
          <fieldset className="mt-4 lg:mt-0"><legend className="mb-2.5 text-sm font-medium text-white">What&apos;s holding you back?</legend><div role="radiogroup" aria-label="Feedback reason" className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">{FEEDBACK_REASONS.map((item, index) => <button key={item.id} type="button" role="radio" aria-checked={reason === item.id} onKeyDown={event => { if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return; event.preventDefault(); const options = Array.from(event.currentTarget.closest("[role=radiogroup]")?.querySelectorAll<HTMLButtonElement>("[role=radio]") ?? []); const next = (index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length; setReason(FEEDBACK_REASONS[next].id); options[next]?.focus(); }} onClick={() => setReason(item.id)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] lg:min-h-[66px] lg:px-3 lg:py-2.5 ${index === FEEDBACK_REASONS.length - 1 ? "lg:col-span-2" : ""} ${reason === item.id ? "border-[#FF5A1F]/55 bg-[#FF5A1F]/[.08] text-white" : "border-white/[.08] bg-[#242424]/70 text-white/75 hover:border-white/20 hover:bg-white/[.04]"}`}><span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${reason === item.id ? "bg-[#FF5A1F]/15 text-[#FF5A1F]" : "bg-white/[.04] text-white/50"}`}><ReasonIcon index={index} /></span><span className="flex-1 leading-snug">{item.label}</span><span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${reason === item.id ? "border-[#FF5A1F]" : "border-white/25"}`}>{reason === item.id && <span className="h-2 w-2 rounded-full bg-[#FF5A1F]" />}</span></button>)}</div></fieldset>
          <label htmlFor="feedback-message" className="mt-5 block text-sm font-medium text-white lg:mt-4">Anything else you&apos;d like us to know? <span className="font-normal text-white/40">(optional)</span></label><textarea id="feedback-message" value={message} onChange={e => setMessage(e.target.value.slice(0, 1200))} maxLength={1200} rows={2} placeholder="Tell us what's missing or what you'd like us to improve..." className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#111111] px-3.5 py-3 text-sm leading-relaxed text-white placeholder:text-white/35 transition focus:border-[#FF5A1F]/60 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20" />
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center"><button type="button" disabled={isSubmitting || submitted || (!reason && !message.trim())} onClick={() => void handleSubmit()} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#FF5A1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]">{isSubmitting ? "Sending…" : submitted ? "Feedback received" : "Send feedback"}</button><button type="button" onClick={closePanel} className="min-h-11 rounded-xl px-4 text-sm text-white/55 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]">Cancel</button></div>
            </div>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>;
}

export function CheckoutFeedbackLink({ context }: { context: FeedbackPlanContext }) {
  if (!enabled) return null;
  const label = context === "micro_pilot" ? "Have a question before starting?" : "Not quite ready to start?";
  return <button type="button" onClick={event => window.dispatchEvent(new CustomEvent("frameleads:open-feedback", { detail: { context, opener: event.currentTarget } }))} className="group mt-4 inline-flex min-h-10 items-center gap-2 text-left text-sm text-white/55 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"><MessageIcon /><span>{label} <span className="text-[#FF5A1F]/80 transition group-hover:text-[#FF5A1F]">Tell us what&apos;s missing</span></span></button>;
}

function MessageIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M7 18.2 3.5 20l1-4.1A8.5 8.5 0 1 1 8 19.1L7 18.2Z"/><path strokeLinecap="round" d="M8 10h8M8 13.5h5"/></svg>; }
function LockIcon() { return <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path strokeLinecap="round" d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>; }
function ReasonIcon({ index }: { index: number }) { return <span aria-hidden="true" className="font-mono text-[10px]">{["$", "↗", "▣", "⇄", "!"][index]}</span>; }
