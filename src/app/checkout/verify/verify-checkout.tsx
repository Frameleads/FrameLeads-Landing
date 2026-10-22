"use client";

import { useState } from 'react';

export default function VerifyCheckout() {
  const [state, setState] = useState<'READY' | 'INVALID' | 'EXPIRED' | 'UNAVAILABLE' | 'VERIFYING'>('READY');

  async function verify() {
    if (state !== 'READY') return;
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '';
    window.history.replaceState(null, '', window.location.pathname);
    if (!/^[a-f0-9]{64}$/.test(token)) { setState('INVALID'); return; }
    setState('VERIFYING');
    try {
      const response = await fetch('/api/checkout/verify', { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      if (response.ok) { window.location.assign('/checkout/continue'); return; }
      const data: unknown = await response.json().catch(() => null);
      const code = data && typeof data === 'object' && 'error' in data ? data.error : null;
      setState(code === 'EXPIRED' ? 'EXPIRED' : 'UNAVAILABLE');
    } catch { setState('UNAVAILABLE'); }
  }

  const message = state === 'EXPIRED' ? 'This secure link has expired or was already used. Submit the Audit again to request a new link.'
    : state === 'INVALID' ? 'This verification link is invalid.'
      : state === 'UNAVAILABLE' ? 'We could not verify this link right now. Try again shortly or request a new link from your Audit.' : null;
  return <main className="grid min-h-screen place-items-center bg-[#111111] px-5 text-white"><section className="max-w-xl rounded-2xl border border-white/10 bg-[#1A1A1A] p-8 text-center">
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FF5A1F]">Verify your email</p>
    <h1 className="mt-4 text-3xl font-bold">Continue from your Reply Workflow Audit</h1>
    {message ? <p role="status" className="mt-4 text-sm leading-relaxed text-white/65">{message}</p> : <>
      <p className="mt-4 text-sm leading-relaxed text-white/65">Confirm you can access the email address used for the Audit. This secure link can be used once and expires after 20 minutes.</p>
      <button onClick={verify} disabled={state === 'VERIFYING'} className="mt-7 rounded-xl bg-[#FF5A1F] px-6 py-4 font-bold text-white hover:bg-[#ff6b35] disabled:opacity-50">{state === 'VERIFYING' ? 'Verifying…' : 'Verify and continue'}</button>
    </>}
  </section></main>;
}
