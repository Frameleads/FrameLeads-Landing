export default function VideoSection() {
  return (
    <div className="mx-auto mb-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-[#18181b] p-2.5 shadow-[0_0_30px_rgba(255,90,31,0.15)] sm:p-4">
      <iframe
        src="https://www.youtube.com/embed/EiwzlWjhvcI?cc_load_policy=3&rel=0&modestbranding=1"
        title="How FrameLeads secures your outbound pipeline without manual SDR triage"
        className="block aspect-video w-full rounded-xl border border-white/10"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
