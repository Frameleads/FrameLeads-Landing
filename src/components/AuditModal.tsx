"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PipelineAudit, { type AuditResult } from "./PipelineAudit";

type Props = { open: boolean; onClose: () => void; onComplete: (result: AuditResult) => void };

export default function AuditModal({ open, onClose, onComplete }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [open, onClose]);

  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.div ref={dialogRef} tabIndex={-1} initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .28, ease: "easeOut" }} role="dialog" aria-modal="true" aria-labelledby="audit-modal-title" className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/[0.14] bg-[#151515] p-5 shadow-[0_28px_80px_rgba(0,0,0,.7)] sm:p-8"><h2 id="audit-modal-title" className="sr-only">Reply Workflow Audit</h2><PipelineAudit onAuditComplete={onComplete} onClose={onClose} /></motion.div></motion.div>}</AnimatePresence>;
}
