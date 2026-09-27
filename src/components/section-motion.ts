import type { Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
export const sectionViewport = { once: true, amount: 0.3 };
export const sectionEyebrowMotion: Variants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: .6, ease } } };
export const sectionHeadingMotion: Variants = { hidden: { opacity: 0, y: 18, scale: .99 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .84, delay: .16, ease } } };
export const sectionSubheadingMotion: Variants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: .72, delay: .32, ease } } };
export const sectionVisualMotion: Variants = { hidden: { opacity: 0, y: 20, scale: .99 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .94, delay: .46, ease } } };
