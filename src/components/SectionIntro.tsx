"use client";

import { motion, useReducedMotion } from "framer-motion";
import { sectionEyebrowMotion, sectionHeadingMotion, sectionSubheadingMotion, sectionViewport } from "./section-motion";

type Props = { eyebrow: string; heading: string; description?: string; className?: string };

export default function SectionIntro({ eyebrow, heading, description, className = "" }: Props) {
  const reduce = useReducedMotion();
  const visible = reduce ? "visible" : "visible";
  return <div className={`mx-auto text-center ${className}`}><motion.p variants={sectionEyebrowMotion} initial="hidden" whileInView={visible} viewport={sectionViewport} className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">{eyebrow}</motion.p><motion.h2 variants={sectionHeadingMotion} initial="hidden" whileInView={visible} viewport={sectionViewport} className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{heading}</motion.h2>{description && <motion.p variants={sectionSubheadingMotion} initial="hidden" whileInView={visible} viewport={sectionViewport} className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#888888] sm:text-lg">{description}</motion.p>}</div>;
}
