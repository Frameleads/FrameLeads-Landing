"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProofStep = {
  number: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

const steps: ProofStep[] = [
  { number: "01", title: "Prepare outreach with context", description: "Review prospect-specific outreach before it goes out.", src: "/images/product-proof/01-outbound-sandbox.png", width: 1497, height: 787, alt: "FrameLeads outbound sandbox showing a selected prospect and a prepared email message." },
  { number: "02", title: "See replies that need a decision", description: "Keep the reply and its decision status together, instead of losing the handoff in a shared inbox.", src: "/images/product-proof/02-incoming-reply.png", width: 1497, height: 785, alt: "FrameLeads Inbox Triage showing incoming replies in an active review queue." },
  { number: "03", title: "Read the buyer’s intent in context", description: "See the evidence behind intent, not just a generic positive or negative label. The score represents expressed interest, not likelihood to close.", src: "/images/product-proof/03-intent-context.png", width: 1535, height: 835, alt: "FrameLeads intent view with entity context, inbound message, interest score, signals, and a withheld draft." },
  { number: "04", title: "Choose the next action safely", description: "When a commercial exception needs authority, FrameLeads recommends human review rather than inventing approval.", src: "/images/product-proof/04-decision-packet.png", width: 1567, height: 771, alt: "FrameLeads Decision Packet analyzing a negotiation and requiring human review before a response is approved." },
];

function ScreenshotVisual({
  image,
  active,
  transitioning,
  triggerRef,
  onOpen,
}: {
  image: ProofStep;
  active: boolean;
  transitioning: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
}) {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-14 z-0 rounded-[4rem] bg-[radial-gradient(ellipse_at_center,rgba(255,90,31,0.28),rgba(255,90,31,0.12)_45%,transparent_78%)] opacity-90 blur-3xl" />
      <div className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015] p-1.5 shadow-[0_34px_90px_-34px_rgba(0,0,0,.88),0_18px_46px_-30px_rgba(255,90,31,.2)] backdrop-blur-sm sm:p-2">
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Open full-size screenshot: ${image.title}`}
          onClick={onOpen}
          className={`group block w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#101010] p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:p-2 ${transitioning ? "opacity-30" : "opacity-100"} transition-opacity duration-200 motion-reduce:transition-none`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 1023px) 100vw, 60vw"
            priority={active}
            loading={active ? "eager" : "lazy"}
            className="h-auto w-full rounded-lg transition-transform duration-300 group-hover:scale-[1.006] motion-reduce:transition-none"
          />
        </button>
      </div>
    </div>
  );
}

