"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Progressive, transform-only motion for the landing's product-proof visuals.
 * Each card enters once, then stays still. Reduced-motion visitors receive
 * the fully visible layout immediately. No continuous animation or layout shift.
 */
export function ProofReveal({
  children,
  className = "",
  delay = 0,
  hover = false,
  gentle = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  gentle?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: gentle ? 0.9 : 0.78, y: gentle ? 8 : 13 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -36px 0px" }}
      transition={{ duration: gentle ? 0.52 : 0.62, delay: Math.min(delay, 0.24), ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover && !reducedMotion ? { y: -3 } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Animates the existing 86% score visually without inventing live scoring. */
export function ExampleScoreFill() {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-[#FF5A1F] via-[#FF7848] to-[#FFC06A]"
      style={{ width: "86%", transformOrigin: "left center" }}
      initial={reducedMotion ? false : { scaleX: 0 }}
      whileInView={reducedMotion ? undefined : { scaleX: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.95, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
