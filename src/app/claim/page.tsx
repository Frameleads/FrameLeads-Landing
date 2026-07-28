"use client";

import { useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setIsSubmitting(false);
        
        // Post-Opt-In Redirect
        setTimeout(() => {
          router.push('/');
        }, 2500);
      } else {
        // If Mailchimp fails (e.g., already subscribed), fail gracefully
        console.error('Subscription failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('API Error', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] bg-grid-overlay selection:bg-[#FF5A1F] selection:text-white overflow-hidden font-sans">
      
      {/* Top Status Bar */}
      <div className="w-full border-b border-white/10 px-4 sm:px-6 py-2 bg-black/50 relative z-50">
        <p className="font-mono text-[10px] text-white/50 tracking-widest uppercase text-center sm:text-left">
          // SYSTEM: ACTIVE | PAYLOAD: AI SDR FRAMEWORK
        </p>
      </div>

      {/* Navigation Header */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between relative z-50 border-b border-white/5 bg-[#0D0D0D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FrameLeads Logo" width={32} height={32} className="object-contain rounded-[8px]" />
          <h1 className="font-heading font-bold text-xl sm:text-2xl tracking-wide text-white">
            FrameLeads
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-16 sm:pt-24 pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto min-h-[70vh]">
        
        {/* Urgency Banner */}
        <div className="inline-block bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] font-mono text-xs px-4 py-2 rounded-full mb-8 sm:mb-10 uppercase tracking-widest">
          Free for 48 Hours • Normally $150
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 sm:mb-8 text-white">
          The AI SDR <br className="hidden sm:block" />
          <span className="text-[#FF5A1F] drop-shadow-[0_0_15px_rgba(255,90,31,0.6)]">Prompt Framework.</span>
        </h2>
        
        <p className="text-lg sm:text-xl md:text-2xl text-[#8A8A93] font-light leading-relaxed mb-10 sm:mb-12 max-w-2xl mx-auto">
          Draft elite outbound replies without risking a $50K deal on an AI hallucination. Every prompt is built to draft—you remain the review layer.
        </p>

        <div className="w-full max-w-md mx-auto relative z-20">
          {!success ? (
            <form onSubmit={handleSubscribe} className="space-y-6">
              <div>
                <input 
                  type="email" 
                  required
                  placeholder="Enter your best email..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[#FF5A1F] text-white text-lg p-5 sm:p-6 rounded-xl outline-none font-sans transition-colors placeholder:text-[#8A8A93]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full inline-flex items-center justify-center rounded-xl bg-[#FF5A1F] text-white font-bold text-base sm:text-lg tracking-wider px-8 py-5 shadow-[0_0_35px_rgba(255,90,31,0.4)] hover:bg-[#ff6b35] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? 'ENCRYPTING PAYLOAD...' : 'SECURE THE FRAMEWORK'}
                  {!isSubmitting && <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>}
                </span>
              </button>
              <p className="text-[11px] text-zinc-500 text-center mt-4 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                *Note: Due to our enterprise security protocols, automated payloads occasionally route to spam. Check your spam folder if the architecture does not arrive within 60 seconds.*
              </p>
              <p className="text-[#8A8A93] text-[10px] sm:text-xs font-mono text-center uppercase tracking-widest mt-6">
                The payload will be delivered instantly to your inbox.
              </p>
            </form>
          ) : (
            <div className="bg-[#121212] border border-[#FF5A1F]/30 p-8 rounded-xl shadow-[0_0_30px_rgba(255,90,31,0.1)] text-center animate-in fade-in zoom-in duration-500">
              <h3 className="text-[#FF5A1F] font-mono text-sm uppercase tracking-widest mb-4">Payload Secured</h3>
              <p className="text-white text-lg font-light">
                Check your inbox. The framework has been dispatched.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}