'use client';

import { motion } from 'framer-motion';
import { WaitlistForm } from './WaitlistForm';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      {/* Gradient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-violet-500/10 border border-violet-500/20 rounded-full"
        >
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          <span className="text-sm text-violet-300 font-medium">Bald verfügbar — Jetzt Platz sichern</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
            KI-Kreativtools
          </span>
          <br />
          <span className="text-white">für deine Marke</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Professionelle Social Media Grafiken und Produktszenen — generiert mit KI,
          gestaltet in deinem Brand-Design. In Minuten statt Stunden.
        </motion.p>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-md mx-auto"
        >
          <WaitlistForm source="hero" />
          <p className="mt-3 text-xs text-zinc-500">Kein Spam. Nur eine Nachricht zum Launch.</p>
        </motion.div>
      </div>
    </section>
  );
}
