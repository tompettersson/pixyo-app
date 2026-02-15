'use client';

import { motion } from 'framer-motion';
import { BauhausCanvas } from './BauhausCanvas';
import { HeroSection } from './HeroSection';
import { ManifestoSection } from './ManifestoSection';
// Hidden sections — uncomment when ready for full launch:
// import { PortfolioSection } from './PortfolioSection';
// import { TestimonialSection } from './TestimonialSection';
// import { AgencySection } from './AgencySection';
// import { ServicesGrid } from './ServicesGrid';
import { PricingSection } from './PricingSection';
// import { TrustSection } from './TrustSection';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E8710A]/30 selection:text-white">
      {/* Bauhaus geometric background */}
      <BauhausCanvas />

      {/* Sticky Header — no login buttons until launch */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/60 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/pixyo.svg" alt="Pixyo" className="h-8 sm:h-9" />
        </div>
        {/* Login buttons hidden until launch
        <div className="flex items-center gap-4">
          <Link href="/handler/sign-in" className="px-5 py-2 text-[11px] font-oswald tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors duration-300">
            Anmelden
          </Link>
          <Link href="/handler/sign-in" className="px-5 py-2.5 text-[11px] font-oswald tracking-[0.2em] uppercase bg-[#E8710A] hover:bg-[#d4670a] text-white transition-colors duration-300">
            Pixyo testen
          </Link>
        </div>
        */}
      </motion.header>

      {/* Content */}
      <main className="relative z-10">
        {/* === PIXYO — Das Tool === */}
        <HeroSection />
        <ManifestoSection />
        <PricingSection />

        {/* Hidden until launch — needs client approval:
        <TestimonialSection />
        <TrustSection />
        <AgencySection />
        <ServicesGrid />
        <PortfolioSection />
        */}

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
