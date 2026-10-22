import Link from 'next/link';

export default function CheckoutCompletePage() {
  return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 text-white"><section className="max-w-xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FF5A1F]">Checkout update</p><h1 className="mt-4 text-3xl font-bold">Thanks for choosing FrameLeads</h1>
    <p className="mt-4 text-sm leading-relaxed text-white/65">Whop is confirming your payment. We’ll send the next steps to the email address used at checkout.</p>
    <Link href="/" className="mt-7 inline-block rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white hover:text-black">Return to FrameLeads</Link>
  </section></main>;
}
