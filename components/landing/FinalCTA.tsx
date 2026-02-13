'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';

type FormState = 'idle' | 'sending' | 'success' | 'error';

export function FinalCTA() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Senden');
      }

      setFormState('success');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (err) {
      setFormState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Fehler beim Senden');
    }
  };

  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="relative">
            {/* Large geometric accent */}
            <div className="absolute -top-16 -right-16 w-64 h-64 border border-[#E8710A]/[0.06] rotate-12 pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
              {/* Left: headline */}
              <div>
                <div className="w-12 h-px bg-[#E8710A]/40 mb-8" />
                <h2 className="font-bebas-neue text-5xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[0.9] mb-6">
                  Dein Werkzeug
                  <br />
                  existiert noch nicht.
                  <br />
                  <span className="text-[#E8710A]">Wir ändern das.</span>
                </h2>
                <p className="text-white/55 text-base sm:text-lg font-light max-w-md leading-relaxed">
                  Erzähl uns, was dein Unternehmen bremst.
                  Wir bauen, was es beschleunigt.
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <div className="w-4 h-px bg-white/10" />
                  <span className="text-xs text-white/40">Bereits Zugang?</span>
                  <Link
                    href="/handler/sign-in"
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Anmelden
                  </Link>
                </div>
              </div>

              {/* Right: contact form */}
              <div>
                <p className="font-oswald text-xs tracking-[0.2em] uppercase text-white/50 mb-6">
                  Projekt starten
                </p>

                {formState === 'success' ? (
                  <div className="border border-[#E8710A]/20 p-8">
                    <p className="font-bebas-neue text-2xl text-white mb-3">Nachricht gesendet.</p>
                    <p className="text-white/55 text-sm leading-relaxed">
                      Wir melden uns innerhalb von 24 Stunden bei dir.
                    </p>
                    <button
                      onClick={() => setFormState('idle')}
                      className="mt-6 text-xs text-[#E8710A]/60 hover:text-[#E8710A] transition-colors font-oswald tracking-[0.15em] uppercase"
                    >
                      Weitere Nachricht senden
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Name *"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8710A]/40 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Unternehmen"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8710A]/40 transition-colors"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="E-Mail *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8710A]/40 transition-colors"
                    />
                    <textarea
                      placeholder="Was bremst dein Unternehmen? *"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8710A]/40 transition-colors resize-none"
                    />

                    {formState === 'error' && (
                      <p className="text-red-400/80 text-xs">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === 'sending'}
                      className="w-full px-8 py-4 bg-[#E8710A] hover:bg-[#d4670a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-oswald tracking-[0.15em] uppercase transition-colors"
                    >
                      {formState === 'sending' ? 'Wird gesendet...' : 'Erstgespräch vereinbaren'}
                    </button>

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-4 h-px bg-white/10" />
                      <span className="text-xs text-white/40">Oder direkt schreiben:</span>
                      <a
                        href="mailto:hallo@pixyo.de"
                        className="text-xs text-[#E8710A]/60 hover:text-[#E8710A] transition-colors"
                      >
                        hallo@pixyo.de
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
