'use client';

import { AnimatedSection } from './AnimatedSection';
import { WaitlistForm } from './WaitlistForm';

export function FinalCTA() {
  return (
    <section id="waitlist" className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="relative">
            {/* Large geometric accent */}
            <div className="absolute -top-16 -right-16 w-64 h-64 border border-[#E8710A]/[0.06] rotate-12 pointer-events-none" />

            <div className="max-w-2xl mx-auto text-center">
              <div className="w-12 h-px bg-[#E8710A]/40 mb-8 mx-auto" />
              <h2 className="font-bebas-neue text-5xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[0.9] mb-6">
                Sei dabei,
                <br />
                <span className="text-[#E8710A]">wenn es losgeht.</span>
              </h2>
              <p className="text-white/55 text-base sm:text-lg font-light max-w-md mx-auto leading-relaxed mb-10">
                Pixyo ist noch in Entwicklung. Trag dich ein und wir benachrichtigen dich, sobald du starten kannst.
              </p>

              <WaitlistForm source="final-cta" className="max-w-md mx-auto" />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* Original FinalCTA with contact form — restore when ready for full launch:

import { useState } from 'react';
import Link from 'next/link';

// ... (full contact form code was here, preserved in git history)

*/
