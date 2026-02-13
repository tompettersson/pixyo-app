'use client';

import { AnimatedSection } from './AnimatedSection';

const features = [
  {
    number: '01',
    title: 'Social Graphics',
    description:
      'KI-generierte Bilder und Text-Overlays in deinem Brand-Design. Instagram, LinkedIn, Stories — alle Formate.',
    capabilities: [
      'KI-Bildgenerierung',
      'Markenfonts & Farben',
      'Alle Social-Formate',
      'High-Res Export',
    ],
  },
  {
    number: '02',
    title: 'Product Scenes',
    description:
      'Produktfotos in neuen Szenen. Weißer Hintergrund wird zur fotorealistischen Kulisse — Produktidentität bleibt.',
    capabilities: [
      'Hintergrundtausch per KI',
      'Produkttreue erhalten',
      'Fotorealistische Szenen',
      'Shop- & Katalog-ready',
    ],
  },
];

export function FeatureShowcase() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <AnimatedSection>
          <div className="flex items-baseline gap-6 mb-16 sm:mb-24">
            <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/30">
              Werkzeuge
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        </AnimatedSection>

        {/* Feature grid */}
        <div className="space-y-0">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.number} delay={i * 0.15}>
              <div className="group grid md:grid-cols-12 gap-6 md:gap-8 py-12 sm:py-16 border-t border-white/[0.06] first:border-t-0">
                {/* Number */}
                <div className="md:col-span-1">
                  <span className="font-bebas-neue text-4xl sm:text-5xl text-[#E8710A]/60">
                    {feature.number}
                  </span>
                </div>

                {/* Title */}
                <div className="md:col-span-4">
                  <h3 className="font-bebas-neue text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
                    {feature.title}
                  </h3>
                </div>

                {/* Description + capabilities */}
                <div className="md:col-span-7 flex flex-col justify-between gap-8">
                  <p className="text-white/40 text-base sm:text-lg leading-relaxed max-w-lg font-light">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {feature.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs tracking-[0.15em] uppercase text-white/25 font-oswald"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
