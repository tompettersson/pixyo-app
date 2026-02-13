'use client';

import { AnimatedSection } from './AnimatedSection';

export function ManifestoSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-16 sm:mb-20">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/50">
              Manifest
            </span>
            <div className="flex-1 h-px bg-white/[0.10]" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="max-w-5xl">
            <h2 className="font-bebas-neue text-5xl sm:text-6xl md:text-8xl text-white tracking-tight leading-[0.9] mb-8">
              Digitale Werkzeuge.
              <br />
              <span className="text-[#E8710A]">Gebaut für Wirkung.</span>
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 mt-12">
            <div>
              <div className="w-12 h-px bg-[#E8710A]/40 mb-6" />
              <p className="text-base sm:text-lg text-white/60 leading-relaxed font-light max-w-lg">
                Social-Media-Grafiken per KI generieren. Produktfotos in neue Szenen setzen.
                Banner für 16 Plattformen gleichzeitig exportieren. Dein komplettes Designsystem
                an einem Ort verwalten. Alles brand-konform, alles sofort einsatzbereit.
              </p>
            </div>
            <div>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed font-light max-w-lg">
                Pixyo ersetzt teure Fotoshootings, endlose Designrunden und manuelle
                Formatanpassungen. Ein Tool, das sich deinem Branding unterordnet.
                Keine Templates. Keine Kompromisse. Kein Bullshit.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
