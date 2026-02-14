'use client';

import { AnimatedSection } from './AnimatedSection';

const logos = [
  { name: 'F.A.Z. Selection', src: '/logos/faz-selection-logo.svg' },
  { name: 'Canton', src: '/logos/canton-logo.svg' },
  { name: 'JOQORA', src: '/logos/joqora-logo.svg' },
  { name: '1001 Frucht', src: '/logos/1001frucht-black.svg' },
  { name: 'Hanako Koi', src: '/logos/HanakoKoiLogo-white.svg' },
  { name: 'Portobello', src: '/logos/portobello-logo.png' },
  { name: 'elforyn', src: '/logos/elforyn-black.svg' },
  { name: 'BKT', src: '/logos/bkt-logo.svg' },
  { name: 'MMShop24', src: '/logos/mmshop24-logo.png' },
  { name: 'GovGuru', src: '/logos/govguru-logo.svg' },
  { name: 'EGovC', src: '/logos/egovc-logo.svg' },
  { name: 'Shoptic', src: '/logos/shoptic-logo.svg' },
  { name: 'OMNIA', src: '/logos/omnia-logo.svg' },
  { name: 'kletterschuhe.de', src: '/logos/kletterschuhe-logo.svg' },
];

export function TrustSection() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="border-t border-b border-white/[0.10] py-12 sm:py-16">
            <div className="flex flex-col items-center gap-10">
              <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/40">
                Im Einsatz bei
              </span>

              <div className="flex items-center flex-wrap justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-10">
                {logos.map((logo) => (
                  <div
                    key={logo.name}
                    className="opacity-60 hover:opacity-90 transition-opacity duration-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[160px] object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
