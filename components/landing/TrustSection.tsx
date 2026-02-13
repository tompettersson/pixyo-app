'use client';

import { AnimatedSection } from './AnimatedSection';

const logos = [
  { name: 'Hanako Koi', src: '/logos/HanakoKoiLogo-white.svg', className: 'h-10 sm:h-14' },
  { name: '1001 Frucht', src: '/logos/1001frucht-black.svg', className: 'h-9 sm:h-12' },
  { name: 'JOQORA', src: '/logos/joqora-logo.svg', className: 'h-8 sm:h-11' },
  { name: 'Canton', src: '/logos/canton-logo.svg', className: 'h-7 sm:h-10' },
  { name: 'elforyn', src: '/logos/elforyn-black.svg', className: 'h-8 sm:h-11' },
  { name: 'BKT', src: '/logos/bkt-logo.svg', className: 'h-7 sm:h-10' },
  { name: 'GovGuru', src: '/logos/govguru-logo.svg', className: 'h-8 sm:h-11' },
];

export function TrustSection() {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="border-t border-b border-white/[0.10] py-10 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
              <span className="font-oswald text-xs tracking-[0.3em] uppercase text-white/40 shrink-0">
                Im Einsatz bei
              </span>

              <div className="flex items-center flex-wrap justify-center gap-8 sm:gap-12">
                {logos.map((logo) => (
                  <div
                    key={logo.name}
                    className="opacity-60 hover:opacity-90 transition-opacity duration-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className={logo.className}
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
