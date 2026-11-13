import Image from "next/image";

const screenshots = [
  {
    title: "Outbound Sandbox",
    subtitle: "Show the prepared outreach workspace and its prospect context.",
    file: "01-outbound-sandbox.png",
    src: "/images/product-proof/01-outbound-sandbox.png",
    width: 1497,
    height: 787,
  },
  {
    title: "Inbox Triage",
    subtitle: "Show what happens when qualified prospects reply.",
    file: "02-incoming-reply-20261102.png",
    src: "/images/product-proof/02-incoming-reply-20261102.png",
    width: 1497,
    height: 862,
  },
  {
    title: "Intent & Context",
    subtitle: "Explain the buying signals and the limits of an intent score.",
    file: "03-intent-context-20261102.png",
    src: "/images/product-proof/03-intent-context-20261102.png",
    width: 1572,
    height: 831,
  },
  {
    title: "Decision Packet",
    subtitle: "Demonstrate a commercial exception that requires human approval.",
    file: "04-decision-packet-20261102.png",
    src: "/images/product-proof/04-decision-packet-20261102.png",
    width: 1532,
    height: 867,
  },
] as const;

export default function AffiliateProofKit() {
  return (
    <section
      id="partner-proof-kit"
      aria-labelledby="affiliate-proof-heading"
      className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 pt-10 sm:px-8 sm:pb-24"
    >
      <div className="border-t border-white/[0.1] pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF875D]">
              Partner resources / Product proof
            </p>
            <h2
              id="affiliate-proof-heading"
              className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Show the actual product.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#BDBDBD] sm:text-base">
              You do not need a FrameLeads login to introduce the product.
              Start with these four screenshots from our website&apos;s How It Works section.
              Use them to show the workflow clearly while we prepare short product recordings.
            </p>
          </div>
          <a
            href="/resources/frameleads-affiliate-product-proof.zip"
            download="FrameLeads-Affiliate-Product-Proof.zip"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#FF5A1F] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#FF7240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB181]"
          >
            Download all 4 screenshots (ZIP)
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {screenshots.map((shot, index) => (
            <article
              key={shot.file}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#242424]"
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.08] bg-[#111]">
                <Image
                  src={shot.src}
                  alt={"FrameLeads product screenshot: " + shot.title}
                  width={shot.width}
                  height={shot.height}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-widest text-[#FF875D]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white">{shot.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A9A9A9]">{shot.subtitle}</p>
                </div>
                <a
                  href={shot.src}
                  download={shot.file}
                  className="mt-auto inline-flex min-h-10 items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#FF5A1F]/70 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5A1F]"
                  aria-label={"Download FrameLeads screenshot: " + shot.title}
                >
                  Download screenshot
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.1] bg-[#242424]/70 p-5 text-sm leading-6 text-[#BDBDBD] sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p>
            <strong className="font-semibold text-white">Use them responsibly.</strong>{" "}
            Screens show the actual application with illustrative prospect data, not verified customer results.
            Don&apos;t claim guaranteed revenue, autonomous approvals or fake success metrics.
          </p>
          <div className="shrink-0 text-xs text-[#FFB18C]">
            <span className="font-semibold text-white">Coming next:</span> short product footage
          </div>
        </div>
      </div>
    </section>
  );
}
