'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { FeatureShowcase } from './FeatureShowcase';
import { HowItWorks } from './HowItWorks';
import { TrustSection } from './TrustSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sticky Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8" />
        <Link
          href="/handler/sign-in"
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700/50"
        >
          Anmelden
        </Link>
      </motion.header>

      {/* Sections */}
      <main>
        <HeroSection />
        <FeatureShowcase />
        <HowItWorks />
        <TrustSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