export default function ProductProofHowItWorks({ onAudit }: { onAudit: () => void }) {
  const [active, setActive] = useState(3);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = steps[active];

  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const trigger = triggerRef.current;
    const returnFocus = previous && previous !== document.body ? previous : trigger;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus();
    };
  }, [lightboxOpen]);

  function selectStep(index: number) {
    if (index === active) return;
    setTransitioning(true);
    window.setTimeout(() => {
      setActive(index);
      window.setTimeout(() => setTransitioning(false), 35);
    }, 110);
  }

  return (
    <section id="how-it-works" aria-labelledby="proof-heading" className="relative mx-auto w-full max-w-7xl scroll-mt-32 overflow-x-clip border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FF5A1F]">Inside FrameLeads · Actual product screens</p>
        <h2 id="proof-heading" className="mt-4 text-balance font-[family-name:var(--font-oxanium)] text-3xl font-bold tracking-tight text-white sm:text-4xl">See what happens after a prospect replies.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[#A1A1AA]">From the incoming signal to a governed next action. Explore the actual interface behind the decision.</p>
      </div>

      <div className="mt-10 hidden min-w-0 items-start gap-8 lg:grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:gap-10">
        <div role="tablist" aria-label="FrameLeads workflow steps" className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <button key={step.number} id={`proof-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="proof-panel" tabIndex={active === index ? 0 : -1} onClick={() => selectStep(index)} onKeyDown={(event) => {
              if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? steps.length - 1 : (index + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + steps.length) % steps.length;
              selectStep(next);
              document.getElementById(`proof-tab-${next}`)?.focus();
            }} className={`group flex min-h-[4.5rem] w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] sm:p-5 ${active === index ? "border-[#FF5A1F]/45 bg-[#1A1A1A]" : "border-white/[0.07] bg-[#151515] hover:border-white/20"}`}>
              <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border font-mono text-xs ${active === index ? "border-[#FF5A1F]/40 bg-[#FF5A1F]/10 text-[#FF5A1F]" : "border-white/10 bg-white/[0.03] text-white/50"}`}>{step.number}</span>
              <span className="min-w-0 flex-1"><span className={`block text-base font-semibold ${active === index ? "text-white" : "text-white/75"}`}>{step.title}</span><span aria-hidden={active !== index} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${active === index ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><span className="overflow-hidden text-sm leading-relaxed text-[#929292]">{step.description}</span></span></span>
            </button>
          ))}
        </div>

        <div id="proof-panel" role="tabpanel" aria-labelledby={`proof-tab-${active}`} className="min-w-0 pt-1" key={current.number}>
          <ScreenshotVisual image={current} active={active === 3} transitioning={transitioning} triggerRef={triggerRef} onOpen={() => setLightboxOpen(true)} />
        </div>
      </div>

      <div className="mt-8 min-w-0 lg:hidden" role="group" aria-label="Explore FrameLeads workflow steps">
        <div className="flex min-w-0 flex-col gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="min-w-0">
              <button id={`proof-mobile-step-${index}`} type="button" aria-pressed={active === index} aria-controls={active === index ? "proof-mobile-panel" : `proof-mobile-description-${index}`} onClick={() => selectStep(index)} className={`flex min-h-16 w-full min-w-0 items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F] ${active === index ? "border-[#FF5A1F]/45 bg-[#1A1A1A]" : "border-white/[0.07] bg-[#151515] hover:border-white/20"}`}>
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-mono text-xs ${active === index ? "border-[#FF5A1F]/40 bg-[#FF5A1F]/10 text-[#FF5A1F]" : "border-white/10 bg-white/[0.03] text-white/50"}`}>{step.number}</span>
                <span className="min-w-0 flex-1"><span className={`block text-sm font-semibold sm:text-base ${active === index ? "text-white" : "text-white/75"}`}>{step.title}</span><span id={`proof-mobile-description-${index}`} aria-hidden={active !== index} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${active === index ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><span className="overflow-hidden text-sm leading-relaxed text-[#929292]">{step.description}</span></span></span>
              </button>
              {active === index && <div id="proof-mobile-panel" role="region" aria-labelledby={`proof-mobile-step-${index}`} className="min-w-0 pt-3" key={`mobile-${current.number}`}><ScreenshotVisual image={current} active={active === 3} transitioning={transitioning} triggerRef={triggerRef} onOpen={() => setLightboxOpen(true)} /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center"><button type="button" onClick={onAudit} className="rounded-xl bg-[#FF5A1F] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#ff6b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]">Find my reply bottleneck</button></div>

      {lightboxOpen && <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 p-2 sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightboxOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-label={`Full screenshot: ${current.title}`} className="flex max-h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl border border-white/15 bg-[#141414] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><p className="text-sm font-semibold text-white">{current.title} <span className="ml-2 font-mono text-xs text-white/45">{current.width} × {current.height}</span></p><button ref={closeRef} type="button" onClick={() => setLightboxOpen(false)} aria-label="Close full screenshot" className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5A1F]">Close <span aria-hidden="true">×</span></button></div>
          <div className="min-h-0 overflow-auto overscroll-contain p-2 sm:p-4"><Image src={current.src} alt={current.alt} width={current.width} height={current.height} sizes="96vw" priority unoptimized className="mx-auto h-auto w-auto max-w-none" /></div>
        </div>
      </div>}
    </section>
  );
}
