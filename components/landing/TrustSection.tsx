'use client';

import { AnimatedSection } from './AnimatedSection';

const logos = [
  {
    name: 'Hanako Koi',
    src: '/logos/HanakoKoiLogo-white.svg',
    className: 'h-8 sm:h-10',
    invert: false,
  },
  {
    name: '1001 Frucht',
    src: '/logos/1001frucht-black.svg',
    className: 'h-7 sm:h-9',
    invert: true,
  },
  {
    name: 'JOQORA',
    src: '/logos/joqora-logo.svg',
    className: 'h-6 sm:h-8',
    invert: false,
  },
  {
    name: 'Canton',
    src: '/logos/canton-logo.svg',
    className: 'h-5 sm:h-7',
    invert: false,
  },
  {
    name: 'elforyn',
    src: '/logos/elforyn-black.svg',
    className: 'h-6 sm:h-8',
    invert: true,
  },
  {
    name: 'BKT',
    src: '/logos/bkt-logo.svg',
    className: 'h-5 sm:h-7',
    invert: true,
  },
  {
    name: 'GovGuru',
    src: '/logos/govguru-logo.svg',
    className: 'h-6 sm:h-8',
    invert: true,
  },
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

              <div className="flex items-center flex-wrap justify-center gap-8 sm:gap-10">
                {logos.map((logo) => (
                  <div
                    key={logo.name}
                    className="opacity-50 hover:opacity-80 transition-opacity duration-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className={logo.className}
                      style={logo.invert ? { filter: 'invert(1)' } : undefined}
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
