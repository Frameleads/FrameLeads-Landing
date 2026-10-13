"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import PipelineAudit, { type AuditResult } from "./PipelineAudit";

type Props = { open: boolean; onClose: () => void; onComplete: (result: AuditResult) => void; returnFocusRef?: RefObject<HTMLElement | null> };

export default function AuditModal({ open, onClose, onComplete, returnFocusRef }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (trigger && !dialog.contains(trigger)) restoreFocus.current = trigger;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && !element.contains(dialog))
      .map((element) => ({ element, inert: element.inert }));
    for (const { element } of background) element.inert = true;
    document.body.style.overflow = "hidden";
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'))
      .filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key !== "Tab") return;
      const elements = focusables();
      const first = elements[0], last = elements.at(-1);
      if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    };
    const keepFocus = (event: FocusEvent) => { if (event.target instanceof Node && !dialog.contains(event.target)) dialog.focus({ preventScroll: true }); };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", keepFocus);
    dialog.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      for (const { element, inert } of background) element.inert = inert;
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", keepFocus);
    };
  }, [open, onClose, returnFocusRef]);

  const onExitComplete = () => {
    if (open) return;
    const fallback = Array.from(document.querySelectorAll<HTMLElement>("button[data-tripwire-guard]")).find((element) => element.getClientRects().length > 0);
    const trigger = restoreFocus.current;
    (trigger?.isConnected && trigger !== document.body ? trigger : fallback)?.focus({ preventScroll: true });
  };

  if (typeof document === "undefined") return null;
  return createPortal(<AnimatePresence onExitComplete={onExitComplete}>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.div ref={dialogRef} tabIndex={-1} initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : .98 }} transition={{ duration: reduced ? .1 : .28, ease: "easeOut" }} role="dialog" aria-modal="true" aria-labelledby="audit-modal-title" className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/[0.14] bg-[#151515] p-5 shadow-[0_28px_80px_rgba(0,0,0,.7)] sm:p-8"><h2 id="audit-modal-title" className="sr-only">Reply Workflow Audit</h2><PipelineAudit onAuditComplete={onComplete} onClose={onClose} /></motion.div></motion.div>}</AnimatePresence>, document.body);
}
