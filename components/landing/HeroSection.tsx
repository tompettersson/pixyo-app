'use client';

import { motion } from 'framer-motion';
import { WaitlistForm } from './WaitlistForm';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Geometric accent — large red circle, top right */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.06 }}
        transition={{ duration: 1.8, ease: 'easeOut', delay: 0.5 }}
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border-2 border-[#E8710A] pointer-events-none"
      />

      {/* Horizontal rule accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="absolute top-1/3 left-0 w-full h-px bg-white/[0.04] origin-left"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Large Pixyo Logo — the product front and center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="mb-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/pixyo.svg" alt="Pixyo" className="h-10 sm:h-14 md:h-20" />
        </motion.div>

        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-oswald text-xs sm:text-sm tracking-[0.3em] uppercase text-white/50 mb-6"
        >
          KI-Tools & digitale Werkzeuge für Marken
        </motion.p>

        {/* Main headline — Bebas Neue, massive */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-bebas-neue text-[clamp(4rem,15vw,13rem)] leading-[0.85] tracking-tight text-white"
          >
            Dein Design.
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-bebas-neue text-[clamp(4rem,15vw,13rem)] leading-[0.85] tracking-tight"
          >
            <span className="text-[#E8710A]">Deine</span>{' '}
            <span className="text-white">Marke.</span>
          </motion.h1>
        </div>

        {/* Bottom row: tagline + waitlist */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-end">
          {/* Left: tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="w-12 h-px bg-[#E8710A] mb-6" />
            <p className="text-base sm:text-lg text-white/65 max-w-md leading-relaxed font-light">
              KI-Kreativtools, die sich deinem Branding unterordnen.
              Nicht umgekehrt.
            </p>
          </motion.div>

          {/* Right: waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <p className="font-oswald text-xs tracking-[0.2em] uppercase text-white/45 mb-4">
              Warteliste
            </p>
            <WaitlistForm source="hero" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-white/20"
        />
      </motion.div>
    </section>
  );
}
