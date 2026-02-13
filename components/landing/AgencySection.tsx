'use client';

import { AnimatedSection } from './AnimatedSection';

export function AgencySection() {
  return (
    <section className="px-6 py-32 sm:py-40">
      <div className="max-w-7xl mx-auto">
        {/* Dramatic separator */}
        <AnimatedSection>
          <div className="flex items-center gap-8 mb-20 sm:mb-24">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="text-center mb-8">
            <span className="font-oswald text-xs tracking-[0.4em] uppercase text-[#E8710A]/70">
              Wer dahinter steckt
            </span>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <h2 className="font-bebas-neue text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-white tracking-tight leading-[0.85] text-center mb-12">
            Die Agentur
            <br />
            <span className="text-white/30">dahinter.</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-base sm:text-lg text-white/55 leading-relaxed font-light mb-6">
              Pixyo ist unser Werkzeug — aber dahinter steckt ein Team, das seit Jahren
              digitale Lösungen baut. Shopware-Plugins, KI-Integrationen, komplette
              Design-Systeme, SEO-Toolkits. Wir können alles bauen, was dein
              Unternehmen braucht.
            </p>
            <p className="text-base sm:text-lg text-white/55 leading-relaxed font-light">
              Von der einzelnen Idee bis zum kompletten digitalen Ökosystem.
              Geiles Design, geile User Experience, gebaut für Wirkung.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="flex items-center gap-8 mt-20 sm:mt-24">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
