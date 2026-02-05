'use client';

import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';
import { WaitlistForm } from './WaitlistForm';

export function FinalCTA() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/20 via-violet-500/5 to-transparent" />
            <div className="absolute inset-[1px] rounded-3xl bg-zinc-950/90 backdrop-blur-xl" />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Bereit loszulegen?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Sichere dir jetzt deinen Platz auf der Warteliste und gehöre zu den Ersten, die Pixyo nutzen.
              </p>

              <WaitlistForm source="footer" className="max-w-sm mx-auto" />

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
                <span>Bereits Zugang?</span>
                <Link href="/handler/sign-in" className="text-violet-400 hover:text-violet-300 transition-colors">
                  Anmelden
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
