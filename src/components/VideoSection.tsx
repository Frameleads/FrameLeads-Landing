"use client";

import { useState } from "react";

const videoId = "EiwzlWjhvcI";
const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`;

export default function VideoSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  return <div className="mx-auto mb-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-[#18181b] p-2.5 shadow-[0_0_30px_rgba(255,90,31,0.15)] sm:p-4"><div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">{isLoaded ? <><iframe src={embedUrl} title="How FrameLeads secures your outbound pipeline without manual SDR triage" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><a href={watchUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 rounded-md border border-white/15 bg-black/60 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/65 transition hover:text-white">Watch on YouTube ↗</a></> : <button type="button" onClick={() => setIsLoaded(true)} className="group relative h-full w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"><span className="absolute inset-0 bg-[url('https://i.ytimg.com/vi/EiwzlWjhvcI/maxresdefault.jpg')] bg-cover bg-center opacity-45 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-55" /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/45" /><span className="relative z-10 flex h-full flex-col items-center justify-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full border border-[#FF5A1F]/50 bg-[#FF5A1F] text-xl text-white shadow-[0_0_28px_rgba(255,90,31,.35)]">▶</span><span className="font-mono text-[10px] uppercase tracking-[.2em] text-white/80">FrameLeads VSL</span><span className="rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-sm font-semibold text-white">Watch the VSL</span></span></button>} {!isLoaded && <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-20 font-mono text-[8px] uppercase tracking-wider text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white">Open on YouTube ↗</a>}</div></div>;
}
